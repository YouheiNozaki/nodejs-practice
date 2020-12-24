'use strict'
const express = require("express")
let todos = [
  { id: 1, title: "ネーム", completed: false},
  { id: 2, title: "下書き", completed: true}
]
const app = express()
app.use(express.json())

app.get("/api/todos", (req, res) => {
  if (!req.query.completed) {
    return res.json(todos)
  }

  const completed = req.query.completed === "true"
  res.json(todos.filter(todo => todo.completed === completed))
})

let id = 2
app.post("/api/todos", (req, res, next) => {
  const { title } = req.body
  if (typeof title !== "string" || !title) {
    const err = new Error(' title is required')
    err.statusCode = 400
    return next(err)
  }

  const todo = { id: id += 1, title, completed: false}
  todos.push(todo)
  res.status(201).json(todo)
})

app.use('/api/todos/:id(\\d+)', (req, res, next) => {
  const targetId = Number(req.params.id)
  const todo = todos.find(todo => todo.id === targetId)
  if (!todo) {
    const err = new Error("ToDo not found")
    err.statusCode = 404
    return nextt(err)
  }

  req.todo = todo
  next()
})

app.route("/api/todos/:id(\\d+)/completed")
  .put((req, res) => {
    req.todo.completed = true
    res.json(req.todo)
  })
  .delete((req, res)=> {
    req.todo.completed = false
    res.json(req.todo)
  })

app.delete('/api/todos/:id(\\d+)', (req, res)=> {
  todos = todos.filter(todo => todo !== req.todo)
  res.status(204).end()
})


app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({ error: err.message })
})

app.listen(3000)


const next = require("next")
const dev = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })

nextApp.prepare().then(
  () => app.get("*", nextApp.getRequestHandler()),
  err => {
    console.error(err)
    process.exit(1)
  }
)
