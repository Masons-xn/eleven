import Service from "../../service/service"
import { Path, Method } from "../decoratord"
import { innerService } from "../../service/init"
import mongo from "../../db/mongo"

@Path("/page")
class Test extends Service {
  constructor() {
    super()
  }
  @Method("/savePage")
  savePage(param: any): any {
    // const params = {
    //   data: param.base,
    //   sql: true,
    // }
    const needDel = JSON.parse(JSON.stringify(param)).needDel || []
    let trans: Array<any> = []
    needDel.map((item: any) => {
      trans.push({
        sql: (_results?: any) => {
          try {
            return `delete from ${item.path} where id = '${item.id}'`
          } catch (e) {
            return {}
          }
        },
      })
    })
    // innerService["rbpage"].batchCascadeAdd(params).then((res: any) => {
    //   const getThings = (obj: string[]) => {
    //     for (let model of obj) {
    //       trans.push({
    //         sql: (_results?: any) => {
    //           try {
    //             return model
    //           } catch (e) {
    //             return {}
    //           }
    //         },
    //       })
    //     }
    //     return trans
    //   }
    //   Promise.resolve(this.Mysql.execTrans(getThings(res))).then((res) => {
    //     if (!res.err) {
    //       console.log({ code: "200", data: res })
    //     } else {
    //       console.log({ code: "500", msg: "参数异常" })
    //     }
    //   })
    // })
    if (!param.base._id) {
      return Promise.resolve(mongo.add("page", { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
        if (_res.result && _res.result.ok === 1) {
          return { code: "200", data: _res }
        } else {
          return { code: "500", data: _res }
        }
      })
    } else {
      return Promise.resolve(mongo.update("page", { path: param.base.path }, { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
        if (_res.result && _res.result.ok === 1) {
          return { code: "200", data: _res }
        } else {
          return { code: "500", data: _res }
        }
      })
    }
  }
  @Method("/saveDashboard")
  saveDashboard(param: any): any {
    const params = {
      data: [param.data],
      sql: true,
    }
    const needDel = JSON.parse(JSON.stringify(param)).needDel || []
    let trans: Array<any> = []
    needDel.map((item: any) => {
      trans.push({
        sql: (_results?: any) => {
          try {
            return `delete from ${item.path} where id = '${item.id}'`
          } catch (e) {
            return {}
          }
        },
      })
    })
    return innerService["dashboard"].batchCascadeAdd(params).then((res: any) => {
      const getThings = (obj: string[]) => {
        for (let model of obj) {
          trans.push({
            sql: (_results?: any) => {
              try {
                return model
              } catch (e) {
                return {}
              }
            },
          })
        }
        return trans
      }
      return Promise.resolve(this.Mysql.execTrans(getThings(res))).then((res) => {
        if (!res.err) {
          // console.log({ code: "200", data: res })
          return { code: "200", data: res }
        } else {
          // console.log({ code: "500", msg: "参数异常" })
          return { code: "500", data: res }
        }
      })
    })
    // if (!param.base._id) {
    //   return Promise.resolve(mongo.add("page", { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
    //     if (_res.result && _res.result.ok === 1) {
    //       return { code: "200", data: _res }
    //     } else {
    //       return { code: "500", data: _res }
    //     }
    //   })
    // } else {
    //   return Promise.resolve(mongo.update("page", { path: param.base.path }, { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
    //     if (_res.result && _res.result.ok === 1) {
    //       return { code: "200", data: _res }
    //     } else {
    //       return { code: "500", data: _res }
    //     }
    //   })
    // }
  }
  @Method("/query")
  queryPage(param: any): any {
    if (param.path) {
      return Promise.resolve(mongo.find("page", { path: param.path })).then((_res) => {
        if (_res.length > 0) {
          const data = JSON.parse(_res[0].value)
          data._id = _res[0]._id
          return {
            result: data,
          }
        } else {
          return {
            result: [],
          }
        }
        return _res
      })
    } else {
      return Promise.resolve(mongo.find("page", {})).then((_res) => {
        if (_res.length > 0) {
          _res.map((item: any) => {
            const data = JSON.parse(item.value)
            for (let i in data) {
              if (i !== "id" && i !== "_id") {
                item[i] = data[i]
              }
            }
          })
          return {
            result: { list: _res },
          }
        } else {
          return {
            result: [],
          }
        }
        return _res
      })
    }
  }
  @Method("/remove")
  remove(param: any): any {
    return { code: "500", data: "", msg: "造点数据不易，手下留情" }
    if (param.data) {
      return Promise.resolve(mongo.remove("page", { path: param.data })).then((_res) => {
        return { code: "200", data: _res }
      })
    } else {
      return { code: "500", data: "参数错误" }
    }
  }
}
export default new Test()
