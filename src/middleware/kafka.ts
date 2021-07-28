/*
 * @Description:
 * @Author: 希宁
 * @Date: 2021-05-08 16:29:47
 * @LastEditTime: 2021-05-08 17:21:53
 * @LastEditors:
 */
const { Kafka } = require("kafkajs")
export const kafkaTest = () => {
  const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["localhost:9092"],
  })

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: "test-group" })

  const run = async () => {
    // Producing
    await producer.connect()
    let l = 1
    setTimeout(() => {
      producer.send({
        topic: "test",
        messages: [{ value: "{json}" + l }],
      })
      l++
    }, 5000)

    // Consuming
    await consumer.connect()
    await consumer.subscribe({ topic: "test", fromBeginning: true })

    await consumer.run({
      eachMessage: async (res: any) => {
        console.log({
          // partition: res.partition,
          // offset: res.message.offset,
          value: res.message.value.toString(),
        })
      },
    })
  }

  run().catch(console.error)
}
