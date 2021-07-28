function Path(params: string) {
  return function (target: any) {
    target.prototype.path = params
    for (let key in target.prototype) {
      if (key.indexOf("/") > -1) {
        target.prototype[`${target.prototype.path}` + key] =
          target.prototype[key]
        delete target.prototype[key]
      }
    }
  }
}
function Method(params: any) {
  return function (target: any, attr: any) {
    target[params] = target[attr]
  }
}
export { Path, Method }
