'use strict'
const express = require("express")
let todos = [
  { id: 1, title: "ネーム", completed: false},
  { id: 2, title: "下書き", completed: true}
]
const app = express()

app.get("/api/todos", (req, res) => {
  if (!req.query.completed) {
    return res.json(todos)
  }

  const completed = req.query.completed === "true"
  res.json(todos.filter(todo => todo.completed === completed))
})

app.listen(3000)
