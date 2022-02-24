"use strict";

const argon2 = require("argon2");
const db = require("./db").getDb().db();
const collection = db.collection("users");
const sanitize = require("mongo-sanitize");

const argon_config = {
    type: argon2.argon2id,
    memoryCost: 15360 //in KiB
};

//Model for user creation and authentication

module.exports.createUser = async (username, password) => {
    //FIXME: Error check for username in database
    
    let user_data = {
        username: sanitize(username),
        password: await argon2.hash(password, argon_config)
    };

    const result = await collection.insertOne(user_data);

    user_data._id = result.insertedId;

    return user_data;
}

module.exports.validateUser = async (username, password) => {
    const user = await collection.findOne({
        username: sanitize(username)
    });

    const verify = await argon2.verify(user.password, password);
    return verify;
}