/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-05-07 14:26:38
 * @LastEditors:
 */
import Service from "../../service/service"
import { Path, Method } from "../decoratord"
import { innerService } from "../../service/init"
import { initPowers } from "../power"
// import assert from "assert"

@Path("/authorize")
class Login extends Service {
  public base: string = ""
  public method: Array<any> | undefined
  constructor() {
    super()
  }
  @Method("/submit")
  bbb(param: any): any {
    let trans: Array<any> = []
    const data = JSON.parse(JSON.stringify(param)).datas || []
    const params = {
      data: {
        datas: [JSON.parse(JSON.stringify(param)).datas],
      },
      sql: true,
    }
    innerService["power"].batchCascadeAdd(params).then((res: any) => {
      trans.push({
        sql: (_results?: any) => {
          try {
            return res[0]
          } catch (e) {
            return {}
          }
        },
      })
      ;(data.modelDatas || []).map((item: any) => {
        trans.push({
          sql: (_results?: any) => {
            try {
              return `select PowerId from ${data.modelName} where id = '${item.id}'`
            } catch (e) {
              return {}
            }
          },
        })
        trans.push({
          sql: (_results?: any) => {
            let orgids = _results[0].PowerId
            if (orgids) {
              orgids += "," + data.roleId
            } else {
              orgids = data.roleId
            }
            return `update ${data.modelName} set PowerId ='${orgids}' where id = '${item.id}'`
          },
        })
      })
    })
    return Promise.resolve(this.Mysql.execTrans(trans)).then((res) => {
      if (!res.err) {
        return { code: "200", data: res }
      } else {
        return { code: "500", data: res }
      }
    })
  }
  @Method("/queryModelDatas")
  asd(param: any) {
    const params = JSON.parse(JSON.stringify(param)).datas || {}
    const selection = params.where[0].and[0]
    const sql = `select count(1) from ${selection.modelName} where LOCATE('${selection.roleId}',PowerId) ${selection.isPowerd ? ">" : "="} 0`
    const sqllimit = `select * from ${selection.modelName} where LOCATE('${selection.roleId}',PowerId) ${selection.isPowerd ? ">" : "="} 0 limit ${params.pageSize * (params.page - 1)}, ${
      params.pageSize
    }`
    return Promise.resolve(this.Mysql.exec(sql)).then((counts) => {
      if (!counts.err) {
        let count = counts.results[0]["count(1)"]
        return Promise.resolve(this.Mysql.exec(sqllimit)).then((res) => {
          if (!res.err) {
            return { code: "200", result: { list: res.results, total: count } }
          } else {
            return { code: "500", data: res }
          }
        })
      } else {
        return { code: "500", data: counts }
      }
    })
  }
  @Method("/cancel")
  cancel(param: any) {
    const data = JSON.parse(JSON.stringify(param)).datas || []
    const selection = data.modelDatas[0]
    let trans: Array<any> = []
    trans.push({
      sql: (_results?: any) => {
        try {
          return `select PowerId from ${data.modelName} where id = '${selection.id}'`
        } catch (e) {
          return {}
        }
      },
    })
    trans.push({
      sql: (_results?: any) => {
        let orgids = _results[0].PowerId.split(",")
        orgids.splice(orgids.indexOf(selection.PowerId), 1)
        return `update ${data.modelName} set PowerId ='${orgids.join(",")}' where id = '${selection.id}'`
      },
    })
    return Promise.resolve(this.Mysql.execTrans(trans)).then((res) => {
      if (!res.err) {
        return { code: "200", data: res }
      } else {
        return { code: "500", data: res }
      }
    })
  }
  @Method("/init")
  init() {
    return Promise.resolve(initPowers()).then((res) => {
      if (!res.err) {
        return { code: "200", data: res }
      } else {
        return { code: "500", data: res }
      }
    })
  }
}
export default new Login()
