"use strict"
const { Worker } = require("worker_threads")

module.exports = class ThreadPool {
  availableWorkers = []
  queue = []
  constructor(size, filePath, options) {
    for (let i = 0; i < size; i++) {
      this.availableWorkers.push(new Worker(filePath, options))
    }
  }

  executeInthread(arg) {
    return new Promise(resolve => {
      const request = { resolve, arg }

      const worker = this.availableWorkers.pop()
      worker ? this.process(worker, request) : this.queue.push(request)
    })
  }

  process(worker, {resolve, arg}) {
    worker.once("message", result => {
      resolve(result)

      const request = this.queue.shift()
      request
        ? this.process(worker, request)
        : this.availableWorkers.push(worker)
    })
    worker.postMessage(arg)
  }
}
