import { getPlayerId, addPlayer, deletePlayer } from './operations.js';

export const sendMessage = async (text, player, type) => {
    const responses = {
        apiFailure:" is an invalid name or there was an error with the Mojang API. Please try again later.",
        delSuccess:" has been successfully deleted.",
        delFailure:" does not exist in the database or an error occured. Please try again later.",
        addSuccess:" has been successfully added.",
        addDuplicate: " already exists in the database.",
        addFailure:" There was an error with the database. Please try again later.",
    }
    const message = await text.channel.send(`Processing Request for **${player}**`);
    let playerId;
    if(player.length !== 32) {
        const id = await getPlayerId(player);
        if (!id) return message.edit(`**${player}** ${responses.apiFailure}`);
        playerId = id; 
    } else playerId = player;
    switch (type) {
        case "d": 
            const del = await deletePlayer(playerId);
            if(del) message.edit(`**${player}** ${responses.delSuccess}`);
            else message.edit(`**${player}** ${responses.delFailure}`);
            break;
        default: 
            const add = await addPlayer(playerId);
            if(add && add.added) message.edit(`**${player}** ${responses.addSuccess}`);
            else if(add && add.duplicate) message.edit(`**${player}** ${responses.addDuplicate}`);
            else message.edit(`**${player}** ${responses.addFailure}`);
    }
}