import Mysql from '../db/db'
import dateFormat from '../utils/dateFormat'

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
  constructor() {
    this.Mysql = Mysql
    this.dateFormat = dateFormat
  }
  setError(code: string, msg: string) {
    throw new CustomError(code, msg)
  }
}
export default Service