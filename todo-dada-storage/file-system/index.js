"use strict"
const { extname } = require("path")
const { readdir, readFile } = require("fs").promises

exports.fetchAll = async () => {
  const files = (await readdir(__dirname))
    .filter(file => extname(file) === ".json")
  return Promise.all(
    files.map(file =>
      readFile(`${__dirname}/${file}`, "utf8").then(JSON.parse)
    )
  )
}
