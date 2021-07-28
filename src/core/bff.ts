/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-03-31 12:48:33
 * @LastEditTime: 2021-04-14 10:16:32
 * @LastEditors:
 */

import { innerService } from "../service/init"
const Bffservice = new Map()
let bffParams = new Array()
import { pile } from "../utils/bff"
import { proxyCenter } from "./gateway"
import { Arrange } from "./arrange"
import { getParam } from "../router/adapter"
const bffInit = () => {
  innerService["bffParams"].query().then((res: any) => {
    // res.result.list.forEach((i: { id: string }) => {
    //   bffParams.add(i)
    // })
    bffParams = res.result.list
  })
  innerService["bffService"].query().then((res: any) => {
    res.result.list.forEach((i: { url: string }) => {
      Bffservice.set(i.url.replace(/\//g, "").toLocaleLowerCase(), i)
    })
  })
  innerService["bffBackForFront"]
    .query({
      path: ["bffServiceRel", "bffServiceMapping.bffParamsMapping.bffParams", "bffServiceMapping.bffService"],
      order: [{ field: "bffServiceMapping.bffParamsMapping.bffParams.sequence", action: "asc" }],
    })
    .then((res: any) => {
      res.result.list.forEach((i: { url: string }) => {
        Bffservice.set(i.url.replace(/\//g, "").toLocaleLowerCase(), i)
      })
    })
}
const getBffService = (path: string) => {
  return Bffservice.get(path)
}
const getServiceByid = (id: string): any => {
  for (let value of Bffservice.values()) {
    if (value.id === id) {
      return value
    }
  }
}
export { bffInit, getBffService, getServiceByid }

export const bffTransform = (url: any, _req: any, res: any) => {
  const service = Bffservice.get(url.replace(/\//g, "").toLocaleLowerCase())
  const rel = service.bffServiceRel
  if (rel) {
    const server = new Arrange(service, getParam(_req, {}))
    console.log("组合接口")
    server.fetch().then((_res: any) => {
      res.send({
        code: 200,
        message: "组合接口",
        restlt: _res,
      })
    })
  } else {
    //应该做虚拟和真实单接口， 目前service直接走的是另外的逻辑所以暂时是虚拟接口，后期可以考虑  整合一起
    // const response = service
    if (service.isService === "1") {
      proxyCenter(service.url, _req, res)
    } else {
      const params: any[] = []
      bffParams.forEach((i: { [x: string]: string }) => {
        if (i && i["bffServiceId"] === service.id) {
          params.push({
            keyMap: i.keyMap,
          })
        }
      })
      res.send({
        code: 200,
        message: "这是是一个虚拟的接口",
        restlt: pile(params),
      })
    }
  }
}
