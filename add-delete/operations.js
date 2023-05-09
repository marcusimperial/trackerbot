import { MongoClient } from "mongodb";
import fetch from 'node-fetch';

const uri = process.env.MONGODB_URI;
const database = process.env.MONGODB_DATABASE_NAME;
const collection = process.env.MONGODB_COLLECTION_NAME;

export const getPlayerId = async (player) => {
    try {
        const req = await fetch(`https://api.mojang.com/users/profiles/minecraft/${player}`);
        const res = await req.json();
        if(res) return res.id;
        else return false;
    } catch (e) {
        return false;
    }
}

export const addPlayer = async (UUID) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await client.db(database).collection(collection).insertOne({UUID});
        if(result) return {added: true};
        else return false;
    } catch (e) {
        if(e.code === 11000) return {duplicate:true};
        else return false;
    } finally {
        client.close();
    }
}

export const deletePlayer = async (UUID) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = await client.db(database).collection(collection).deleteOne({UUID});
        if(result && result.deletedCount === 1) return true;
        else return false;
    } catch (e) {
        return false;
    } finally {
        client.close();
    }
}