const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find( user => user.username === username)

  if(!user) {
    response.status(404).send({ error: 'Mensagem do erro' })
  }

  request.user = user

  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  const userexists = users.find( user => user.username === username)

  if(userexists) {
    response.status(400).send({ error: 'User already exists!' })
  }  

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).send(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).send(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find( todo => todo.id === id)

  if(!todo) {
    response.status(404).send({ error: 'Todo not already exists!' })
  }   

  todo.title = title
  todo.deadline = deadline

  return response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find( todo => todo.id === id)

  if(!todo) {
    response.status(404).send({ error: 'Non-existent task' })
  }

  todo.done = !todo.done

  return response.status(201).send(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todoIndex = user.todos.findIndex( todo => todo.id === id)

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found for deleted!'});
  }  

  user.todos.splice(todoIndex, 1)

  return response.status(204).send(user)
});

module.exports = app;