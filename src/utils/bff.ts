/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-04-02 15:53:22
 * @LastEditTime: 2021-04-14 14:28:14
 * @LastEditors:
 */

const getObjType = (obj: any) => {
  const toString = Object.prototype.toString
  const map = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object",
  }
  // if (obj instanceof Element) {
  //   return "element"
  // }
  return map[toString.call(obj)]
}

const clap = (datas: any) => {
  const destData = new Map()
  const clapData = (prefix: string, data: any) => {
    if (getObjType(data) === "array") {
      if (getObjType(data[0]) !== "array" && getObjType(data[0]) !== "object") {
        destData.set(`${prefix}`, "")
      } else {
        destData.set(`${prefix}`, "")
        data.forEach((item: any, index: any) => {
          clapData(`${prefix ? prefix + "-" : ""}Array${index}`, item)
        })
      }
    } else if (getObjType(data) === "object") {
      destData.set(`${prefix}`, "")
      for (const key in data) {
        clapData(`${prefix ? prefix + "-" : ""}${key}`, data[key])
      }
    } else {
      destData.set(`${prefix}`, data)
    }
  }
  for (const key in datas) {
    clapData(key, datas[key])
  }
  return destData
}

const rebuild = (path: Array<string>, data: string, indicator: any[]) => {
  const key = path[0]
  const isArray = path[0].indexOf("Array") === 0
  if (isArray) {
    const arrayIndex = Number(path[0].replace("Array", ""))
    if (path.length === 1) {
      indicator[arrayIndex] = data
    } else {
      const subkey = path[1]
      if (subkey.indexOf("Array") === 0 && !indicator[arrayIndex]) {
        indicator[arrayIndex] = []
      } else if (!indicator[arrayIndex]) {
        indicator[arrayIndex] = {}
      }
      rebuild(path.slice(1, path.length), data, indicator[arrayIndex])
    }
  } else {
    indicator[key] ? "" : (indicator[key] = {})
    if (path.length === 1) {
      indicator[key] = data
    } else {
      const subkey = path[1]
      if (subkey.indexOf("Array") === 0) {
        getObjType(indicator[key]) === "array" ? "" : (indicator[key] = [])
      }
      rebuild(path.slice(1, path.length), data, indicator[key])
    }
  }
}

const pile = (data: any[]) => {
  const reOrgdata: any = {}
  data.forEach((key) => {
    rebuild(key.keyMap.split("-"), key.value, reOrgdata)
  })
  return reOrgdata
}
export { clap, pile }
