/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2020-12-09 18:02:43
 * @LastEditors:
 */
import Mysql from "../db/db"
import { dateFormat, toLiteral } from "../utils/dateFormat"

class CustomError extends Error {
  code: string
  msg: string
  constructor(code: string, msg: string) {
    super(msg)
    this.code = code
    this.msg = msg
  }
}
class Service {
  Mysql: any
  dateFormat: Function
  toLiteral: Function
  constructor() {
    this.Mysql = Mysql
    this.dateFormat = dateFormat
    this.toLiteral = toLiteral
  }
  setError(code: string, msg: string) {
    throw new CustomError(code, msg)
  }
}
export default Service
