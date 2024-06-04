import send from '../config/MailConfig'
import moment from 'moment'
import jsonwebtoken from 'jsonwebtoken'
import config from '../config'
import { checkCode } from '../common/utils'
import UsersModel from '../model/User'
import SignRecordModel from '../model/SignRecord'

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
        const arr = ['password', 'username', 'roles']
        const userObj = user.toJSON()
        arr.forEach(item => {
          delete userObj[item]
        })
        const token = jsonwebtoken.sign(
          {
            // _id: 'hmxs_hmbb'
            _id: userObj._id
          },
          config.JWT_SECRET,
          {
            expiresIn: '1d'
          }
        )
        const signRecord = await SignRecordModel.findByUid(userObj._id)
        if (signRecord !== null) {
          if (moment().format('YYYY-MM-DD') === moment(signRecord.created).format('YYYY-MM-DD')) {
            userObj.isSign = true
          } else {
            userObj.isSign = false
          }
          userObj.lastSign = signRecord.created
        } else {
          userObj.isSign = false
        }
        ctx.body = {
          code: 200,
          data: {
            ...userObj,
            token
          },
          msg: '登录成功'
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
  async reg (ctx, next) {
    const { body: { username, name, password, code, sid } } = ctx.request
    const msg = {}
    if (await checkCode(sid, code)) {
      let isCheck = true
      const user1 = await UsersModel.findOne({ username })
      if (user1 !== null) {
        msg.email = ['此邮箱已被注册, 请进行忘记密码操作']
        isCheck = false
      }
      const user2 = await UsersModel.findOne({ name })
      if (user2 !== null) {
        msg.name = ['此用户名已被注册']
        isCheck = false
      }
      if (isCheck) {
        const user = new UsersModel({
          username,
          name,
          password,
          created: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        const res = await user.save()
        ctx.body = {
          code: 200,
          data: res,
          msg: '注册成功'
        }
        return
      }
    } else {
      msg.code = ['验证码错误或失效']
    }
    ctx.body = {
      code: 500,
      msg
    }
  }
}

export default new LoginController()