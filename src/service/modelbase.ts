const alias = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"]
import service from './service'

export interface objectBase {
  [key: string]: any
}
export class ModelBase extends service {
  model: objectBase = {}
  priModel: any = {}
  param: any = {}
  modelAlias: any = {}
  relations: Array<any> = []
  constructor(a: any, b: string, c: any) {
    super()
    this.model = a
    this.priModel = b
    this.param = c
  }
  modelFiled = (modelName: string) => {
    let that = this
    function getWord(): string {
      let name = alias[parseInt(Math.random() * 20 + ``)]
      if (that.modelAlias[name]) {
        return getWord()
      }
      return name
    }
    let word: any
    if (this.getModelWord(modelName)) {
      word = this.getModelWord(modelName)
    } else {
      word = getWord()
    }
    this.modelAlias[word] = modelName
    let filed = ['id'].concat(this.model[modelName].base)
    if (this.relations.length === 0) {
      filed = ['id'].concat(this.model[modelName].modelbase)
    }
    return {
      filed: filed.map((item: string) => {
        return item = `${word}.${item} AS ${word}_${item}`
      })
    }
  }
  getModelWord = (modelName: string): string => {
    for (let a in this.modelAlias) {
      if (this.modelAlias[a] === modelName) {
        return a
      }
    }
    return ''
  }
  getQueryRelation = (priModel: string, path: string[]) => {
    let rel: Array<any> = []
    for (let index = 0; index < path.length; index++) {
      if (path[index].indexOf('.') > 0) {
        let pathFirst = path[index].substr(0, path[index].indexOf('.'))
        let pathLast = path[index].substr(path[index].indexOf('.') + 1)
        if (this.getRelationModel(priModel, pathFirst).length > 0) {
          rel = rel.concat(this.getRelationModel(priModel, pathFirst))
          rel = rel.concat(this.getQueryRelation(this.getRelationModel(priModel, pathFirst)[0].destModel, [pathLast]))
        }
      } else {
        rel = rel.concat(this.getRelationModel(priModel, path[index]))
      }
    }
    // let obj: any = {}
    // const rels = rel.reduce(function (item, next) { obj[next.key] ? '' : obj[next.key] = true && item.push(next); return item }, [])
    return rel
  }
  getRelationModel = (modelName: string, path?: string): any => {
    if (path) {
      return this.model[modelName]['relation'].filter((item: any) => item.stName === path)
    } else {
      return this.model[modelName]['relation']
    }
  }
  getRelationByKey = (word: string, priModel: string): Array<any> => {
    let destModel = this.modelAlias[word]
    let rel: Array<any> = []
    for (let item of this.relations) {
      if ((item.destModel === destModel && item.souModel === priModel) || (item.souModel === destModel && item.destModel === priModel)) {
        rel = [item.inRelation, item.stName, item.destModel, item.souModel]
        break
      } else if (item.souModel === destModel || item.destModel === destModel) {
        rel = [item.inRelation, item.destModel, item.souModel]
      }
    }
    return rel
  }
}
