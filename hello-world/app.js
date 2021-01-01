'use strict'
require("express")()
  .get("/", (req, res) => res.send('Hello world'))
  .listen(process.env.PORT || 3000)
