
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://root:123456@:27017/mongo";
// const client = new MongoClient(url, { useNewUrlParser: true });
const config = {

}

// MongoClient.connect(url, { useNewUrlParser: true }, function (err: any, db: { close: () => void; }) {
//   if (err) throw err;
//   console.log("数据库已创建!");
//   db.close();
// })
class app {
  static instance: any;
  dbClient: string;
  // 多次连接共享实例对象
  static getInstance() {
    if (!app.instance) {
      app.instance = new app();
    };
    // 简化性能提升
    return app.instance;
  }

  constructor() {
    this.dbClient = '';
    this.connect()
  };
  connect() {
    return new Promise((resolve, reject) => {
      if (!this.dbClient) {
        MongoClient.connect('mongodb://' + config.username + ':' + config.password + '@' + config.address + ':' + config.port + '/', {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }, (err: any, client: { db: (arg0: string) => string; }) => {
          if (!err) {
            // console.log('链接成功！')
            this.dbClient = client.db(config.database);
            resolve(this.dbClient);
          } else {
            reject(err);
          };
        });
      } else {
        resolve(this.dbClient);
      };
    });
  }
  // 添加
  add(tableName: any, json: any) {
    return new Promise((resolve, reject) => {
      this.connect().then((db: any) => {
        db.collection(tableName).insertOne(json, (err: any, result: any) => {
          if (!err) {
            resolve(result);
            return;
          };
          reject(err);
        });
      });
    });
  };
  // 删除
  remove(tableName: any, json: any) {
    return new Promise((resolve, reject) => {
      this.connect().then((db: any) => {
        db.collection(tableName).removeOne(json, (err: any, result: any) => {
          if (!err) {
            resolve(result);
            return;
          };
          reject(err);
        });
      });
    });
  };
  // 更新
  update(tableName: any, condition: any, json: any) {
    return new Promise((resolve, reject) => {
      this.connect().then((db: any) => {
        db.collection(tableName).updateOne(condition, {
          $set: json
        }, (err: any, result: any) => {
          if (!err) {
            resolve(result);
            return;
          };
          reject(err);
        });
      });
    });
  };
  // 查询
  find(tableName: any, json: any) {
    return new Promise((resolve, reject) => {
      this.connect().then((db: any) => {
        let result = db.collection(tableName).find(json);
        result.toArray((err: any, data: any) => {
          if (!err) {
            resolve(data);
            return;
          }
          reject(err);
        });
      });
    });
  };
};
export default app.getInstance()