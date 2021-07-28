/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-05-11 19:38:22
 * @LastEditors:
 */
import express from "express"
import path from "path"
import init from "./db/init"
import router from "./router/index"
// import { proxyCenter } from "./core/gateway"
var bodyParser = require("body-parser")
// import { aql } from "arangojs"
// import { arangoQuery, test } from "./db/arango"
// import { kafkaTest } from "./middleware/kafka"
const server = express()
init()
// kafkaTest()
// arangoQuery("frenchCity", (collection: any) => {
//   return aql`FOR pokemon IN ${collection} RETURN pokemon`
// }).then((res) => {
//   // (res as any).flatMap((pokemon: any) => {
//   //   console.log(pokemon)
//   // })
//   return res
//   // server.use("*", function (_req, _res, next) {
//   //   //设置允许跨域的域名，*代表允许任意域名跨域

//   //   next()
// })
// test()
server.use(express.json())
server.use("/public", express.static("public"))
server.use("/", router)
// server.all("*", (req, res) => {
//   return proxyCenter(req, res)
// })

server.use("/static", express.static(path.join(__dirname, "static")))
server.use(bodyParser.urlencoded({ extended: true }))
server.use((_error: any, _req: any, _res: any, _next: any) => {
  if (_error) {
    _res.json({ msg: _error.message, code: _error.code })
  }
})

export default server
