/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-04-12 17:14:48
 * @LastEditors:
 */
const alias = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const aliasNum = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
import service from "./service"

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
  modelFiled = (modelName: string, _destName?: string) => {
    const destName = this.priModel !== _destName ? _destName : undefined
    let that = this
    function getWord(): string {
      let name = alias[parseInt(Math.random() * 26 + ``)] + aliasNum[parseInt(Math.random() * 10 + ``)] + alias[parseInt(Math.random() * 26 + ``)]
      if (that.modelAlias[name]) {
        return getWord()
      }
      return name
    }
    let word: string
    if (this.getModelWord(modelName, destName)) {
      word = this.getModelWord(modelName, destName)
    } else {
      word = getWord()
    }
    this.modelAlias[word] = destName ? modelName + "_" + destName : modelName
    if (destName && this.priModel !== destName) {
      const alias = this.getModelWord(destName)
      if (alias) {
        this.modelAlias[destName + "_" + modelName] = this.getModelWord(destName)
      } else {
        this.modelAlias[getWord()] = destName + "_" + modelName
      }
    }
    let filed = ["id"].concat(this.model[modelName].base)
    if (this.relations.length === 0) {
      filed = ["id"].concat(this.model[modelName].modelbase)
    }
    return {
      filed: filed.map((item: string) => {
        return (item = `${word}.${item} AS ${word}_${item}`)
      }),
      word,
    }
  }
  getModelWord = (modelName: string, _destName?: string): string => {
    const destName = this.priModel !== _destName ? _destName : undefined
    console.log(this.modelAlias)
    let alias = ""
    for (let a in this.modelAlias) {
      if (a.indexOf("_") === -1)
        if (destName && modelName !== this.priModel) {
          if (this.modelAlias[a] === `${modelName}_${destName}`) {
            // return a
            alias = a
            break
          }
        } else if (this.modelAlias[a] === modelName) {
          alias = a
          break
        }
    }
    if (!alias && this.modelAlias[`${modelName}_${destName}`]) {
      alias = this.modelAlias[`${modelName}_${destName}`]
    }
    return alias
  }
  getQueryRelation = (priModel: string, path: string[]) => {
    let rel: Array<any> = []
    for (let index = 0; index < path.length; index++) {
      if (path[index].indexOf(".") > 0) {
        let pathFirst = path[index].substr(0, path[index].indexOf("."))
        let pathLast = path[index].substr(path[index].indexOf(".") + 1)
        if (this.getRelationModel(priModel, pathFirst).length > 0) {
          rel = rel.concat(this.getRelationModel(priModel, pathFirst))
          rel = rel.concat(this.getQueryRelation(this.getRelationModel(priModel, pathFirst)[0].destModel, [pathLast]))
        }
      } else {
        rel = rel.concat(this.getRelationModel(priModel, path[index]))
      }
    }
    return rel
  }
  getRelationModel = (modelName: string, path?: string): any => {
    if (path) {
      return this.model[modelName]["relation"].filter((item: any) => item.stName === path)
    } else {
      return this.model[modelName]["relation"]
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
