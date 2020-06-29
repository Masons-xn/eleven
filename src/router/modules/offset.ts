import { Path, Method } from "../decoratord";
import Service from "../../service/service";

@Path('/Offset')
class Offset extends Service {
  constructor() {
    super();
  }
  @Method('/get')
  get(): any {
    return {
      code: '200',
      data: {
        timestamp: Math.round(Number(new Date()) / 1000),
      }
    }
  }
}

export default new Offset()