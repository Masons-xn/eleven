/**
 * 
 * 
 */
import { ModelBase, objectBase } from './modelbase'
import query from './query'
interface objectAny {
  [key: string]: objectBase
}
class BatchCascadeQuery extends ModelBase {
  constructor(model: any, priModel: string, param: any) {
    super(model, priModel, param);
  }
  Query = () => {
    return Promise.resolve(query(this.model, this.priModel, Object.assign(this.param, { path: this.tarnsRelToPath(this.getAllRelation()) }))).then(res => {
      return res
    })
  }
  tarnsRelToPath(rels: objectAny) {
    let path: any = []
    const readyAdd: string[] = []
    const transPath = (str: string, base: string) => {
      readyAdd.push(str)
      const alisa = rels[str]
      if (alisa && alisa.length) {
        alisa.map((item: string) => {
          if (rels[item] && readyAdd.indexOf(item) === -1) {
            transPath(item, `${base ? base + '.' + item : item}`)
          } else {
            path.push(`${base}`)
          }
        })
      } else {
        path.push(`${base}`)
      }
    }
    transPath(this.priModel, '')
    return path
  }
  getAllRelation = () => {
    let data: objectAny = {}
    const getRelationModel = (modelName: string) => {
      let getModel = this.getRelationModel(modelName)
      if (getModel.length > 0) {
        getModel.map((item: { destModel: string; }) => {
          if (!data[modelName]) {
            data[modelName] = [item.destModel]
          } else {
            data[modelName].push(item.destModel)
          }
          if (!data[item.destModel]) {
            getRelationModel(item.destModel)
          }
        })
      }
    }
    getRelationModel(this.priModel)
    return data
  }
}

export default (a: any, b: string, c: any) => {
  let data = new BatchCascadeQuery(a, b, c).Query()
  return Promise.resolve(data).then(res => {
    return res
  })
}