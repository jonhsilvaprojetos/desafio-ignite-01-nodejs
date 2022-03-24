const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const user = users.find(user => user.username === username);

    if(!user){
      return response.status(400).json({error: 'User not exists!'});
    }

    request.user = user;
    next();

}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: 'Already a user with that username'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get("/todos", checksExistsUserAccount, (request, response) => {
    const { todos } = request.user;
    return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const user = request.user;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { id } = request.params;
    const user = request.user;
    const todo = user.todos.some(todo => todo.id === id);

    if(!todo){
      return response.status(404).json({error: 'Todo not exists!'});
    }

    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    user.todos[todoIndex].title = title;
    user.todos[todoIndex].deadline = new Date(deadline);

    return response.send(user.todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todo = user.todos.some(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not exists!'});
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  user.todos[todoIndex].done = true

  return response.send(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todo = user.todos.some(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not exists!'});
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
