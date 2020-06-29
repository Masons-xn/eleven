import Service from '../../service/service'
import { Path, Method } from '../decoratord'
import { innerService } from '../../service/init';
import mongo from '../../db/mongo'

@Path('/page')
class Test extends Service {
  constructor() {
    super();
  }
  @Method('/savePage')
  savePage(param: any): any {
    const params = {
      data: [param.base],
      sql: true
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
        }
      })
    })
    innerService['rbpage'].batchCascadeAdd(params).then((res: any) => {
      const getThings = (obj: string[]) => {
        for (let model of obj) {
          trans.push({
            sql: (_results?: any) => {
              try {
                return model
              } catch (e) {
                return {}
              }
            }
          })
        }
        return trans
      }
      Promise.resolve(this.Mysql.execTrans(getThings(res))).then(res => {
        if (!res.err) {
          console.log({ code: '200', data: res })
        } else {
          console.log({ code: '500', msg: '参数异常' })
        }
      })
    })
    if (!param.base._id) {
      return Promise.resolve(mongo.add("page", { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
        return { code: '200', data: _res }
      })
    } else {
      return Promise.resolve(mongo.update("page", { path: param.base.path }, { path: param.base.path, value: JSON.stringify(param.base) })).then((_res) => {
        return { code: '200', data: _res }
      })
    }
  }
  @Method('/query')
  queryPage(param: any): any {
    return Promise.resolve(mongo.find("page", { path: param.path })).then((_res) => {
      if (_res.length > 0) {
        const data = JSON.parse(_res[0].value)
        data._id = _res[0]._id
        return {
          result: data
        }
      } else {
        return {
          result: []
        }
      }
      return _res
    })
  }
}
export default new Test()
