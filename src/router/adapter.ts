import express from 'express';
import { service } from '../service/init'
import { verify } from '../service/token'
import fs from 'fs'
import whileList from './whiteList'
import logger from '../core/logger';
import md5 from 'md5'
import Visit from '../core/request'
let poollocal: any = {}
let poolbase: any = {}
let pool: any = {}
const clientCheck: boolean = false
require('express-async-errors')
const Call = (method: string, param: object, _req: express.Request, _res: express.Response) => {
  try {
    if (method.indexOf('uploadimage') > -1) {
      Promise.resolve(pool[method]({ req: _req, param })).then(res => {
        _res.send(res)
      }).catch(res => {
        _res.send(res)
      })
    } else if (method.indexOf('uploadget') > -1) {
      pool[method]({ req: _req, param, res: _res })
    } else {
      Promise.resolve(pool[method](param)).then(res => {
        _res.send(res)
      }).catch(res => {
        _res.send(res)
      })
    }
  } catch (e) {
    _res.send({ code: '500', message: ` ${method} is error:${JSON.stringify(e)}!` })
  }

}
function getPath(url: string): string {
  return url.replace('/api', "").split('?')[0].toLowerCase().replace(/\//g, '')
}
function getParam(_req: express.Request) {
  return Object.assign({}, _req.body, _req.query)
}
baseServiceInit()

export function Adapter(_req: express.Request, res: express.Response): any {
  // 拦截器
  let url = _req.path
  if (whileList.indexOf(url) === -1) {
    if (!verify(_req.header('token'))) {
      res.send({ message: '登录信息已过期, 请重新登录！', code: '500001' })
      return false
    }
    const keeloq = _req.header('keeloq')
    let timestamp: number = Math.round(Number(new Date()) / 1000)
    let chechexp = () => {
      return md5(String(timestamp) + `timestamps`) === keeloq || md5(String(timestamp - 1) + `timestamps`) === keeloq || md5(String(timestamp - 2) + `timestamps`) === keeloq
    }
    if (!chechexp() && clientCheck) {
      res.send({ message: '非法途径访问！', code: '500' })
      return false
    }
  }
  Visit.info('---------------------')
  Visit.info(`ip:${_req.ip}`)
  Visit.info(`method:${_req.method}`)
  Visit.info(`service:${_req.originalUrl}`)
  Visit.info(JSON.stringify(getParam(_req)))
  Visit.info('---------------------')
  Call(getPath(_req.originalUrl).replace('/api', ""), getParam(_req), _req, res)
}
function baseServiceInit() {
  Promise.resolve(service()).then((res) => {
    const poolbase = res
    pool = Object.assign(poollocal, poolbase)
    logger.info('model API is load')
  })
}
function readFold(foldPath: string) {
  fs.readdir(__dirname + foldPath, (_err, _files): void => {
    if (_err) {
      console.log(_err);
      return
    }
    for (const item of _files) {
      const module = require(`./modules/${item}`).default
      const method: any = {}
      for (let key in module) {
        if (key.indexOf('/') > -1) {
          method[key.toLowerCase().replace(/\//g, '')] = function (param: any) {
            return module[key].call(module, param)
          }
        }
      }
      poollocal = Object.assign(method, poollocal)
    }
    logger.info('local API is load')
  });
  pool = Object.assign(poolbase, poollocal)
}
readFold('/modules')
export function baseService() {
  baseServiceInit()
}