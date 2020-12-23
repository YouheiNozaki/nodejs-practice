'use strict'
const http = require("http")
const cpuCount = require("os").cpus().length
const ThreadPool = require("../thread-pool")

const threadPool = new ThreadPool(cpuCount, `${__dirname}/fibonacci.js`)

http.createServer(async (req, res) => {
  const n = Number(req.url.substr(1))
  if (Number.isNaN(n)) {
    return res.end()
  }

  const result = await threadPool.executeInthread(n)
  res.end(result.toString())
}).listen(3000)
