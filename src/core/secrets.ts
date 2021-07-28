/*
 * @Description:
 * @Author: 希宁
 * @Date: 2020-07-30 16:13:04
 * @LastEditTime: 2021-04-07 09:29:08
 * @LastEditors:
 */
const { NODE_ENV, HOST, PORT } = process.env

export default {
  IS_PROD: NODE_ENV === "production",
  HOST: typeof HOST === "undefined" ? "localhost" : HOST,
  PORT: typeof PORT === "undefined" ? 3002 : parseInt(PORT),
}
