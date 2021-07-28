/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-03-31 17:18:08
 * @LastEditors:
 */
import express from "express"
import { Adapter } from "./adapter"
const router = express.Router()

router.get(/$/, Adapter)
router.post(/$/, Adapter)

export default router
