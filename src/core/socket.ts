const ws = require("nodejs-websocket");

let socket: any
var server = () => {
  if (socket) {
    return socket
  }
  console.log("开始建立连接...")
  socket = ws.createServer((conn: any) => {
    conn.on("text", (str: string) => {
      console.log("收到的信息为:" + str)
      conn.sendText(str)
    })
    conn.on("close", function (_code: any, _reason: any) {
      console.log("关闭连接")
      console.log(_code, _reason)
    });
    conn.on("error", function (_code: any, _reason: any) {
      console.log(_code, _reason)
      console.log("异常关闭")
    });
  }).listen(4005)
  console.log("WebSocket建立完毕")
}

export default server