import SignRecordModel from '../model/SignRecord'
import UsersModel from '../model/User'
import { getJWTPayload } from '../common/utils'
import moment from 'moment'

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
            count: user.count + count
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
        favs: 5,
        count: 1
      }
    }
    ctx.body = {
      code: 200,
      data: {
        ...result,
        lastSign: record.created
      },
      msg: '请求成功'
    }
  }
}

export default new UserController()