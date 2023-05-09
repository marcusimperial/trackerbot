import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { sendMessage } from './add-delete/index.js';
import { generate } from './generate/index.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '.';

client.on('messageCreate', async (text) => {
    if(!text.content.startsWith(prefix) || text.author.bot) return; // If the text does not start with the prefix or is authored by the bot
    let args = text.content.slice(prefix.length).split(/ +/); // Splitting the text into an array
    if(/\r|\n/.exec(args[0])) args = args[0].split(/\r|\n/);
    if(!args[0] || (args[0] === "d" && !args[1])) return;
    if(args[0] === "d") for (let player of args.slice(1)) sendMessage(text, player, "d");
    else if (args[0] === "c") generate(text, client);
    else for (let player of args) sendMessage(text, player, "a");
});

client.login(process.env.DISCORD_TOKEN);