import Service from '../../service/service'
import { innerService } from '../../service/init'
import path from 'path'
import { Path, Method } from '../decoratord'
var formidable = require('formidable');
import fs from 'fs'
// <script src="'+this.options.UEDITOR_HOME_URL+'third-party/jquery-1.10.2.min.js"></script>
let targetDir = path.resolve('./public/images');
@Path('/upload')
class Upload extends Service {
  public base: string = '123123'
  public method: Array<any> | undefined;
  constructor() {
    super();
  }
  @Method('/image')
  aa(request: { req: any, param?: object }): any {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.resolve('./public/tmp');   //文件保存的临时目录为当前项目下的tmp文件夹  
    form.maxFieldsSize = 10 * 1024 * 1024;  //用户头像大小限制为最大1M    
    form.keepExtensions = true;        //使用文件的原扩展名  
    return new Promise((resolve: any, reject: any) => {
      form.parse(request.req, function (_err: Error, _fields: any, file: { [x: string]: { path: string; }; tmpFile: { path: string; }; }) {
        var filePath = '';
        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
        if (file.tmpFile) {
          filePath = file.tmpFile.path;
        } else {
          for (var key in file) {
            if (file[key].path && filePath === '') {
              filePath = file[key].path;
              break;
            }
          }
        }

        if (!fs.existsSync(targetDir)) {
          fs.mkdir(targetDir, () => { });
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));
        // if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
        //   reject({ code: '500', message: '此文件类型不允许上传' })
        // } else {
        var fileName = new Date().getTime() + fileExt;
        var targetFile = path.join(targetDir, fileName);
        fs.rename(filePath, targetFile, (err) => {
          if (err) {
            reject({ code: '500', message: '此文件类型不允许上传' })
          } else {
            var fileUrl = fileName;
            resolve(innerService['attachments'].add({ path: fileUrl }).then((res: any) => {
              return {
                code: '200',
                res: res.res
              }
            }))
          }
        });
        // }
      })
    })
  }
  @Method('/get')
  cc(param: any): any {
    innerService['attachments'].get(param.param).then((res: { path: string; }) => {
      if (res && res.path) {
        fs.readFile(`${targetDir}/${res.path}`, function (err, data) {
          if (!err) {
            param.res.set({
              'Content-Type': 'application/octet-stream',
              'Content-Length': '123',
            })
            param.res.send(Buffer.from(data))
          } else {
            param.res.send({
              code: '500',
              message: '文件不存在'
            })
          }
        });
      } else {
        param.res.send({
          code: '500',
          message: '数据错误'
        })
      }
    })
  }

}
export default new Upload()
