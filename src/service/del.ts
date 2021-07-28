import { ModelBase } from "./modelbase"

interface ModelRef {
  souModel: string
  destModel: string
  inRelation: number
  stName: string
}
interface models {
  ids: string[]
  model: string
}
class Delete extends ModelBase {
  delIds: string[] = []
  refs: any[] = []
  constructor(model: any, priModel: string, param: any) {
    super(model, priModel, param)
  }
  delete() {
    let ids = this.param.data || []
    if (ids.length === 0) {
      this.setError("1001", "参数错误！")
    }
    ids.map((item: any) => {
      if (typeof item !== "string") {
        this.setError("1001", "参数错误！")
      }
    })
    this.delIds = ids
    this.refs = this.getAllRealtion().reverse()

    return this.getData().then((res: any) => {
      const things = this.DeleteData(res.data)
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
    })
  }
  DeleteData(del: any) {
    let trans: Array<any> = []
    for (let model of del) {
      if (model["model"] && model["ids"].length > 0) {
        trans.push({
          sql: (_results?: any) => {
            try {
              return `delete from ${model["model"]} where id in ("${model["ids"].join('","')}")`
            } catch (e) {
              return {}
            }
          },
        })
      }
    }
    return trans
  }
  getData() {
    const refsHandled: any[] = []
    const that = this
    let Alllist: any = []
    const getSql = (models: any): any => {
      const sqls: string[] = []
      Alllist = Alllist.concat(models)
      models.map((mm: models) => {
        const model = mm.model
        let ids = mm.ids
        const ref = that.refs.filter((item: ModelRef) => item.souModel === model)
        let needDelIds = ``
        // ids = ids.filter(id => id)
        if (ids.length > 0) {
          ids.map((item: string) => {
            needDelIds += `"${item}",`
          })
          ref.map((item: ModelRef) => {
            if (!refsHandled.some((ref) => (ref.souModel === item.souModel && ref.destModel === item.destModel) || (ref.souModel === item.destModel && ref.destModel === item.souModel))) {
              refsHandled.push(item)
              let sql = ""
              if (item.inRelation === 1) {
                sql = `select id as ${item.destModel} from ${item.destModel} where ${item.souModel}Id in (${needDelIds.substr(0, needDelIds.length - 1)})`
              } else {
                sql = `select id from ${item.destModel} where id in (select ${item.stName}Id from ${item.souModel} where id in (${needDelIds.substr(0, needDelIds.length - 1)}))`
              }
              sqls.push(sql)
            }
          })
        }
      })
      return Promise.resolve(this.Mysql.execMulit(sqls, [])).then((res) => {
        const needSelect: any = []
        res.map((item: { err: any; results: any; fields: any }) => {
          if (item.results.length > 0) {
            const key = Object.keys(item.results[0])[0]
            needSelect.push({ model: key, ids: item.results.map((item: any) => item[key]) })
          }
        })
        if (needSelect.length > 0) {
          return getSql(needSelect)
        }
        if (!res.err) {
          return {
            code: "200",
            data: Alllist,
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
    return getSql([{ model: this.priModel, ids: this.delIds }])
  }
  getAllRealtion() {
    let refAll: string[] = []
    let rel: Array<any> = []
    const getRelationAll = (modelName: string) => {
      const refs = this.getRelationModel(modelName).filter((item: any) => item.inRelation === 1) // 级联删除会删除一对多的
      let relInner: Array<any> = []
      if (refs.length > 0) {
        refs.map((item: { destModel: string }) => {
          if (refAll.indexOf(item.destModel) === -1) {
            refAll.push(modelName)
            relInner.concat(getRelationAll(item.destModel))
          }
          rel.push(item)
        })
      }
      return relInner
    }
    rel = rel.concat(getRelationAll(this.priModel))
    return rel
  }
}
export default (a: any, b: string, c: any) => {
  let data = new Delete(a, b, c).delete()
  return Promise.resolve(data).then((res) => {
    return res
  })
}
