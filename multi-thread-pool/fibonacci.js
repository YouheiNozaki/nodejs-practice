'use strict'
const fibonacci = require("../fibonacci")
const { parentPort } = require("worker_threads")

parentPort.on("message", n => parentPort.postMessage(fibonacci(n)))
