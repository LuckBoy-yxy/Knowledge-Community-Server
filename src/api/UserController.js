import SignRecordModel from '../model/SignRecord'
import UsersModel from '../model/User'
import { getJWTPayload } from '../common/utils'
import moment from 'moment'
import send from '../config/MailConfig'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'
import { setValue, getValue } from '../config/RedisConfig'
import config from '../config'

class UserController {
  async userSign (ctx, next) {
    let result = ''
    let newRecord = {}
    const obj = await getJWTPayload(ctx.header.authorization)
    const record = await SignRecordModel.findByUid(obj._id)
    const user = await UsersModel.findById(obj._id)
    if (record !== null) {
      if (moment(record.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
        ctx.body = {
          code: 500,
          data: {
            favs: user.favs,
            count: user.count,
            lastSign: record.created
          },
          msg: '用户今日已经签到过了'
        }
        return
      } else {
        let fav = 0 
        let count = user.count
        if (moment().subtract(1, 'days').format('YYYY-MM-DD') === moment(record.created).format('YYYY-MM-DD')) {
          count += 1
          if (count < 5) {
            fav = 5
          } else if (count >= 5 && count < 15) {
            fav = 10
          } else if (count >= 15 && count < 30) {
            fav = 15
          } else if (count >= 30 && count < 100) {
            fav = 20
          } else if (count >= 100 && count < 365) {
            fav = 30
          } else if (count >= 365) {
            fav = 50
          }
          await UsersModel.updateOne({
            _id: obj._id
          }, {
            $inc: { favs: fav, count: 1 }
          })
          result = {
            favs: user.favs + fav,
            count: user.count + 1
          }
        } else {
          fav = 5
          await UsersModel.updateOne({
            _id: obj._id
          }, {
            $set: { count: 1 },
            $inc: { favs: fav }
          })
          result = {
            favs: user.favs + fav,
            count: 1
          }
        }
        newRecord = new SignRecordModel({
          uid: obj._id,
          favs: fav,
        })
        await newRecord.save()
      }
    } else {
      await UsersModel.updateOne({
        _id: obj._id
      }, {
        $set: { count: 1 },
        $inc: { favs: 5 }
      })
      newRecord = new SignRecordModel({
        uid: obj._id,
        favs: 5,
      })
      await newRecord.save()
      result = {
        favs: user.favs + 5,
        count: 1
      }
    }
    ctx.body = {
      code: 200,
      data: {
        ...result,
        lastSign: newRecord.created
      },
      msg: '请求成功'
    }
  }

  async updateUserInfo (ctx, next) {
    const { body } = ctx.request
    const obj = await getJWTPayload(ctx.header.authorization)
    const user = await UsersModel.findOne({ _id: obj._id })
    if (body.username && body.username !== user.username) {
      const key = uuid()
      setValue(key, jwt.sign({
        _id: obj._id
      }, config.JWT_SECRET, {
        expiresIn: '30m'
      }))
      const res = await send({
        type: 'email',
        key,
        code: '',
        expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        // email: body.username,
        email: user.username,
        user: user.name
      })
      ctx.body = {
        code: 500,
        data: res,
        msg: '发送邮件成功, 请点击链接确认修改邮件账号'
      }
    } else {
      const arr = ['username', 'password', 'mobile']
      arr.forEach(item => {
        delete body[item]
      })
      const res = await UsersModel.updateOne({_id: obj._id}, body)
      if (res.n === 1 && res.ok === 1) {
        ctx.body = {
          code: 200,
          msg: '用户基本信息更新成功'
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '用户基本信息更新失败'
        }
      }
    }
  }

  async updateUserName (ctx, next) {
    const body = ctx.query
    if (body.key) {
      const token = getValue(key)
      const obj = getJWTPayload('Bearer' + token)
      const arr = ['username', 'password', 'mobile']
    }
  }
}

export default new UserController()