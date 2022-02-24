//Handle all requests to "/api" urls

const express = require("express");
const router = express.Router();
const debug = require("debug")("todo:api_router");

const todoModel = require("../models/todoModel");

router.post("/add", async (req, res) => {
  //check for all fields in the todo object
  if (
    !["desc", "due", "priority"].every((ele) => req.body.hasOwnProperty(ele))
  ) {
    res.status(403);
    res.json({
      message: "Todo must have a due, desc, priority field",
    });
    return;
  }

  const due = new Date(req.body.due);
  const priority = req.body.priority.toLowerCase();

  //check for valid priority
  if (["normal", "high", "low"].indexOf(priority) === -1) {
    res.status(403);
    res.json({
      message: "priority is not valid",
    });
    return;
  }

  //check for valid due date
  if (isNaN(due.valueOf())) {
    res.status(403);
    res.json({
      message: "Due data is not valid",
    });
    return;
  }

  const insertedTodo = await todoModel.insertTodo({
    desc: req.body.desc,
    due: due,
    priority: priority,
  });
  insertedTodo.url = `/api/todo/${insertedTodo._id}`;

  res.json(insertedTodo);
});

// :id is a parameter that we can access as part of the request object
router.get("/todo/:id", async (req, res) => {
  try {
    //Pull the id param from the url
    const todo = await todoModel.getTodo(req.params.id);

    todo.url = `/api/todo/${req.params.id}`;
    res.json(todo);
  } catch (e) {
    res.status(403);
    res.json({
      message: "The get failed, check for correct ID.",
    });
  }
});

router.delete("/todo/:id", async (req, res) => {
  try {
    //pull the id param from url
    const todo = await todoModel.removeTodo(req.params.id);

    //Returns successful query but no content
    res.status(204);

    //Respond back with no body
    res.end();
  } catch (e) {
    res.status(403);
    res.json({
      message: "The delete failed",
    });
  }
});

router.get("/todo", async (req, res) => {
  try {
    const todoList = await todoModel.getAllTodos();
    res.json(
      todoList.map((t) => {
        t.url = `/api/todo/${t._id}`;
        return t;
      })
    );
  } catch (e) {
    res.status(403);
    res.json({
      message: "Something went wrong getting todos",
    });
  }
});

//We will export the router object
module.exports = router;

