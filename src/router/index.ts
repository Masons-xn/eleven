import express from 'express'
import { Adapter } from './adapter'
const router = express.Router()


router.get(/$/, Adapter)
router.post(/$/, Adapter)


export default router
