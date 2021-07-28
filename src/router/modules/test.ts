/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-03-12 10:55:25
 * @LastEditTime: 2021-04-01 20:22:05
 * @LastEditors:
 */
import { Path, Method } from "../decoratord"
import Service from "../../service/service"
import Axios from "axios"

// httpProxy = require("http-proxy")
let axios = Axios.create({})
@Path("/browser")
class Test extends Service {
  constructor() {
    super()
  }
  @Method("/perfData")
  test(param: any): any {
    return new Promise((reslove, _reject) => {
      reslove(
        axios({
          url: "http://10.2.6.94:12800/browser/perfData",
          method: "post",
          data: param,
        }).then((res) => {
          console.log(res)
          return res
        })
      )
    })
  }
  @Method("/tyyyyy")
  ss(): any {
    // 新建一个代理 Proxy Server 对象
    return {
      code: 999999,
      name: "成功！",
    }
  }
  @Method("/proxy")
  ddd(): any {
    const getObjType = (obj: any) => {
      const toString = Object.prototype.toString
      const map = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regExp",
        "[object Undefined]": "undefined",
        "[object Null]": "null",
        "[object Object]": "object",
      }
      return map[toString.call(obj)]
    }

    const orgData = {
      a: "1",
      b: "2",
      c: [3, 4, 5],
      q: {
        i: "4",
        u: "3 ",
      },
      d: [
        ["x", "y", "z"],
        {
          w: [44, 33, 22, 11],
          x: 6,
          y: {
            o: [
              {
                dd: "999",
              },
            ],
          },
          z: [
            {
              n: "7",
              m: "8",
            },
            {
              n: "6",
              m: "5",
            },
          ],
        },
      ],
    }
    const destData = new Map()
    const clap = (prefix: string, data: any) => {
      if (getObjType(data) === "array") {
        if (getObjType(data[0]) !== "array" && getObjType(data[0]) !== "object") {
          destData.set(`${prefix}`, data)
        } else {
          data.forEach((item: any, i: any) => {
            clap(`${prefix ? prefix + "-" : ""}Array${i}`, item)
          })
        }
      } else if (getObjType(data) === "object") {
        for (const key in data) {
          clap(`${prefix ? prefix + "-" : ""}${key}`, data[key])
        }
      } else {
        destData.set(`${prefix}`, data)
      }
    }
    const reOrgdata = {}
    const rebuild = (path: Array<string>, data: any, indicator: any) => {
      const key: string = path[0]
      const isArray = path[0].indexOf("Array") === 0
      if (isArray) {
        const arrayIndex: number = Number(path[0].replace("Array", ""))
        if (path.length === 1) {
          indicator[arrayIndex] = data
        } else {
          const subkey = path[1]
          if (subkey.indexOf("Array") === 0 && !indicator[arrayIndex]) {
            indicator[arrayIndex] = []
          } else if (!indicator[arrayIndex]) {
            indicator[arrayIndex] = {}
          }
          rebuild(path.slice(1, path.length), data, indicator[arrayIndex])
        }
      } else {
        indicator[key] ? "" : (indicator[key] = {})
        if (path.length === 1) {
          indicator[key] = data
        } else {
          const subkey = path[1]
          if (subkey.indexOf("Array") === 0) {
            getObjType(indicator[key]) === "array" ? "" : (indicator[key] = [])
          }
          rebuild(path.slice(1, path.length), data, indicator[key])
        }
      }
    }
    clap("", orgData)
    for (const [key, value] of destData.entries()) {
      rebuild(key.split("-"), value, reOrgdata)
    }
    console.log(orgData)
    console.log(reOrgdata)
    return {
      code: 100,
      name: reOrgdata,
    }
  }
}
export default new Test()
