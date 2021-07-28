// import es from "event-stream"
import fs from "fs"
import now from "performance-now"
import readline from "readline"
import stream from "stream"

const datas: any[] = []
let header: any[] = []
//将计时器的开始设置为变量
export const doCsv = () => {
  const start = now()
  //将计时器的结尾设置为变量
  let lineCount = 0
  const end = now()
  console.log("start")
  const instream = fs.createReadStream("./public/csv/vertex.csv")

  const outstrem: any = new stream()

  var rl = readline.createInterface(instream, outstrem)
  rl.on("line", (_line: string) => {
    lineCount++
    if (lineCount === 0) {
      header = _line.split(",")
    } else {
      const data = {}
      const dataArr = _line.split(",")
      for (let i = 0; i < dataArr.length; i++) {
        data[header[i]] = dataArr[i]
      }
      datas.push(data)
    }
  })
  rl.on("close", () => {
    console.log(lineCount)
    console.log(datas.length)
    console.log(end - start)
  })

  //   fs.createReadStream("./public/csv/vertex.csv", { flags: "r" })
  //     .pipe(es.split())
  //     .pipe(
  //       es.map(function (line: any, cb: (arg0: null, arg1: any) => void) {
  //         //do something with the line
  //         // console.log(line)
  //         cb(null, line)
  //       })
  //     )
}
