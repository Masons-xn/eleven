/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-03-23 18:09:39
 * @LastEditTime: 2021-04-07 10:11:40
 * @LastEditors:
 */
var zookeeper = require("node-zookeeper-client")
// import streamify from "stream-array"
import httpProxy from "http-proxy"
import { ServerResponse } from "http"
// import { getParam } from "../router/adapter"
const proxy = httpProxy.createProxyServer()
let setHeader = false

var CONNECTION_STRING = "127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183"
export const proxyCenter = (url: string, _req: any, _res: ServerResponse): any => {
  var zk = zookeeper.createClient(CONNECTION_STRING)
  zk.once("connected", () => {
    const getaway = "/getaway/" + url.split("/")[1]
    zk.exists(getaway, (_e: any, stat: any) => {
      if (stat) {
        zk.getChildren(getaway, function (error: { stack: any }, addressNodes: string | any[]) {
          if (error) {
            return
          }
          var size = addressNodes.length
          if (size === 0) {
            return
          }
          let addressPath = getaway + "/"
          if (size === 1) {
            addressPath += addressNodes[0]
          } else {
            addressPath += addressNodes[~~(Math.random() * size)]
          }
          zk.getData(addressPath, async (_err: any, serviceAddress: string) => {
            if (error) {
              return
            }
            const path = String(serviceAddress)
            console.log("目标地址:" + path + "," + url)
            if (!setHeader) {
              proxy.on("proxyReq", function (proxyReq, req: any) {
                if (req.body && req.complete) {
                  var bodyData = JSON.stringify(req.body)
                  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData))
                  proxyReq.write(bodyData)
                }
              })
              setHeader = true
            }

            let result: any = proxy.web(
              _req,
              _res,
              {
                target: path,
                timeout: 3000,
                changeOrigin: true,
                // ignorePath: true,
                headers: {
                  Connection: "keep-alive",
                  "Accept-Encoding": "gzip, deflate, br",
                  "Content-Type": "application/json;charset=utf-8",
                  "User-Agent": "nodejs",
                },
              },
              (_e) => {
                console.log("失败")
                result = {
                  code: 200,
                  message: "272727",
                }
              }
            )

            // proxy.on("proxyRes", function (proxyRes, _req, res) {
            //   let body: any = []
            //   proxyRes.on("data", function (chunk) {
            //     body.push(chunk)
            //   })
            //   proxyRes.on("end", function () {
            //     body = Buffer.concat(body).toString()
            //     console.log("res from proxied server:", body)
            //     res.end("my response to cli")
            //   })
            // })
            return result
          })
        })
      }
    })
  })
  zk.connect()
}
