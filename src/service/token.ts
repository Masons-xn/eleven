/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2020-12-28 10:08:05
 * @LastEditors:
 */
var jwt = require("jsonwebtoken")
interface payloadData {
  username: string
  id: string
  roles: string[]
}
const secret = "token"
export function getToken(payload: payloadData): any {
  return jwt.sign(payload, secret, {
    expiresIn: "199999d", //到期时间7d(7天) 12h  120=120ms 提供三种单位
  })
}
export function verify(token: any) {
  return jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return false
    }
    return { id: decoded.id, username: decoded.username, roles: decoded.roles }
  })
}
