/**
 *
 *
 */
import { ModelBase, objectBase } from "./modelbase"
import { querylimitByPwoer, queryCountlimitByPwoer } from "../router/power"
const operatorer = (op: string | number) => {
  const operator: any = {}
  operator[1] = "="
  operator[2] = ">"
  operator[3] = ">="
  operator[4] = "<"
  operator[5] = "<="
  operator[6] = "<>"
  operator[7] = "like"
  operator[8] = "in"
  return operator[op]
}
interface condition {
  field: string
  value: any
  type: string
  operator: number
}
interface objectAny {
  [key: string]: objectBase
}
class QueryData extends ModelBase {
  private countsql = ""
  constructor(model: any, priModel: string, param: any) {
    super(model, priModel, param)
  }
  Query = () => {
    const rel = this.getQueryRelation(this.priModel, this.param?.path || [])
    const rels: any = []
    for (const item of rel) {
      if (rels.filter((re: { souModel: string; destModel: string }) => re.souModel === item.souModel && re.destModel === item.destModel).length === 0) {
        rels.push(item)
      }
    }
    this.relations = rels
    return Promise.resolve(this.queryData()).then((__res) => {
      if (__res.hasCount) {
        return Promise.resolve(this.queryCount()).then((_res) => {
          let count = _res.results[0]["count(1)"]
          return {
            code: "200",
            message: "",
            result: {
              total: count,
              list: __res.res,
            },
          }
        })
      } else {
        return {
          code: "200",
          message: "",
          result: {
            total: __res.res?.length || [],
            list: __res.res,
          },
        }
      }
    })
  }
  getLimit() {
    let limit = ``
    if (this.param && this.param.pageSize && this.param.page) {
      limit = ` limit ${this.param.pageSize * this.param.page - 1}, ${this.param.pageSize}`
    }
    if (this.getcondition(false) !== ` `) {
      limit = ``
    }
    return limit
  }
  getOrder() {
    let order = this.param?.order || []
    let orders = ` `
    if (order && order[0]) {
      order.map((ord: { field: any; action: any }) => {
        orders += `${ord.field} ${ord.action},`
      })
      orders = orders.substr(0, orders.length - 1)
    }
    return orders
  }
  splicingSql = (primty: string, rel: Array<any>): string => {
    let nSql = ""
    let baseField: string = this.modelFiled(primty).filed.join(",")
    let selectField: string = ``
    // let selectArea: string = `from (select * from ${primty} ${this.getcondition(true)} ${this.getOrder()} ${this.getLimit()}) as ${this.getModelWord(primty)}`
    let selectArea = `from ${primty} as ${this.getModelWord(primty)}`
    const destAll: string[] = []
    rel.map((item) => {
      let destName = item.destModel
      let soulName = item.souModel
      //  当子模型存在多个关系时候 需要增加子查询 left jion 或出现重名报错
      //  子查询联合生成 as ModelWord
      //  查询结果方向解析的时候需要重新调整
      // if (destAll.indexOf(destName) > -1) {
      //   // return
      // }else{
      destAll.push(destName)
      if (item.inRelation === 1) {
        const info = this.modelFiled(destName, soulName)
        selectField += `,${info.filed.join(",")} ,${info.word}.${soulName}Id as ${this.getModelWord(destName, soulName)}_${soulName}Id`
        selectArea += ` left join ${destName} as ${this.getModelWord(destName, soulName)} on ${info.word}.${soulName}Id = ${this.getModelWord(soulName, destName)}.id`
      } else {
        const info = this.modelFiled(destName, soulName)
        selectField += `,${info.filed.join(",")}`
        baseField += `,${info.word}.${item.destModel}Id as ${this.getModelWord(soulName, destName)}_${destName}Id`
        selectArea += ` left join ${destName} as ${this.getModelWord(destName, soulName)} on ${this.getModelWord(soulName, destName)}.${destName}Id = ${this.getModelWord(destName, soulName)}.id`
      }
    })
    nSql = `select ${baseField} ${Array.from(new Set(selectField.split(","))).join(",")}  ${Array.from(new Set(selectArea.split("left"))).join("left")} `
    return nSql
  }
  queryCount = () => {
    let sql = `select count(1) from  ${this.priModel} as ${this.getModelWord(this.priModel)} ${this.getcondition(true)} ` + queryCountlimitByPwoer(this)
    if (this.countsql) {
      const index = this.countsql.indexOf("from")
      sql = "select count(1)" + this.countsql.substr(index, this.countsql.length - index)
    }
    return Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      return res
    })
  }
  queryData = () => {
    let sql = `select ${this.modelFiled(this.priModel).filed.join(",")} from  ${this.priModel} as ${this.getModelWord(this.priModel)}`
    let hasCount = true
    if (this.getcondition(false).length > 1) {
      hasCount = false
    }
    if (this.relations.length > 0) {
      let order = this.param.order || []
      let orders = ` `

      //
      sql = this.splicingSql(this.priModel, this.relations) + this.getcondition(true, true) + querylimitByPwoer(this)
      if (order && order[0]) {
        orders = `order by `
        order.map((ord: { field: any; action: any }) => {
          if (ord.field.indexOf(".") === -1) {
            orders += `${this.getModelWord(this.priModel)}.${ord.field} ${ord.action},`
          } else {
            const filds = ord.field.split(".")
            orders += `${this.getModelWord(filds[filds.length - 2])}.${filds[filds.length - 1]} ${ord.action},`
          }
        })
        orders = orders.substr(0, orders.length - 1)
      }
      if (!hasCount) {
        sql += this.getcondition(false)
      }
      this.countsql = sql
      sql += orders
    } else {
      sql += this.getcondition(true) + querylimitByPwoer(this) + `order by ${this.getModelWord(this.priModel)}.createTime desc ` + this.getOrder() + (hasCount ? this.getLimit() : "")
    }
    console.log(sql)
    return Promise.resolve(this.Mysql.exec(sql))
      .then((res) => {
        if (!res.results.err) {
          return { res: this.formatData(res.results), hasCount }
        } else {
          return { res: [], hasCount }
        }
      })
      .catch((res) => {
        return res
      })
  }
  getcondition = (pri: boolean, needAlias: boolean = false) => {
    let base = ` where 1=1 `
    let that = this
    const where = this.param?.where || []

    if (where && where[0]) {
      let search = where[0]
      for (let rel in where[0]) {
        const relarr: Array<condition> = search[rel]
        for (let item of relarr) {
          let queryAlias = this.getModelWord(this.priModel)
          let field = item.field
          if (!pri) {
            if (item.field.indexOf(".") > 0) {
              queryAlias = getAliasByRelName(item.field.split(".")[0])
              field = item.field.split(".")[1]
              if (item.value && item.operator === 8) {
                base += ` ${rel} ${queryAlias}.${field} ${operatorer(item.operator)} ${item.value}`
              } else if (item.value && item.operator === 7) {
                base += ` ${rel} ${queryAlias}.${field} ${operatorer(item.operator)} '%${item.value}%'`
              } else {
                base += ` ${rel} ${queryAlias}.${field} ${operatorer(item.operator)} '${item.value}'`
              }
            }
          } else {
            if (item.field.indexOf(".") === -1) {
              if (item.value && item.operator === 8) {
                base += ` ${rel} ${needAlias ? queryAlias + "." + field : field} ${operatorer(item.operator)} ${item.value}`
              } else if (item.value && item.operator === 7) {
                base += ` ${rel} ${needAlias ? queryAlias + "." + field : field} ${operatorer(item.operator)} '%${item.value}%'`
              } else {
                base += ` ${rel} ${needAlias ? queryAlias + "." + field : field} ${operatorer(item.operator)} '${item.value}'`
              }
            }
          }
        }
      }
    }
    function getAliasByRelName(name: string) {
      let destName = ""
      for (let item of that.relations) {
        if (item.stName === name) {
          destName = item.destModel
          break
        }
      }
      return that.getModelWord(destName)
    }
    if (!pri) {
      base = base.substr(10, base.length - 10)
    }
    return base
  }
  formatData = (data: Array<any>) => {
    let newData: any = []
    let that = this
    let minData: any = {}
    if (data.length === 0) {
      return newData
    }
    data.forEach((item) => {
      let dataSplic = this.dataRelation(item)
      for (let key in dataSplic) {
        if (!minData[key]) {
          minData[key] = []
        }
        minData[key].push(dataSplic[key])
      }
    })
    let filterData: any = {}
    for (let key in minData) {
      let arr = minData[key]
      let obj: any = {}
      arr = arr.reduce((item: any[], next: any) => {
        obj[next.id] || !next.id ? "" : (obj[next.id] = true && item.push(next))
        return item
      }, [])
      filterData[key] = arr
    }
    let relations: any = this.relations.reverse()
    relations.map((item: any) => {
      filterData = assemble(filterData, item)
    })
    function assemble(
      data: any,
      rel: {
        souModel: string
        destModel: string
        stName: string
        inRelation: Number
      }
    ): any {
      let assembleData: any = JSON.parse(JSON.stringify(data))
      let sou = that.getModelWord(rel.souModel, rel.destModel)
      let dest = that.getModelWord(rel.destModel, rel.souModel)
      let key = rel.stName
      let destData = data[dest]
      let souData = data[sou]
      delete assembleData[dest]
      souData.map((item: any) => {
        if (rel.inRelation === 1) {
          item[key] = []
        } else {
          item[key] = {}
        }
      })
      if (rel.inRelation === 1) {
        souData.map((sour: any) => {
          destData.map((dest: { [x: string]: any }) => {
            if (sour.id === dest[`${rel.souModel}Id`]) {
              sour[key].push(dest)
            }
          })
        })
      } else {
        souData.map((sour: any) => {
          destData.map((dest: { [x: string]: any }) => {
            if (dest.id === sour[`${rel.destModel}Id`]) {
              sour[key] = dest
            }
          })
        })
      }
      assembleData[sou] = souData
      return assembleData
    }
    for (let key in filterData) {
      newData = filterData[key]
    }
    return newData
  }
  dataRelation = (itemData: objectAny) => {
    let data: objectAny = {}
    for (let key in itemData) {
      if (key.indexOf("_") > -1) {
        let prefix: string[] = key.split("_")
        let prefixKey = prefix[0]
        let prefixValue = prefix[1]
        if (data[prefixKey]) {
          data[prefixKey][prefixValue] = itemData[key]
        } else {
          let tempdata: objectBase = {}
          tempdata[prefixValue] = itemData[key]
          data[prefixKey] = tempdata
        }
      }
    }
    return data
  }
}

export default (a: any, b: string, c: any) => {
  let data = new QueryData(a, b, c).Query()
  return Promise.resolve(data).then((res) => {
    return res
  })
}
