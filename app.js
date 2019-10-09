const express = require('express')
const app = express()
const router = require('./routes/router')
const bodyParser = require('body-parser')
const path = require("path")

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



app.use(router)

app.listen(8888, () => {
  console.log("running...")
})



