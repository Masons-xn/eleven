/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-04-14 10:50:28
 * @LastEditors:
 */
import moment from "moment"
const dateFormat = (date: any = new Date()) => {
  return moment(date).format("YYYY-MM-DD HH:mm:ss")
}

const toLiteral = (str: string) => {
  var dict: { [x: string]: string } = { "\b": "b", "\t": "t", "\n": "n", "\v": "v", "\f": "f", "\r": "r", "?": "?" }
  if (str) {
    return str.replace(/([\\'"\b\t\n\v\f\r])/g, (_$0: string, $1: string) => {
      return "\\" + (dict[$1] || $1)
    })
  }
  return ""
}
const dataOrder = (arr: { data: any; key: any }) => {
  const data = JSON.parse(JSON.stringify(arr.data))
  // data.map(item => {
  //   item.sequence = Number(item[key])
  // })
  const key = arr.key
  data.sort((a: { [x: string]: any }, b: { [x: string]: any }) => {
    if (Number(a[key]) < Number(b[key])) {
      return -1
    } else if (a[key] === b[key]) {
      return 0
    }
    return 1
  })
  return data
}
export { dateFormat, toLiteral, dataOrder }
