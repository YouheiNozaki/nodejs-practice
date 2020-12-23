'use strict'
const { Worker, threadId } = require("worker_threads")

console.log('メインスレッド', threadId)

const cpuCount = require("os").cpus().length

for (let i = 0; i < cpuCount; i++) {
  const worker = new Worker(`${__dirname}/web-app.js`)
  console.log("サブスレッド", worker.threadId)
}
