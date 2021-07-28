import mysql from "mysql"
import async from "async"

const pool = mysql.createPool({
  user: "root",
  host: "10.2.6.98",
  // host: "8.131.80.55",
  password: "123456",
  database: "mysite",
  port: 33306,
})
interface SqlResponse {
  err: Error
  results: any
  fields: any
}
interface SqlTrans {
  sql: (a?: any) => string
  params?: any
}
class Mysql {
  constructor() {}
  exec(sql: string) {
    return new Promise<SqlResponse>((resolve) => {
      pool.getConnection((_err: any | null, connection?: any) => {
        // console.log(connection)

        if (!connection) {
          console.log("------------------------------------")
          console.log("------------------------------------")
          console.log("Database connection error")
          console.log("------------------------------------")
          console.log("------------------------------------")
          resolve({
            err: new Error(" db connet is error"),
            results: "",
            fields: "",
          })
        }
        connection.query(sql, [], function (err: any, results: any, fields: any) {
          try {
            resolve({
              err: err,
              results: results,
              fields: fields,
            })
          } catch (error) {
            console.error(`[DB] ${sql} is error`)
          }
          connection.release()
        })
      })
    })
  }
  execMulit(sqls: string) {
    let len = sqls.length
    let promiseList = []
    for (let i = 0; i < len; i++) {
      promiseList.push(
        new Promise((resolve, _reject) => {
          return resolve(this.exec(sqls[i]))
        })
      )
    }
    return Promise.all(promiseList).then((res) => {
      return res
    })
  }
  execTrans(sqlparamsEntities: Array<SqlTrans>) {
    return new Promise<SqlResponse>((resolve) => {
      pool.getConnection((_err, connection) => {
        connection.beginTransaction(function () {
          var funcAry: any = []
          try {
            sqlparamsEntities.forEach(function (sql_param) {
              funcAry.push((arg: any, cb: any) => {
                var sql = sql_param.sql(arg)
                if (cb === undefined) {
                  cb = arg
                }
                connection.query(sql, [], function (tErr: any, _results: any) {
                  if (tErr) {
                    connection.rollback(function () {
                      console.log("事务失败，" + sql + "已经回滚")
                      resolve({
                        err: tErr,
                        results: _results,
                        fields: "",
                      })
                    })
                  }
                  cb(null, _results)
                })
              })
            })
          } catch (e) {
            console.log("error")
          }
          async.waterfall(funcAry, (err: any, _res) => {
            if (err) {
              connection.rollback(() => {
                connection.release()
              })
            } else {
              connection.commit({ sql: "" }, (_info: any) => {
                if (err) {
                  console.log("执行事务失败，" + err)
                  connection.rollback((err) => {
                    console.log("回滚失败 " + err)
                    connection.release()
                  })
                } else {
                  resolve({
                    err: err,
                    results: true,
                    fields: "",
                  })
                  connection.release()
                }
              })
            }
          })
        })
      })
    })
  }
}
export default new Mysql()
