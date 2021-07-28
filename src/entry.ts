/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-03-25 13:42:57
 * @LastEditors:
 */
import logger from "./core/logger"
import secrets from "./core/secrets"
import server from "./server"
import uncaughtException from "./core/uncaughtException"
// import { doCsv } from "./core/csv"
// import zookeeper from "node-zookeeper-client"
// const client = zookeeper.createClient("localhost:2181")

// var proxy = httpProxy.createProxyServer()
// proxy.on("error", function (err, req, res) {
//   res.end() //输出空白响应数据~~
// })
// doCsv()
async function main() {
  console.clear()
  await server.listen({ port: secrets.PORT, host: secrets.HOST })
  console.log(`Running at http://${secrets.HOST}:${secrets.PORT}`)
  console.log("   ::::::    ::        ::::::   ::       ::   ::::::   :::   :: ")
  console.log("   ::        ::        ::        ::     ::    ::       ::::  :: ")
  console.log("   ::::::    ::        ::::::     ::   ::     ::::::   :: :: :: ")
  console.log("   ::        ::        ::          :: ::      ::       ::  :::: ")
  console.log("   ::::::    ::::::::  ::::::       ::        ::::::   ::   ::: ")
}
process.on("uncaughtException", function (err) {
  uncaughtException.error(JSON.stringify(err.stack))
  logger.error(JSON.stringify(err))
})

main()
