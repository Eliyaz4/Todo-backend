const mongodb = require('mongodb');
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
let db;
async function connect(oper, data){
    return new Promise(async (resolve, reject) => {
        try {
            await client.connect();
            console.log('Connected successfully to server');
            db = await client.db('eliyaz');
            return resolve(db);
        } catch(err) {
            return reject(err);
        }
    });
}

function key() {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

module.exports = {connect, key}