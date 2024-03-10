import send from '../config/MailConfig'
import moment from 'moment'
import jsonwebtoken from 'jsonwebtoken'
import config from '../config'

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
  }
}

export default new LoginController()