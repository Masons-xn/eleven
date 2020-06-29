import { Path, Method } from "../decoratord";
import Service from "../../service/service";
import guid from "../../utils/guid";
import base from '../../db/init'
import { baseService } from '../adapter'

@Path('/model')
class Model extends Service {
  constructor() {
    super();
  }
  @Method('/query')
  get(param: any): any {
    const where = eval(param.where || [])
    let sqlWhere = ''
    if (where && where[0] && where[0].and && where[0].and[0] && where[0].and[0].modelId) {
      sqlWhere = ` where id = '${where[0].and[0].modelId}'`
    }
    var sql: string = `select * from pt_model ${sqlWhere}`
    return Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return {
        code: '200',
        message: '',
        result: {
          list: res.results
        }
      }
    })
  }
  @Method('/save')
  save(param: any): any {
    const data = eval(param.data || {})
    let rels: any = []
    let bases: any = []
    let sql: any = []
    let needDelPros: any = []
    let needDelRels: any = []
    let id = data.id
    if (data) {
      rels = data.rels
      bases = data.bases
      needDelPros = data.needDelPros
      needDelRels = data.needDelRels
    }
    if (data.stName && data.stTableName) {
      let modelSql: any = {}
      let baseSql: any = {}
      let relsSql: any = {}
      let err = ''
      if (id) {
        sql.push({
          sql: (_results?: any) => {
            return `delete from pt_model_basic_prop  where stModelId = '${id}'`
          }
        })
        modelSql = {
          sql: (_results?: any) => {
            return `update pt_model set stName = '${data.stName}', stTableName = '${data.stTableName}' where id = '${id}'`
          }
        }
      } else {
        id = guid()
        modelSql = {
          sql: (_results?: any) => {
            return `insert into pt_model (id,stName,stTableName) values ('${id}', '${data.stName}','${data.stTableName}')`
          }
        }
      }
      sql.push(modelSql)
      if (bases.length > 0) {
        let sqlbase = `insert into pt_model_basic_prop (id,createTime,updateTime,stName,stType,stColumnName,stlength,stModelId) values`
        let insertData: any = []
        bases.map((item: { id: any; createTime: any; updateTime: any; stName: any; stType: any; stColumnName: any; stlength: any; }) => {
          insertData.push(`('${item.id ? item.id : guid()}','${this.dateFormat(item.createTime)}','${this.dateFormat()}','${item.stName}','${item.stType}','${item.stColumnName}','${item.stlength}','${id}')`)
        })
        sqlbase += insertData.join(',') + ` on duplicate key update id=values(id),createTime=values(createTime),updateTime=values(updateTime),stName=values(stName),stColumnName=values(stColumnName),stlength=values(stlength),stModelId=values(stModelId)`
        baseSql = {
          sql: (_results: any) => {
            return sqlbase
          }
        }
        sql.push(baseSql)
      }
      if (rels.length > 0) {
        let refsql = `insert into pt_model_relation (id,createTime,updateTime,stSouModelID,stDestModelID,stName,inRelation) values`
        let insertData: any = []
        rels.map((item: { id: any; createTime: any; updateTime: any; stDestModelID: any; inRelation: any; stColumnName: any; stName: any; stDestName: any; }) => {
          if (!item.stDestModelID || !item.stName) {
            err = 'true'
          }
          if (item.inRelation === '1' && !item.id) {
            if (item.inRelation === '1') {
              insertData.push(`('${guid()}','${this.dateFormat(item.createTime)}','${this.dateFormat()}','${id}','${item.stDestModelID}','${item.stName}','1')`)
              insertData.push(`('${guid()}','${this.dateFormat(item.createTime)}','${this.dateFormat()}','${item.stDestModelID}','${id}','${item.stDestName}','0')`)
            }
          }
        })
        refsql += insertData.join(',') + `on duplicate key update id=values(id),createTime=values(createTime),updateTime=values(updateTime),stSouModelID=values(stSouModelID),stDestModelID=values(stDestModelID),stName=values(stName),inRelation=values(inRelation)`
        relsSql = {
          sql: (_results: any) => {
            return refsql
          }
        }
        if (insertData.length > 0) {
          sql.push(relsSql)
        }
      }
      if (needDelRels.length > 0) {
        needDelRels.map((item: { id: any; createTime: any; updateTime: any; stDestModelID: string; stSouModelID: string; inRelation: any; stColumnName: any; stName: any; }) => {
          sql.push({
            sql: (_results: any) => {
              return `delete from pt_model_relation where stDestModelID = "${item.stSouModelID}" and stSouModelID = "${item.stDestModelID}"`
            }
          })
          sql.push({
            sql: (_results: any) => {
              return `delete from pt_model_relation where stDestModelID = "${item.stDestModelID}" and stSouModelID = "${item.stSouModelID}"`
            }
          })
        })
      }
      if (needDelPros.length > 0) {
        let delsql = ''
        needDelPros.map((item: string) => {
          delsql += `"${item}",`
        })
        relsSql = {
          sql: (_results: any) => {
            return `delete from pt_model_basic_prop where id in (${delsql.substr(0, delsql.length - 1)})`
          }
        }
        sql.push(relsSql)
      }
      if (err) {
        return {
          data: {
            code: '200',
            message: '参数错误'
          }
        }
      }
      return Promise.resolve(this.Mysql.execTrans(sql)).then((_res) => {
        return {
          data: {
            code: '200',
            message: '成功'
          }
        }
      })
    }
  }
  @Method('/queryBase')
  queryBase(param: any): any {
    const where = eval(param.where || [])
    let sqlWhere = ''
    if (where && where[0] && where[0].and && where[0].and[0] && where[0].and[0].modelId) {
      sqlWhere = ` where stModelId = '${where[0].and[0].modelId}'`
    }
    var sql: string = `select * from pt_model_basic_prop ${sqlWhere}`
    return Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return {
        code: '200',
        message: '',
        result: {
          list: res.results
        }
      }
    })
  }
  @Method('/queryRel')
  queryRel(param: any): any {
    const where = eval(param.where || [])
    let sqlWhere = ''
    if (where && where[0] && where[0].and && where[0].and[0] && where[0].and[0].modelId) {
      sqlWhere = ` where stSouModelId = '${where[0].and[0].modelId}'`
    }
    var sql: string = `select * from pt_model_relation ${sqlWhere}`
    return Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return {
        code: '200',
        message: '',
        result: {
          list: res.results
        }
      }
    })
  }
  @Method('/delModel')
  del(param: any): any {
    const id = param.id
    let sql: any = []
    if (!id) {
      return {
        code: '500',
        message: "id 不能为空!"
      }
    }
    const select = `select stTableName from pt_model where id = '${id}'`
    const sqlmodel = `delete from pt_model where id = '${id}'`
    const sqlbase = `delete from pt_model_basic_prop where stModelId = '${id}'`
    const sqlrel = `delete from pt_model_relation where stSouModelID = '${id}' or stDestModelID = '${id}'`
    sql.push({
      sql: (_results: any) => {
        return select
      }
    })
    sql.push({
      sql: (_results: any) => {
        if (!_results || !_results[0]) {
          return 'error!'
        }
        return `drop table ${_results[0].stTableName}`
      }
    })
    sql.push({
      sql: (_results: any) => {
        return sqlrel
      }
    })
    sql.push({
      sql: (_results: any) => {
        return sqlbase
      }
    })
    sql.push({
      sql: (_results: any) => {
        return sqlmodel
      }
    })
    return Promise.resolve(this.Mysql.execTrans(sql)).then((_res) => {
      if (!_res.err) {
        return {
          code: '200',
          message: '删除成功！',
          result: {}
        }
      } else {
        return {
          code: '500',
          message: '删除失败！',
          result: {}
        }
      }
    })
  }
  @Method('/initModel')
  init(): any {
    return Promise.resolve(base()).then((_res) => {
      baseService()
      return {
        code: '200',
        message: '',
        result: {
        }
      }
    })
  }
}
export default new Model()
