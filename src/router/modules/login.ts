import Service from '../../service/service'
import { Path, Method } from '../decoratord'
import md5 from 'md5'
import { getToken } from '../../service/token'
import assert from 'assert'
interface loginInfo {
  id: string
  username: string
  password: string
}
// interface accountInfo {
//   guid: string
//   username: string
//   password: string
// }

@Path('/login')
class Login extends Service {
  public base: string = '123123'
  public method: Array<any> | undefined;
  constructor() {
    super();
  }
  @Method('/in')
  bbb(param: loginInfo): any {
    let username: string = param.username
    let password: string = param.password
    var sql: string = `select * from account where username = "${username}"`
    return Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      let users = res.results
      if (users && users.length > 0) {
        let user: loginInfo = users[0]
        if (user.password === md5(password)) {
          return {
            code: '200',
            token: getToken({
              id: user.id,
              username: user.username
            })
          }
        }
        else {
          return {
            code: '500',
            message: '账号或者密码错误！'
          }
        }
      } else {
        return {
          code: '500',
          message: '账号或者密码错误！'
        }
      }
    }).catch(res => {
      return res
    })
  }
  @Method('/out')
  aa(param?: object): any {
    console.log(param)
    function add(a: number, b: number) {
      return a + b
    }
    var expect = add(1, 2);
    assert(expect === 3, '预期1加2等于3')
    var sql: string = `select password from user where username = 'admin' `
    Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return res
    })
  }
}
export default new Login()
