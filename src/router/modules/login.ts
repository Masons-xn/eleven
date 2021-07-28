/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2020-12-28 10:07:25
 * @LastEditors:
 */
import Service from "../../service/service"
import { Path, Method } from "../decoratord"
import md5 from "md5"
import { getToken } from "../../service/token"
// import assert from "assert"
interface loginInfo {
  id: string
  username: string
  password: string
}
@Path("/login")
class Login extends Service {
  public base: string = ""
  public method: Array<any> | undefined
  constructor() {
    super()
  }
  @Method("/in")
  bbb(param: loginInfo): any {
    let username: string = param.username
    let password: string = param.password
    var sql: string = `select u.id, u.username, u.password, r.roleId from user as u left join userGroup as g on u.userGroupId = g.id left join roleGroup as r on r.userGroupId = g.id where u.username = "${username}"`
    return Promise.resolve(this.Mysql.exec(sql))
      .then((res) => {
        let users = res.results
        if (users && users.length > 0) {
          const user: loginInfo = users[0]
          const roles = users.map((role: { roleId: string }) => {
            return role.roleId
          })
          if (user.password === md5(password)) {
            return {
              code: "200",
              token: getToken({
                id: user.id,
                username: user.username,
                roles: roles,
              }),
            }
          } else {
            return {
              code: "500",
              message: "账号或者密码错误！",
            }
          }
        } else {
          return {
            code: "500",
            message: "账号或者密码错误！",
          }
        }
      })
      .catch((res) => {
        return res
      })
  }
  @Method("/out")
  aa(_param?: object): any {
    var sql: string = `select password from user where username = 'admin' `
    Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return res
    })
  }
  @Method("/getUserName")
  xxx(_param?: object): any {
    var sql: string = `select password from user where username = 'admin' `
    return Promise.resolve(this.Mysql.exec(sql)).then((_res) => {
      return {
        code: "200",
        realname: "admin",
      }
    })
  }
}
export default new Login()
