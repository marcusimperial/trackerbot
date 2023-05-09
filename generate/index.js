import { MessageAttachment } from 'discord.js';
import { generateFile } from './process.js';

let checker = 0;

export const generate = async (text, client) => {
    if (checker === 1) return text.channel.send('This command is currently in progress.');
    checker = 1;
    const message = await text.channel.send('File generation started.');
    const channelToSend = client.channels.cache.find(channel => channel.id == process.env.DISCORD_FILE_CHANNEL_ID);
    const gen = await generateFile();
    checker = 0;
    if (gen.error) return message.edit(`Action failed. Reason: ${gen.message}`);
    let errors = [];
    for (const error of gen.results.errors) errors.push({ name: `Request Error UUID: ${error.id}`, value: error.message, inline: true });
    const file = new MessageAttachment(gen.string, `${process.env.GENERATE_FILE_NAME}`);
    const statsReport = {
        title: 'UPDATED LIST FILE',
        fields: [
            { name: 'Successful Requests', value: `${gen.results.successfulrequests} requests` },
            { name: 'Completion Time in Seconds', value: `${gen.results.completiontime} seconds` },
            ...errors
        ],
        timestamp: new Date()
    }
    channelToSend.send({ files: [file], embeds: [statsReport] });
    message.edit('File generation complete.');
}