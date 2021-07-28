import Mysql from "./db"
import logger from "../core/logger"
import difference from "lodash/difference"

let dbconfig: any = []
interface Column {
  stTableName: string
  stName: string
  stType: string
  stlength: string
  stColumnName: string
}
interface ModelData {
  [index: string]: Array<Column>
}
// let tableindex: number = 0

function dbInit() {
  checkBase()
  checkRelation()
}
function checkBase() {
  Promise.resolve(
    Mysql.exec(`SELECT A.stTableName,B.stName,B.stType,B.stColumnName,B.stlength
   FROM pt_model as A LEFT JOIN pt_model_basic_prop as B on A.id = B.stModelId`)
  ).then((res) => {
    dbconfig = res.results
    let models: ModelData = {}
    if (res.err) {
      logger.error(`DBinit ${res.err}`)
    }
    if (dbconfig.length) {
      for (let item of dbconfig) {
        if (models[item.stTableName]) {
          models[item.stTableName].push(item)
        } else {
          models[item.stTableName] = [item]
        }
      }
      for (let model in models) {
        Promise.resolve(Mysql.exec(`show tables LIKE '${model}'`))
          .then((_res) => {
            if (_res.results.length === 0) {
              Promise.resolve(Mysql.exec(`CREATE TABLE ${model} (id VARCHAR(32) NOT NULL,PRIMARY KEY ( id ), createTime datetime, updateTime datetime,PowerId text,INDEX( id ))`))
                .then((_res) => {})
                .then((_create) => {
                  updateModel(models[model], model)
                })
                .catch((_err) => {
                  logger.error(`DBinit:${model} ${_err}`)
                })
            } else {
              if (models[model].length > 0) {
                updateModel(models[model], model)
              }
            }
          })
          .catch((_res) => {})
      }
    }
  })
}
let updateModel = (columns: Array<Column>, model: string, isBase: boolean = true): void => {
  Promise.resolve(Mysql.exec(`show columns from ${model}`)).then((_res) => {
    let columnsInner = []
    if (_res.results && _res.results.length > 0) {
      columnsInner = isBase
        ? _res.results.filter(
            (item: any) => item.Field && item.Field !== "id" && item.Field !== "PowerId" && item.Field !== "createTime" && item.Field !== "updateTime" && item.Field.indexOf("Id") === -1
          )
        : _res.results.filter((item: any) => item.Field && item.Field.indexOf("Id") > -1)
    }
    let columnExit: Array<string> = ["PowerId"]
    let columnBase: Array<string> = ["PowerId"]
    for (let item of columnsInner) {
      columnExit.push(item.Field)
    }
    for (let item of columns) {
      columnBase.push(item.stColumnName)
    }
    const needDel = difference(columnExit, columnBase)
    if (needDel.length) {
      const drop: string = needDel.map((i: string) => (i = ` drop ${i} ,`)).join("")

      Promise.resolve(Mysql.exec(`alter  table  ${model}${drop.substr(0, drop.length - 1)}`)).then((_res) => {
        if (_res.err) {
          logger.info(`[pt_base ${String(isBase)} error]: ${model}${drop}`)
        }
        if (!_res.err) {
          logger.info(`[pt_base ${String(isBase)}] : ${model} remove  ${needDel.join(",")}`)
        }
      })
    }

    const needAdd = difference(columnBase, columnExit).filter((item: any) => item)

    const getType = (column: string): string => {
      const col = columns.find((obj) => obj.stColumnName === column)
      let coltype: string = "varchar(32)"
      if (col) {
        if (col.stType === "varchar") {
          coltype = `varchar(${col.stlength})`
        } else {
          coltype = `${col.stType}`
        }
      }
      return coltype
    }
    if (needAdd.length) {
      const add: string = needAdd.map((i: string) => (i = ` add column ${i} ${getType(i)},`)).join("")
      console.log(`alter  table  ${model}  ${add.substr(0, add.length - 1)}`)
      Promise.resolve(Mysql.exec(`alter  table  ${model}  ${add.substr(0, add.length - 1)}`)).then((_res) => {
        if (!_res.err) {
          logger.info(`[pt_${String(isBase) ? "base" : "rel"}]: ${model} add  ${needAdd.join(",")}`)
        }
        if (_res.err) {
          logger.info(`[pt_${String(isBase) ? "base" : "rel"} error]: ${model} add  ${needAdd.join(",")}`)
        }
      })
    }
  })
}
function checkRelation() {
  Promise.resolve(
    Mysql.exec(`SELECT
	C.stTableName AS 'souModel',
            B.stTableName AS 'destModel',
            A.stName,
            A.inRelation
FROM
	pt_model_relation AS A
LEFT JOIN pt_model AS B ON A.stDestModelID = B.id
LEFT JOIN pt_model AS C ON A.stSouModelID = C.id 
where 
A.inRelation = 1`)
  ).then((res) => {
    let models: ModelData = {}
    if (res.err) {
      logger.error(`DBinit ${res.err}`)
    } else {
      for (let item of res.results) {
        if (models[item.destModel]) {
          models[item.destModel].push({
            stName: item.souModel + item.destModel,
            stType: "varchar",
            stlength: "32",
            stTableName: item.destModel,
            stColumnName: item.souModel + "Id",
          })
        } else {
          models[item.destModel] = [
            {
              stName: item.souModel + item.destModel,
              stType: "varchar",
              stlength: "32",
              stTableName: item.destModel,
              stColumnName: item.souModel + "Id",
            },
          ]
        }
      }
      for (let model in models) {
        updateModel(models[model], model, false)
      }
    }
  })
}
export default dbInit
