import send from '../config/MailConfig'
import moment from 'moment'
import jsonwebtoken from 'jsonwebtoken'
import config from '../config'
import { checkCode } from '../common/utils'
import UsersModel from '../model/User'

class LoginController {
  constructor() {}
  async forget (ctx, next) {
    const { body } = ctx.request
    try {
      const result = await send({
        code: '1234',
        expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        email: body.username,
        user: '海绵先生'
      })

      ctx.body = {
        code: 200,
        data: result,
        mag: '邮件发送成功'
      }
    } catch (e) {
      console.log(e)
    }
  }
   async login (ctx, next) {
    const { body: { username, password, code, sid } } = ctx.request
    if (await checkCode(sid, code)) {
      let checkUserPassword = false
      let user = await UsersModel.findOne({ username })
      if (user.password === password) {
        checkUserPassword = true
      }
      if (checkUserPassword) {
        const token = jsonwebtoken.sign(
          {
            _id: 'hmxs_hmbb'
          },
          config.JWT_SECRET,
          {
            expiresIn: '1d'
          }
        )
        ctx.body = {
          code: 200,
          msg: token
        }
      } else {
        ctx.body = {
          code: 404,
          msg: '用户名或密码错误'
        }
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '图形验证码不正确'
      }
    }
  }
}

export default new LoginController()