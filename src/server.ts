import express from 'express'
import path from 'path'
import init from './db/init'
import router from './router/index'

var bodyParser = require('body-parser')

const server = express()
init()
server.use(express.json())
server.use('/public', express.static('public'))
server.use('/', router)
server.use('/static', express.static(path.join(__dirname, 'static')))
server.use(bodyParser.urlencoded({ extended: true }))
server.use((_error: any, _req: any, _res: any, _next: any) => {
  if (_error) {
    _res.json({ msg: _error.message, code: _error.code })
  }
})

export default server
