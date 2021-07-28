/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-12-25 15:20:35
 * @LastEditTime: 2021-03-31 13:11:14
 * @LastEditors:
 */
import Service from "../../service/service"
import { initConfig } from "./../../config/init"
// let powerModels: string[] = []
let modelMapping = new Map()
let roleMapping = new Map()
// 是否开启权限的控制
const isPowered = initConfig.auth
const superid = "5c4f647261343ef5c8b1e74b628fc044"
export const initPowers = () => {
  modelMapping = new Map()
  roleMapping = new Map()
  var sql: string = `select * from power`
  var sqlModel: string = `select * from pt_model`
  const service = new Service()
  if (isPowered) {
    return false
  }
  return Promise.resolve(service.Mysql.exec(sqlModel))
    .then((res) => {
      res.results
        .filter((item: { isPowered: number }) => item.isPowered === 1)
        .map((model: { stTableName: string }) => {
          modelMapping.set(model.stTableName, [])
        })
      return Promise.resolve(service.Mysql.exec(sql)).then((res) => {
        const powers = res.results
        if (powers && powers.length > 0) {
          powers.map((role: { roleId: string; model: string }) => {
            if (roleMapping.has(role.roleId)) {
              const data = roleMapping.get(role.roleId)
              data.push(role.model)
              roleMapping.set(role.roleId, data)
            } else {
              roleMapping.set(role.roleId, [role.model])
            }
            if (modelMapping.has(role.model)) {
              const data = modelMapping.get(role.model)
              data.push(role.roleId)
              modelMapping.set(role.model, data)
            } else {
              // modelMapping.set(role.model, [role.roleId])
              // console.log(`模型${role.model} 不再受权限限制`)
            }
          })
          return {
            message: "Pwoer is Ready!",
          }
        } else {
          return {
            message: "Pwoers mapping is null!",
          }
        }
      })
    })
    .catch((res) => {
      return res
    })
}
const getPowerByRoleId = (roleId: string) => {
  if (!isPowered) {
    return true
  }
  return roleMapping.get(roleId)
}
export const modelIsPowered = (key: string) => {
  return modelMapping.has(key)
}
export const queryCountlimitByPwoer = (eleven: any) => {
  if (!isPowered) {
    return ""
  }
  const userRoles = eleven.param.account.roles
  if (userRoles.indexOf(superid) > -1) {
    return ""
  }
  if (userRoles[0] === null) {
    return " and 1!=1"
  }
  const powersModels: string[] = []
  let sql = ""
  for (const key of userRoles) {
    const rolePowers = getPowerByRoleId(String(key)) || []
    rolePowers.map((item: string) => {
      if (powersModels.indexOf(item) === -1) {
        powersModels.push(item)
      }
    })
  }
  ;[eleven.model[eleven.priModel]].map((item: any) => {
    if (modelMapping.has(item.modelName)) {
      const alias = eleven.getModelWord(item.modelName)
      if (powersModels.indexOf(item.id) > -1) {
        let subsql = ""
        userRoles.map((role: any, index: number) => {
          if (index === 0) {
            subsql += `LOCATE('${role}',${alias}.PowerId) > 0 `
          } else {
            subsql += `or LOCATE('${role}',${alias}.PowerId) > 0`
          }
        })
        sql += `and (${subsql})`
      } else {
        sql += ` and ${alias}.id=''`
      }
    }
  })
  return sql
}
export const querylimitByPwoer = (eleven: any) => {
  if (!isPowered) {
    return ""
  }
  const userRoles = eleven.param.account.roles
  if (userRoles.indexOf(superid) > -1) {
    return ""
  }

  if (userRoles[0] === null) {
    return " and 1!=1"
  }
  const powersModels: string[] = []
  const relModel: { [x: string]: string } = eleven.modelAlias
  let sql = ""
  for (const key of userRoles) {
    const rolePowers = getPowerByRoleId(String(key)) || []
    rolePowers.map((item: string) => {
      if (powersModels.indexOf(item) === -1) {
        powersModels.push(item)
      }
    })
  }
  const queryModels: any[] = []
  for (const key in relModel) {
    queryModels.push(eleven.model[relModel[key]])
  }
  if (queryModels.length === 1 && queryModels[0].modelName === "power") {
    return ""
  }
  if (queryModels.length > 0) {
    queryModels.map((item: any) => {
      if (modelMapping.has(item.modelName)) {
        const alias = eleven.getModelWord(item.modelName)
        if (powersModels.indexOf(item.id) > -1) {
          let subsql = ""
          userRoles.map((role: any, index: number) => {
            if (index === 0) {
              subsql += `LOCATE('${role}',${alias}.PowerId) > 0 `
            } else {
              subsql += `or LOCATE('${role}',${alias}.PowerId) > 0`
            }
          })
          sql += `and (${subsql})`
        } else {
          sql += ` and ${alias}.id=''`
        }
      }
    })
  }
  return sql
}
