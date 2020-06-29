import Mysql from './db'
let getModel = () => {
  let model: any = {}
  let getBase = Mysql.exec('SELECT A.stTableName,B.stName,B.stType,B.stColumnName,B.stlength FROM `pt_model` as A LEFT JOIN `pt_model_basic_prop` as B on A.id = B.stModelId')
  let getRelation = Mysql.exec(`SELECT
	C.stTableName AS 'souModel',
	B.stTableName AS 'destModel',
	A.stName,
	A.inRelation
FROM
	pt_model_relation AS A
LEFT JOIN pt_model AS B ON A.stDestModelID = B.id
LEFT JOIN pt_model AS C ON A.stSouModelID = C.id`)
  return Promise.resolve(getBase).then((res) => {
    if (res && res.results.length > 0) {
      for (let item of res.results) {
        if (model[item.stTableName] && model[item.stTableName].base) {
          model[item.stTableName].base.push(item.stColumnName)
          model[item.stTableName].modelbase.push(item.stColumnName)
        } else {
          model[item.stTableName] = {
            modelName: item.stTableName,
            base: ['createTime', 'updateTime', item.stColumnName],
            modelbase: ['createTime', 'updateTime', item.stColumnName],
            relation: []
          }
        }
      }
    }
    return Promise.resolve(getRelation).then((resd) => {
      if (resd && resd.results.length > 0) {
        for (let item of resd.results) {
          model[item.souModel].relation.push(item)
          // 主动配置 关联关系 被动的不算
          // model[item.destModel].relation.push(item)
          if (item.inRelation === 0) {
            model[item.souModel].modelbase.push(`${item.stName}Id`)
          }
        }
      }
      return model
    })
  })
}
export default getModel