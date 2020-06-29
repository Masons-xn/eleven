import Service from '../../service/service'
import { Path, Method } from '../decoratord'
import guid from '../../utils/guid'
import fs from 'fs'
import logger from '../../core/logger'
import mongo from '../../db/mongo'

@Path('/Test')
class Test extends Service {
  public base: string = '123123'
  public method: Array<any> | undefined;
  constructor() {
    super();
  }
  @Method('/queryc')
  asda(): any {
    // let sql: Array<any> = []
    // let step1 = {
    //   sql: (_results?: any) => {
    //     return `select * from user`
    //   }
    // }
    // sql.push(step1)
    // let step2 = {
    //   sql: (_results: any) => {
    //     console.log(_results)
    //     return `select * from user where guid = ${_results.length}`
    //   }
    // }
    // sql.push(step2)
    // Promise.resolve(mongo.add("d", { name: "菜鸟教程", url: "www.runoob" })).then((_res) => {
    //   console.log(_res)
    //   return _res
    // })
    return Promise.resolve(mongo.find("user")).then((_res) => {
      console.log(_res)
      return _res
    })
  }
  @Method('/queryb')
  asd(): any {
    // let data: any = {}
    // let start = 10000000
    // var sql: string = `select sm_num as num from sys_sum  where length(sm_num)=8`
    // Promise.resolve(this.Mysql.exec(sql)).then((res) => {
    //   data = {}
    //   for (let a = 0; a < res.results.length; a++) {
    //     data[res.results[a].num] = true
    //   }
    //   console.log(res.results.length)
    doInsertOther()
    // }).catch(res => {
    //   return res
    // })
    function doInsertOther() {
      // console.log(`第${start}个: 当前时间：${new Date().toLocaleString()}`)
      let datas = [2847, 2849]
      var sqla: string = ``
      for (let i = 0; i <= datas.length; i++) {
        sqla += `insert into video_topic_comment (id,video_id,user_id,create_time,choose_id) VALUES ('${i + 705156903995179009}', '705156903957430272','${datas[i]}',${new Date().toLocaleString()}, "1");\n`
        fs.open(__dirname + "../../../public/test.sql", "a", (err, fd) => {
          if (err) { throw err; }
          // 2.写入文件
          fs.writeFile(fd, sqla, error => {
            if (error) { throw err; }
            // 3.关闭文件
            fs.close(fd, err => {
              if (err) { throw err; }
              console.log("执行成功!");
              sqla = ''
            });
          });
        });
      }
    }
  }
  @Method('/querya')
  mmm(): any {
    let data: any = {}
    let start = 10000000
    var sql: string = `select sm_num as num from sys_sum  where length(sm_num)=8 and id = 16`
    const that = this
    Promise.resolve(this.Mysql.exec(sql)).then((res) => {
      data = {}
      for (let a = 0; a < res.results.length; a++) {
        data[res.results[a].num] = true
      }
      console.log(res.results.length)
      doInsertOther()
    }).catch(res => {
      return res

    })
    function doInsertOther() {
      var sqla: string = `insert into sys_sum (guid,new_sm_num_regular_id,sm_num,row_status,row_state,money,create_time,occupy) VALUES ?`
      // console.clear()
      console.log(`第${start}个: 当前时间：${new Date().toLocaleString()}`)
      let datas = []
      for (let i = start; i <= 99999999; i++) {
        if (data[i]) {
          // datas.push([guid(), String(i), "0", new Date().toLocaleString(), 1])
          datas.push([guid(), 'asdasd', String(i), "1", "0", 123, new Date().toLocaleString(), 1])
        }
        if (datas.length >= 990000 || i === 99999999) {
          start = i
          if (datas.length === 0) {
            console.log('over')
            return
          }
          Promise.resolve(that.Mysql.exec(sqla, datas)).then((res) => {
            console.log('插入成功！')
            if (res.err) {
              console.log(res.err)
            } else {
              doInsertOther()
            }
          }).catch((e) => {
            console.log(e)
          })
          break
        }
        if (i === 100000000) {
          console.log('结束')
        }
      }
    }
  }
  @Method('/query')
  bbb(param: any): any {
    let data: Array<{
      name: string,
      id: Number,
      type: string,
    }> = []
    let qid = eval(param.data || [])
    console.log(qid)
    let a: number = 0
    const that = this
    console.log(`开始时间: ${new Date().toLocaleString()}`)
    // var sqlA: string = `select * from sm_num_regular where  length(type) = 6 `12
    var sqlA: string = `select * from sm_num_regular where  length(type) = 8 and id = ${qid} `
    return Promise.resolve(this.Mysql.exec(sqlA)).then((res) => {
      data = res.results
      donext()
    }).catch(res => {
      return res
    })

    function donext() {
      if (a >= data.length) {
        console.log('结束！')
      }
      let item = data[a]
      insertData(item.name, item.id, item.type, a)
    }
    function insertData(reg: string, id: Number, type: string, index: number) {
      const rega: any = new RegExp(reg)
      var sql: string = `insert into sm_num_1 (id, new_sm_num_regular_id, sm_num, row_status, row_state, money, create_time, occupy) VALUES ? `
      console.log(`开始执行第${index}个 ${new Date().toLocaleString()}`)
      var regb = /(.*)(.)$/;
      const from: Number = Number('1' + type.replace(regb, function (b) {
        return b.replace(/./g, "0");
      }))
      const starta: Number = Number(from) / 10
      const max = Number(from) - 1
      // let enda:Number=0
      let pedometer = 5
      let enda = () => {
        if (max > 10000000) {
          return Number(starta) + pedometer * Number(starta)
        } else {
          return max
        }
      }
      doinsert(starta)
      function doinsert(start: Number) {
        const data = []
        let numberlast = enda()
        for (let i: any = start; i < numberlast; i++) {
          if (rega.test(String(i))) {
            const arr = String(i)
            if (arr[2] === arr[3] && arr[3] === arr[4] && (Number(arr[1]) + 2 === Number(arr[5]) && Number(arr[0]) + 4 === Number(arr[6]))) {
              data.push([i, id, String(i), "1", "0", 123, new Date().toLocaleString(), 1])
            }
          }
        }
        console.log(data.length)
        if (data.length > 0) {
          Promise.resolve(that.Mysql.exec(sql, data)).then((res) => {
            if (!res.err) {
              if (numberlast >= max) {
                a++
                return
                donext()
              } else {
                pedometer++
                doinsert(numberlast)
              }

            } else {
              logger.error(res.err)
            }
          }).catch((e) => {
            console.log(e)
          })
        } else {
          if (numberlast >= max) {
            a++
            donext()
          } else {
            pedometer++
            doinsert(numberlast)
          }
        }
      }
    }
  }
  @Method('/queryx')
  XXX(param: any): any {
    let data: Array<{
      name: string,
      id: Number,
      type: string,
    }> = []
    let qid = eval(param.data || [])
    console.log(qid)
    // let a: number = 0
    const that = this
    console.log(`开始时间: ${new Date().toLocaleString()}`)
    // var sqlA: string = `select * from sm_num_regular where  length(type) = 6 `12
    var sqlA: string = `select * from user_alipay`
    return Promise.resolve(this.Mysql.exec(sqlA)).then((res) => {
      data = res.results
      console.log(BigInt(data[1].id))
      // donext()
    }).catch(res => {
      donext()
      return res
    })

    function donext() {
      // if (a >= data.length) {
      //   console.log('结束！')
      // }
      // let item = data[a]
      insertData(data)
    }
    //{reg: string, id: Number, type: string, index: number}
    function insertData(reg: any) {
      var sql: string = `insert into sm_num_1 (id, new_sm_num_regular_id, sm_num, row_status, row_state, money, create_time, occupy) VALUES ? `
      // console.log(`开始执行第${index}个 ${new Date().toLocaleString()}`)
      // var regb = /(.*)(.)$/;
      // const rega: any = new RegExp(reg)
      //20240000
      const data: any = []
      const nums = []
      for (let i: any = 19400000; i < 20210000; i++) {
        // if (rega.test(String(i))) {
        const arr = String(i)
        if (that.dateFormat(`${arr[0]}${arr[1]}${arr[2]}${arr[3]}-${arr[4]}${arr[5]}-${arr[6]}${arr[7]}`) !== 'Invalid date') {
          nums.push(String(i))
        }
        // }
      }
      // const aa: any = []
      nums.map(num => {
        for (let i = 0; i < reg.length; i++) {
          const rega: any = new RegExp(reg[i].name)
          if (rega.test(String(num))) {
            break
          }
          if (i === reg.length - 1) {
            // aa.push(num)
            data.push([num, 268, String(num), "1", "0", 123, new Date().toLocaleString(), 1])
          }
        }
      })
      // data.push([i, id, String(i), "1", "0", 123, new Date().toLocaleString(), 1])
      // console.log(nums.length)
      // console.log(data)
      Promise.resolve(that.Mysql.exec(sql, data)).then((res) => {
        if (!res.err) {
          console.log('over')
        } else {
          logger.error(res.err)
        }
      }).catch((e) => {
        console.log(e)
      })
    }
  }
}
export default new Test()
