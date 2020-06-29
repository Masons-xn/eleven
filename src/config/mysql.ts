const devConnection = {
  user: 'root',
  host: '122.51.77.238',
  password: '123456',
  database: 'mysite',
  port: 33306
}

// const proConnection = {
//   user: 'root',
//   host: '122.51.77.238',
//   password: '123456',
//   database: 'mysite',
//   port: 33306
// }

export default () => {
  return process.env.NODE_ENV === 'production' ? devConnection : devConnection
}
