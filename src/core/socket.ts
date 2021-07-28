/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-04-21 11:16:30
 * @LastEditors:
 */

// const ws = require("nodejs-websocket")
const ws = require("ws")
var utf8 = require("utf8")
// var io = require("socket.io")(http)
var SSHClient = require("ssh2").Client
var io = require("socket.io")(4005)
io.on("connection", function (mysocket: { broadcast: { emit: (arg0: string) => void } }) {
  //emit to all but the one who started it
  mysocket.broadcast.emit("user connected")

  //emit to all sockets
  io.emit("myevent", { messg: "for all" })
})

function createNewServer(
  machineConfig: { msgId: any; ip: any; username: any; password: any },
  socket: { emit: (arg0: any, arg1: string) => void; on: (arg0: any, arg1: (data: any) => void) => void }
) {
  var ssh = new SSHClient()
  let { msgId, ip, username, password } = machineConfig
  ssh
    .on("ready", function () {
      socket.emit(msgId, "\r\n***" + ip + " SSH CONNECTION ESTABLISHED ***\r\n")
      ssh.shell(function (
        err: { message: string },
        stream: { write: (arg0: any) => void; on: (arg0: string, arg1: (d: any) => void) => { (): any; new (): any; on: { (arg0: string, arg1: () => void): void; new (): any } } }
      ) {
        if (err) {
          return socket.emit(msgId, "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n")
        }
        socket.on(msgId, function (data) {
          stream.write(data)
        })
        stream
          .on("data", function (d) {
            socket.emit(msgId, utf8.decode(d.toString("binary")))
          })
          .on("close", function () {
            ssh.end()
          })
      })
    })
    .on("close", function () {
      socket.emit(msgId, "\r\n*** SSH CONNECTION CLOSED ***\r\n")
    })
    .on("error", function (err: { message: string }) {
      socket.emit(msgId, "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n")
    })
    .connect({
      host: ip,
      port: 22,
      username: username,
      password: password,
    })
}
interface WS {
  send: (arg0: string) => void
  on: (arg0: string, arg1: (message: string) => void) => void
}
interface REQ {
  connection: { remoteAddress: any; remotePort: any }
}

let socket: any
var server = () => {
  if (socket) {
    return socket
  }
  socket = new ws.Server({ port: 4444 })
  socket.on("open", () => {})

  socket.on("close", () => {})
  socket.on("ready", () => {})

  socket.on("connection", (ws: WS, req: REQ) => {
    const ip = req.connection.remoteAddress
    const port = req.connection.remotePort
    const clientName = ip + port

    // ws.send("Welcome " + clientName)
    socket.on("createNewServer", function (machineConfig: { msgId: any; ip: any; username: any; password: any }) {
      //新建一个ssh连接
      createNewServer(machineConfig, socket)
    })
    ws.on("message", (message: string) => {
      socket.clients.forEach(function each(client: { readyState: number; send: (arg0: string) => void }) {
        if (client.readyState === 1) {
          client.send(clientName + " -> " + message)
        }
      })
    })
  })
}

export default server
