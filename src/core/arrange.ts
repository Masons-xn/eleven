/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-04-08 09:04:15
 * @LastEditTime: 2021-04-16 16:01:18
 * @LastEditors:
 */
import secrets from "./secrets"
import Axios from "axios"
import { getServiceByid } from "./bff"
import { clap, pile } from "../utils/bff"
import { dataOrder } from "../utils/dateFormat"
const axios = Axios.create({})
const paramTrans = (source: any, dest: any, data: {}) => {
  const trans: any = [] //  source 和destmap 通过 seq关联
  const dataMap = clap(data) // 数据 map  key value
  let transData: any[] = []
  // 默认值
  const defaultData = new Map()
  // const orgData = []
  const pools: any = []
  dest.forEach((i: any) => {
    trans[Number(i.seq)] = { dest: i.bffParams.keyMap, index: i.bffParams.sequence }
    // transData[Number(i.seq)] = { keyMap: i.bffParams.keyMap, value: i.bffParams.value, index: i.bffParams.sequence }
    defaultData.set(i.bffParams.keyMap, i.bffParams.value)
  })
  source.forEach((i: any) => {
    if (trans[Number(i.seq)]) {
      trans[Number(i.seq)].sour = i.bffParams.keyMap
    }
  })
  for (const [key, value] of dataMap.entries()) {
    pools.push({ keyMap: key, value: value })
  }
  const newPath = (str: string, path: string, npath: string) => {
    const a = str.split("-")
    const b = path.split("-")
    const c = npath.split("-")
    let index = ""
    let position = -1
    a.some((x: any, i: number) => {
      if (x !== b[i]) {
        position = i
        index = x.replace("Array", "")
        return
      }
    })
    if (position > -1) {
      c[c.length - a.length + position] = "Array" + index
      return c.join("-")
    } else {
      return c.join("-")
    }
  }
  const getDataFromPool = (path: string, npath: string, index: number) => {
    const n: any = []
    pools.forEach((x: { keyMap: string; value: any }) => {
      if (x.keyMap.replace(/Array\d/g, "Array") === path) {
        let np = npath
        if (x.keyMap.indexOf("Array") > -1) {
          np = newPath(x.keyMap, path, npath)
        }
        n.push({ keyMap: np, value: x.value, index: index })
      }
    })
    return n
  }
  trans.forEach((i: { dest: string; sour: string; index: number }) => {
    if (i && i.dest) {
      if (i.sour) {
        transData = transData.concat(getDataFromPool(i.sour, i.dest, i.index))
      } else {
        transData.push({
          keyMap: i.dest,
          value: defaultData.get(i.dest),
          index: i.index,
        })
      }
    }
  })
  const resData = dataOrder({ data: transData, key: "index" })
  return pile(resData)
}
class Arrange {
  services = {}
  rel = []
  serviceMapping = []
  params = {}
  queue = []
  constructor(info: any, params: { [x: string]: any }) {
    this.services = info
    this.rel = info.bffServiceRel
    this.params = params
    this.serviceMapping = info.bffServiceMapping
    this.rel.map((ser: { id: string; steps: string | number; stepsIndex: string | number; services: string | number }) => {
      if (!this.queue[ser.steps]) {
        this.queue[ser.steps] = []
      }
      this.queue[ser.steps][ser.stepsIndex] = ser.services
    })
  }
  async fetch() {
    console.log("准备请求")
    return this.dispatch()
  }
  private async dispatch() {
    const result: any = await this.doFetch(1, [{ key: this.queue[0][0], value: this.params }])
    return this.resultForamter(result)
  }

  private findParamsMapping(_step: number, _index: number, _url: string, dir: string) {
    return this.serviceMapping.filter((i: any) => i.steps === String(_step) && i.stepsIndex === String(_index) && i.bffServiceId === _url && i.dir === dir)
  }
  request(urls: Array<string>, step: number, _param: any) {
    const getMatchParmas = (dest: any[]) => {
      // 做复杂了。。。不应该存在  0-0 A 0-0 C 1-0 B 1-1 B
      let res: any
      dest.some((x) => {
        const is = this.serviceMapping.find((i: any) => i.sing === x.sing && i.dir === "sour" && Number(i.steps) === step - 1)
        if (is) {
          res = is
          return
        }
      })
      return res
    }
    const arr: any = []
    urls.forEach((url: any, index) => {
      const dest: any[] = this.findParamsMapping(step, index, url, "dest")
      let source: { bffParamsMapping: any; bffServiceId: string }
      source = getMatchParmas(dest)

      const params = paramTrans(source.bffParamsMapping, dest[0].bffParamsMapping, _param.find((i: any) => i.key === source.bffServiceId).value)
      arr.push(
        new Promise((reslove, _reject) => {
          console.log("url", `http://${secrets.HOST}:${secrets.PORT}${getServiceByid(url).url}`, JSON.stringify(params))
          reslove(
            axios.post(`http://${secrets.HOST}:${secrets.PORT}${getServiceByid(url).url}`, params).then((res: any) => {
              return res
            })
          )
        })
      )
    })
    return arr
  }
  /*
   *@queue 执行队列
   *@last  执行到第几层
   *@return Promise
   */
  private doFetch(step: number, params: any): any {
    const current = this.queue[step]
    return new Promise(async (reslove, _reject) => {
      return reslove(
        Promise.all(this.request(current, step, params)).then((res) => {
          if (this.queue.length === step + 1) {
            return res
          } else {
            const nextParams: any = []
            ;(this.queue[step] as any).forEach((url: any, i: number) => {
              nextParams.push({
                key: url,
                value: (res as any)[i].data,
              })
            })
            return this.doFetch(step + 1, nextParams)
          }
        })
      )
    }).then((res) => {
      return res
    })
  }
  private resultForamter(_a: any) {
    const dest: any = this.findParamsMapping(0, 0, this.queue[0][0], "dest")
    let res: any = []
    let resData: any = {}
    dest.forEach((x: any) => {
      const is = this.serviceMapping.find((i: any) => i.sing === x.sing && i.dir === "sour" && Number(i.steps) === this.queue.length - 1)
      if (is) {
        res.push(is)
      }
    })

    res = dataOrder({ data: res, key: "stepsIndex" })
    // 返回结果可能需要和step  promiseAll 的顺序相匹配
    const maps = new Map()
    // dest[0].bffParamsMapping.forEach((i: any) => {
    //   maps.set(i.bffParams.keyMap, i.bffParams.value)
    // })
    const pools: any = []
    res.forEach((item: { bffParamsMapping: any; sing: string }, index: any) => {
      for (const [key, value] of clap(paramTrans(item.bffParamsMapping, dest.find((i: { sing: any }) => i.sing === item.sing).bffParamsMapping, _a[index].data)).entries()) {
        if (value) {
          maps.set(key, value)
        }
      }
    })
    for (const [key, value] of maps.entries()) {
      pools.push({ keyMap: key, value: value })
    }
    resData = pile(pools)
    return resData
  }
}

export { Arrange }
