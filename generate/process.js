import util from 'util';
import { convertId, readDatabase, readProxies } from './operations.js';

export const generateFile = async () => {
    try {
        let string;
        // API and Proxy Configurations 
        const requestLimit = parseInt(process.env.MOJANG_API_LIMIT); // API's Request Limit, formerly interval
        const requestTimeout = parseInt(process.env.MOJANG_API_TIMEOUT); // API's Timeout for Requests in Seconds, formerly timeout
        let concurrencyLimit = parseInt(process.env.WEBSHARE_PROXY_CONCURRENCY_LIMIT); // Proxy's Concurrency Limit (Simultaenous Opened Requests), formerly batchlimit
        // API and Proxy Data
        const input = await readDatabase(); // Array Returning All Inputs
        const proxies = await readProxies(); // Array Returning All Proxies 
        // Process Calculations
        let requestBatches = Math.ceil(requestLimit/concurrencyLimit); // Total # of Batches for Each Proxy Rounded Up 
        let proxiesInUsage = proxies.length; // Total of # of Proxies to Use 
        let totalRequests = input.length; // Total of # of Requests to Process
        const proxyGroups = Math.ceil(totalRequests/requestLimit); // Total # of Request Groups Rounded Up
        const totalCycles = Math.ceil(proxyGroups/proxiesInUsage); // Total # of Executions for the Request Groups Rounded Up
        // Process Declarations 
        let requestPromises = []; // Array to Hold All Pending Requests
        let processErrors = []; // Object to Hold All Process Analytics
        let processResults = {}; // Object to Hold All Process Results
        const errorThreshold = parseInt(process.env.GENERATE_ERROR_LIMIT); // Total # of Errors Allowed
        const startingTime = Date.now(); // Timestamp of the Start of the Process
        let firstProxyTime = startingTime // Timestamp for the Start of the 2nd Proxy and the end of 1st Proxy, Defaults to the Timestamp of the Process
        // Cycle Process
        for (let cycle = 0; cycle < totalCycles; cycle++){ // Represents a Loop Through All Available Proxies
            const cycleStartingTime = Date.now(); // Timestamp of the Start of the Process for the Cycle
            console.log(`Current Cycle: ${cycle}`);
            if (cycle > 0){ // Applying the Timeout for Cycles 1 to N
                const cycleTimeout = (requestTimeout*1000)-(Date.now()-firstProxyTime); // The Actual Timeout Deducted by the Process Time of Proxies 1 to N
                console.log(`Timeout: ${cycleTimeout/1000}s`);
                await util.promisify(setTimeout)(cycleTimeout);
            }
            // Adjustments If the Data is Lesser than the Capacity 
            if (proxyGroups < proxiesInUsage) proxiesInUsage = proxyGroups; // If the # of Request Groups is Lesser Than the Available Proxies 
            if (totalRequests < requestLimit) requestBatches = Math.ceil(totalRequests/concurrencyLimit); // If the Total # of Requests is Lesser than the API Limit
            if (requestLimit < concurrencyLimit) concurrencyLimit = requestLimit;
            // Proxy Process
            for (let proxy = 0; proxy < proxiesInUsage; proxy++){ // Represents a Loop Through All Batches Needed Per Proxy
                const proxyStartingTime = Date.now(); //Timestamp of the Start of the Process for the Proxy
                console.log(`Current Proxy: ${proxies[proxy].host}:${proxies[proxy].port}`);
                if (proxy === 1) firstProxyTime = Date.now(); // Represents the End of Execution for the First Proxy
                // Batch Calculations
                const currentRange = (proxiesInUsage*cycle) + proxy; // Current Range in Process
                const proxyRequestsStart= currentRange*requestLimit; // Start of Requests for the Proxy
                const proxyRequestsEnd = proxyRequestsStart+requestLimit; // End of Requests for the Proxy
                // Adjustments If the Data is Lesser than the Capacity
                if (proxyRequestsEnd > totalRequests) requestBatches = Math.ceil((totalRequests-proxyRequestsStart)/concurrencyLimit); // If the End Number of the Proxy is Greater Than the Total Requests
                // Batch Process
                for (let batch = 0; batch < requestBatches; batch++){
                    const batchStartingTime = Date.now(); // Timestamp of the Start of the Process for the Batch
                    const currentBatch = batch*concurrencyLimit; // Current Batch in the Proxy
                    let batchRequestsStart = proxyRequestsStart + currentBatch; // Start of Requests for the Batch
                    let batchRequestsEnd = batchRequestsStart + concurrencyLimit; // End of Requests for the Batch 
                    // Adjustments If the Data is Lesser than the Capacity
                    if (batchRequestsEnd > totalRequests) batchRequestsEnd = totalRequests; // If the End Number of the Batch is Greater Than the Total Requests
                    console.log(`Starting requests ${batchRequestsStart} to ${batchRequestsEnd}`);
                    // Request Process
                    for (let request = batchRequestsStart; request < batchRequestsEnd; request++){
                        const requestPromise = convertId(input[request].UUID, proxies[proxy]); // Opens a Request as a Promise
                        requestPromises.push(requestPromise); // Pushes Promise to the Promise Array
                    }
                    const resolvedPromises = await Promise.all(requestPromises); // Resolving All Batch Promises
                    for (let resolvedPromise = 0; resolvedPromise < resolvedPromises.length; resolvedPromise++){
                        const output = resolvedPromises[resolvedPromise]; // Each Resolved Promise as an Output
                        if (output.success) string += `${output.name}\n` // If the Output is Successful, Write it to the File
                        else if (output.error) processErrors.push(output); // If the Output Has an Error, Push it to the Error Array
                        else return { error: true, message: output.message }; // If an Unknown or Fatal Error, Stop the Process
                    }
                    const batchCompletionTime = (Date.now()-batchStartingTime)/1000; // Total Time for the Batch
                    console.log(`Completion Time for Batch ${batch}: ${batchCompletionTime}s`);
                    requestPromises.length = 0; // Reset the Array for the Next Batch
                    if (processErrors.length > errorThreshold) return { error: true, message: 'Threshold reached.'}; // If the Errors Reach the Threshold, Stop the Process            
                }
                const proxyCompletionTime = (Date.now()-proxyStartingTime)/1000; // Total Time for the Proxy
                console.log(`Completion Time for Proxy ${proxy}: ${proxyCompletionTime}s`);
            }
            const cycleCompletionTime = (Date.now()-cycleStartingTime)/1000; // Total Time for the Cycle
            console.log(`Completion Time for Cycle ${cycle}: ${cycleCompletionTime}s`);
        }
        const completionTime = (Date.now()-startingTime)/1000; // Total Completion Time
        console.log(`Completion Time for Process: ${completionTime}s`);
        // Transmit Data Results
        processResults.successfulrequests = totalRequests-processErrors.length; // Transmit # of Successful Requests
        processResults.completiontime = completionTime; // Transmit Total Completion Time
        processResults.errors = processErrors; // Transmit # of Errors 
        return { success: true, results: processResults, string: Buffer.from(string, 'utf-8')};
    } catch {
        return { error: true, message: 'Process error.'}
    }
}