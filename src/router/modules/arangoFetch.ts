/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-05-11 09:45:54
 * @LastEditTime: 2021-05-11 17:55:01
 * @LastEditors:
 */
import { aql } from "arangojs"
import { baseQuery } from "../../db/arango"
import { Path, Method } from "../decoratord"
import Service from "../../service/service"

@Path("/arangodb")
class Arango extends Service {
  public method: Array<any> | undefined
  constructor() {
    super()
  }
  @Method("/query")
  arangoFetch(param: any) {
    const _strs: Array<string> = JSON.parse(JSON.stringify(param)).query || []

    const getCollection = (str: string) => {
      return (str.match(/\{\{(.+?)\}\}/g) as Array<any>) || []
    }
    const replaceStr = (str: string) => {
      return str.replace(/\{\{(.+?)\}\}/g, (_m, coll) => {
        return `@@` + coll
      })
    }
    const PromiseAll: Array<Promise<any>> = []
    _strs.map((i) => {
      const aqls = aql``
      const vars = getCollection(i)
      aqls.query = replaceStr(i)
      PromiseAll.push(Promise.resolve(baseQuery(aqls, vars)))
    })
    return new Promise((reslove, _reject) => {
      reslove(
        Promise.all(PromiseAll).then((res) => {
          return {
            code: 200,
            data: res,
          }
        })
      )
    })
    // return new Promise((reslove, _reject) => {
    //   reslove(
    //     Promise.resolve(
    //       arangoQuer("frenchCity", (collection: any) => {
    //         return aql`FOR pokemon IN ${collection} RETURN pokemon`
    //       })
    //     ).then((res) => {
    //       const list: any[] = []
    //       ;(res as any).flatMap((pokemon: any) => {
    //         list.push(pokemon)
    //       })
    //       return { code: "200", data: list }
    //     })
    //   )
    // })
  }
}

export default new Arango()
