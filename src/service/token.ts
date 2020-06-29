var jwt = require('jsonwebtoken')
interface payloadData {
  username: string
  id: string
}
const secret = 'token'
export function getToken(payload: payloadData): any {
  return jwt.sign(payload, secret, {
    expiresIn: "199999d",   //到期时间7d(7天) 12h  120=120ms 提供三种单位
  })
}
export function verify(token: any) {
  return jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return false
    }
    return { id: decoded.id, username: decoded.username }
  })
}
