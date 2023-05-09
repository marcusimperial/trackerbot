import HttpsProxyAgent from 'https-proxy-agent';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DATABASE_NAME;
const collection = process.env.MONGODB_COLLECTION_NAME;

export const readDatabase = async () => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await client.db(database).collection(collection).find().toArray();
        if(result) return result;
        else return [];
    } catch (e) {
        console.log(e);
        return [];
    } finally {
        client.close();
    }
}

export const convertId = async (id, proxy) => {
    try {
        const proxyAuth = Buffer.from(`${proxy.user}:${proxy.pass}`).toString('base64');
        const proxyConfig = { 
            host: proxy.host,
            port: proxy.port,
            timeout: 5000,
            headers: { "Proxy-Authorization" : `Basic ${proxyAuth}` }
        }
        const proxyAgent = new HttpsProxyAgent(proxyConfig);
        const options = { agent: proxyAgent }
        const req = await fetch(`https://api.mojang.com/user/profiles/${id}/names`, options);
        const res = await req.json();
        if (res && res instanceof Array) return { success: true, name: res[res.length-1].name };
        return { error: true, message: 'Api Error', id };
    } catch (e) {
        console.log(e);
        return { error: true, message: 'Connection Error', id }
    }
}

export const readProxies = async () => {
    try {
        let proxies = [];
        const options = {
            headers: { Authorization: `Token ${process.env.WEBSHARE_PROXY_API_KEY}` }
        };
        const req = await fetch('https://proxy.webshare.io/api/proxy/list', options);
        const res = await req.json();
        for (const proxy of res.results) proxies.push({ user: proxy.username, pass: proxy.password, host: proxy.proxy_address, port: proxy.ports.http });
        return proxies;
    } catch (e) {
        console.log(e);
        return [];
    }
}