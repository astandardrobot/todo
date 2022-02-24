//Module to connect to the MongoDB instance

const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

//Fancy debug output package (Everything is prefixed with todo:db)
const debug = require("debug")("todo:db");

//Initalize dotenv
dotenv.config();

//Connection URL
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/Zip-Codes?retryWrites=true&w=majority`;

//represent the client
let _client;

//Two interface functions: Initialize db connect, get the database client
module.exports.initDb = async () => {
    //error checking
    if(_client){
        //give a warning and just return the client
        debug("Trying to init the DB again!");
        return _client;
    }

    _client = new MongoClient(url);

    await _client.connect();
    debug("Connected to MongoDb");
    return _client;
};

module.exports.getDb = () => {
    if(!_client){
        debug("Tried to access client before connecting");
        throw "Db has not been initialized, please call init first.";
    }

    return _client;
};