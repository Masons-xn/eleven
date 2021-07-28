import { ModelBase } from "./modelbase"
import guid from "../utils/guid"

class Add extends ModelBase {
  constructor(model: any, priModel: string, param: any) {
    super(model, priModel, param)
  }
  addData() {
    const datas = this.getDatas()
    if (JSON.parse(JSON.stringify(this.param)).sql || false) {
      return new Promise((reslove, _reject) => {
        reslove(this.getSqls(datas))
      })
    }
    const things = this.getThings(datas)
    return Promise.resolve(this.Mysql.execTrans(things)).then((res) => {
      if (!res.err) {
        return {
          code: "200",
          data: res,
        }
      } else {
        return {
          code: "500",
          error: "",
          msg: "参数异常",
        }
      }
    })
  }
  getSqls(obj: any) {
    let trans: Array<any> = []
    for (let model in obj) {
      if (obj[model] && obj[model].length > 0) {
        trans.push(this.saveModel(model, obj[model]))
      }
    }
    return Promise.resolve(trans)
  }
  getThings(obj: any) {
    let trans: Array<any> = []
    for (let model in obj) {
      let that = this
      if (obj[model] && obj[model].length > 0) {
        trans.push({
          sql: (_results?: any) => {
            try {
              return that.saveModel(model, obj[model])
            } catch (e) {
              return {}
            }
          },
        })
      }
    }
    return trans
  }
  getDatas() {
    const params = JSON.parse(JSON.stringify(this.param)).data
    const data = params.datas || []
    if (data.length === 0) {
      for (let i in this.param) {
        if (typeof this.param[i] === "object") {
          data.push(this.param[i])
        }
      }
    }
    let that = this
    let Datakeys: any = {}
    const tilingData = (data: any, _model: string) => {
      if (!Datakeys[_model]) {
        Datakeys[_model] = []
      }
      if (data && Array.isArray(data)) {
        data.map((item: any) => {
          for (let key in item) {
            if (!item[`id`]) {
              item[`id`] = guid()
            }
            let rel = getRelByRelName(_model, key)
            if (rel.length > 0) {
              if (typeof item[key] === "object" && !Array.isArray(item[key])) {
                Datakeys[rel[0].destModel] = []
                if (!item[key].id) {
                  const ids = guid()
                  item[rel[0].destModel + "Id"] = ids
                  item[key].id = ids
                }

                tilingData(item[key], rel[0].destModel)
                delete item[key]
              } else if (typeof item[key] === "object" && Array.isArray(item[key])) {
                let child = item[key]
                child.map((ch: any) => {
                  if (!ch.id) {
                    ch.id = guid()
                  }
                  if (!ch[`${rel[0].souModel}Id`]) {
                    ch[`${rel[0].souModel}Id`] = item[`id`]
                  }
                })
                tilingData(item[key], rel[0].destModel)
                delete item[key]
              }
            }
          }
          Datakeys[_model].push(item)
        })
      } else {
        for (let key in data) {
          let rel = getRelByRelName(_model, key)
          if (typeof data[key] === "object" && !Array.isArray(data[key]) && data[key] !== null) {
            Datakeys[rel[0].destModel] = []
            if (!data[key].id) {
              const ids = guid()
              data[rel[0].destModel + "Id"] = ids
              data[key].id = ids
              const dataNext = data[key]
              tilingData(dataNext, rel[0].destModel)
            }
          } else if (typeof data[key] === "object" && Array.isArray(data[key])) {
            let child = data[key]
            child.map((ch: any) => {
              if (!ch.id) {
                ch.id = guid()
              }
              if (!ch[`${rel[0].souModel}Id`]) {
                ch[`${rel[0].souModel}Id`] = data[`id`]
              }
            })
            const dataNext = data[key]
            tilingData(dataNext, rel[0].destModel)
          }
        }
        Datakeys[_model].push(data)
      }
    }

    let getRelByRelName = (_model: string, relName: string) => {
      return that.model[_model].relation.filter((item: { stName: string; destModel: string; souModel: string }) => {
        return item.destModel === relName && item.souModel === _model
      })
    }
    tilingData(data, this.priModel)
    return Datakeys
  }
  saveModel(model: string, datas: Array<any>) {
    let id = guid()
    let baseField = JSON.parse(JSON.stringify(this.model[model])).base
    baseField.unshift(`id`)
    const rel = this.model[model].relation.filter((item: { inRelation: Number }) => {
      return item.inRelation === 0
    })
    rel.map((item: { destModel: any }) => {
      baseField.push(`${item.destModel}Id`)
    })
    let updateSql = ""
    baseField.map((item: any) => {
      updateSql += `${item}=values(${item}),`
    })
    let allValues = ""

    datas.map((data) => {
      let insertData: any = []
      if (data && !data.id) {
        insertData.push(`'${id}'`)
      } else {
        insertData.push(`'${data["id"]}'`)
      }
      for (let key of baseField) {
        if (key === "createTime") {
          insertData.push(`'${this.dateFormat(data[key] || new Date())}'`)
        } else if (key === "updateTime") {
          insertData.push(`'${this.dateFormat(new Date())}'`)
        } else if (key !== "id") {
          insertData.push(`'${data[key] === undefined || data[key] === "undefined" || data[key] === null || data[key] === "" ? "" : data[key]}'`)
        }
      }
      allValues += `(${insertData.join(",")}),`
    })
    var sql: string = `insert into ${model} (${baseField}) values ${allValues.substr(0, allValues.length - 1)} on duplicate key update ${updateSql.substr(0, updateSql.length - 1)}`
    return sql
  }
}
export default (a: any, b: string, c: any) => {
  let data = new Add(a, b, c).addData()
  return Promise.resolve(data).then((res) => {
    return res
  })
}
