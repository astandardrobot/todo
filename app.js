"use strict";

const express = require("express");
const logger = require("morgan");
const debug = require("debug")("todo:app");
const db = require("./models/db");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const dotenv = require("dotenv");

dotenv.config();

db.initDb().then(() => {
  //Can't require out model until after our db is initalized
  const { generateTodo } = require("./models/todoModel");

  const apiRouter = require("./routes/api");

  //app represents the whole web application
  const app = express();

  //Set up the session store
  const store = new MongoDBStore({
    uri: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/ToDoApp?retryWrites=true&w=majority`,
    collection: "sessions",
  });

  store.on("error", (err) => {
    console.error(err);
  });

  //Set up the session middleware
  const sess = {
    secret: "SLU CS322 F21", //really should be random data stored in our .env file and changed freq. for security reasons
    store: store,
    resave: false,
    saveUninitialized: false,
  };

  //FIXME: We would need a lot more security in the real world
  app.use(session(sess));

  app.use(logger("dev"));

  //tell express to parse JSON from request bodies
  app.use(express.json());

  //Registered "middleware" to process static files
  //Living in the public directory
  app.use(express.static("public"));

  //add the handler for /api
  app.use("/api", apiRouter);

  //An endpoint is just a different url that the
  //user requested
  app.get("/", (req, res) => {
    //Redirect user to the todo page
    res.redirect("/todo.html");
  });

  app.get("/todo.json", (req, res) => {
    let todos = [];

    for (let i = 0; i < 10; i++) {
      todos.push(generateTodo());
    }
    res.json(todos);

    //res.json([generateTodo()]);
  });

  app.get("/hello.json", (req, res) => {
    if (req.session.hello) {
      res.json({
        message: "Welcome previous user!",
      });
    } else {
      req.session.hello = true;
      res.json({
        message: "Welcome first time user!",
      });
    }
  });

  app.get("/goodbye.json", (req, res) => {
    //Clears out session, both variables and id
    req.session.destroy();
    res.json({
      message: "Goodbye Client!",
    });
  });

  //Create a server from this application
  const server = app.listen(3000);
  server.on("listening", () => {
    debug(`Listening on ${server.address().port}`);
  });
});

