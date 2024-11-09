import SignRecordModel from '../model/SignRecord'
import UsersModel from '../model/User'
import UserCollect from '../model/UserCollect'
import CommentsModel from '../model/Comments'
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
    let message = ''
    const { body } = ctx.request
    const obj = await getJWTPayload(ctx.header.authorization)
    const user = await UsersModel.findOne({ _id: obj._id })
    if (body.username && body.username !== user.username) {
      const tmpUser = await UsersModel.findOne({ username: body.username })
      if (tmpUser !== null && tmpUser.password) {
        ctx.body = {
          code: 501,
          msg: '修改的邮箱已存在, 请更换'
        }
        return
      }

      const key = uuid()
      setValue(key, jwt.sign({
        _id: obj._id
      }, config.JWT_SECRET, {
        expiresIn: '30m'
      }))
      await send({
        type: 'email',
        data: {
          username: body.username,
          key,
        },
        code: '',
        expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        // email: body.username,
        email: user.username,
        user: user.name
      })
      // ctx.body = {
      //   code: 500,
      //   data: res,
      //   msg: '发送邮件成功, 请点击链接确认修改邮件账号'
      // }
      message = '更新基本信息成功, 账号的修改需要邮件确认, 请查收邮件'
    }

    const arr = ['username', 'password', 'mobile']
    arr.forEach(item => {
      delete body[item]
    })
    const res = await UsersModel.updateOne({_id: obj._id}, body)
    if (res.matchedCount === 1) {
      // ctx.body = {
      //   code: 200,
      //   msg: '用户基本信息更新成功'
      // }
      ctx.body = {
        code: 200,
        msg: message ? message : '用户基本信息更新成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '用户基本信息更新失败'
      }
    }
  }

  async updateUserName (ctx, next) {
    const body = ctx.query
    if (body.key) {
      const token = await getValue(body.key)
      const obj = getJWTPayload('Bearer ' + token)
      const arr = ['password', 'mobile']
      arr.forEach(item => {
        delete body[item]
      })
      await UsersModel.updateOne({ _id: obj._id }, {
        username: body.username
      })
      ctx.body = {
        code: 200,
        msg: '更新用户名成功'
      }
    }
  }

  async changePasswd (ctx, next) {
    const { body } = ctx.request
    const obj = await getJWTPayload(ctx.header.authorization)
    const user = await UsersModel.findOne({ _id: obj._id })
    if (user.password === body.oldpwd) {
      await UsersModel.updateOne(
        { _id: obj._id },
        { $set: { password: body.newpwd } }
      )
      ctx.body = {
        code: 200,
        msg: '修改密码成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '旧密码不匹配'
      }
    }
  }

  async setCollect (ctx, next) {
    const params = ctx.query
    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
      return
    }

    // const isFav = params.isFav
    const isFav = +params.isFav
    if (isFav) {
      await UserCollect.deleteOne({
        uid: obj._id,
        tid: params.tid
      })
      ctx.body = {
        code: 200,
        msg: '取消收藏成功'
      }
    } else {
      const newCollect = new UserCollect({
        uid: obj._id,
        tid: params.tid,
        title: params.title
      })
      const result = await newCollect.save()
      if (result.uid) {
        ctx.body = {
          code: 200,
          data: result,
          msg: '收藏成功'
        }
      }
    }
  }

  async getCollectByUid (ctx, next) {
    const params = ctx.query
    const page = +params.page ? +params.page - 1 : 0
    const pageSize = +params.pageSize ? +params.pageSize : 10
    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
    }

    const collectList = await UserCollect.getListByUid(obj._id, page, pageSize)
    const total = await UserCollect.countByUid(obj._id)
    if (collectList.length) {
      ctx.body = {
        code: 200,
        data: collectList,
        total,
        msg: '获取成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '获取失败'
      }
    }
  }

  async getBaseUserInfo (ctx, next) {
    const params = ctx.query
    const obj = await getJWTPayload(ctx.header.authorization)
    const uid = params.uid || obj._id
    // if (!params.uid) {
    //   ctx.body = {
    //     code: 401,
    //     msg: '缺少必要参数 uid'
    //   }
    //   return
    // }

    let info = await UsersModel.findById(uid)
    info = info.toJSON()
    const date = moment().format('YYYY-MM-DD')
    const result = await SignRecordModel.findOne({
      uid: uid,
      created: { $gte: date + ' 00:00:00' }
    })
    if (result?.uid) {
      info.isSign = true
    } else {
      info.isSign = false
    }

    if (info?._id) {
      ctx.body = {
        code: 200,
        data: info,
        msg: '获取成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '获取失败'
      }
    }
  }

  async getMsg (ctx, next) {
    const params = ctx.query
    const page = +params.page ? +params.page - 1 : 0
    const pageSize = +params.pageSize ? +params.pageSize : 10

    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
      return
    }

    const commentList = await CommentsModel.getMsgList({
      id: obj._id,
      page,
      pageSize
    })
    if (commentList.length) {
      const total = await CommentsModel.msgCount(obj._id)
      ctx.body = {
        code: 200,
        data: commentList,
        total,
        msg: '获取成功'
      }
    } else {
      ctx.body = {
        code: 200,
        data: [],
        msg: '暂无任何消息'
      }
    }
  }

  async setMsg (ctx, next) {
    const params = ctx.query
    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
      return
    }

    if (params.id) {
      const result = await CommentsModel.updateOne({
        _id: params.id
      }, { isRead: '1' })
      if (result) {
        ctx.body = {
          code: 200,
          msg: '删除成功'
        }
      }
    } else {
      const result = await CommentsModel.updateMany({
        uid: obj._id
      }, { isRead: '1' })
      if (result) {
        ctx.body = {
          code: 200,
          msg: '清除成功'
        }
      }
    }
  }

  async getUsers (ctx, next) {
    const params = ctx.query
    const page = params.page ? +params.page - 1 : 0
    const pageSize = params.pageSize ? +params.pageSize : 10
    const sort = params.sort || 'created'
    const res = await UsersModel.getList({}, page, pageSize, sort)
    const total = await UsersModel.countList({})
    ctx.body = {
      code: 200,
      data: res,
      total,
      msg: '用户列表获取成功'
    }
  }

  async deleteUserById (ctx, next) {
    const id = ctx.params.id
    const user = await UsersModel.findOne({_id: id})
    if (user) {
      const res = await UsersModel.deleteOne({_id: user._id})
      if (res) {
        ctx.body = {
          code: 200,
          msg: '用户删除成功'
        }
      } else {
        ctx.body = {
          code: 200,
          msg: '用户删除失败'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '用户不存在或 id 信息错误'
      }
    }
  }

  async updateUserById (ctx, next) {
    const { body } = ctx.request
    const user = await UsersModel.findOne({
      _id: body._id
    })
    if (!user) {
      ctx.body = {
        code: 500,
        msg: '用户不存在'
      }
      return
    }

    // if (body.username !== user.username) {
    //   const checkUserName = await UsersModel.findOne({
    //     username: body.username
    //   })
    //   if (checkUserName) {
    //     ctx.body = {
    //       code: 401,
    //       msg: '更新的邮箱已存在'
    //     }
    //   }
    //   return
    // }

    if (body.password) {
      // body.password = await bcrypt.hash(body.password, 5)
    }

    const res = await UsersModel.updateOne({
      _id: body._id
    }, body)
    ctx.body = {
      code: 200,
      msg: '更新成功'
    }
  }

  async checkUserName (ctx, next) {
    const params = ctx.query
    const res = await UsersModel.findOne({
      username: params.username
    })
    let data = 1
    if (res) {
      data = 0
    }
    ctx.body = {
      code: 200,
      data
    }
  }

  async addUser (ctx, next) {
    const { body } = ctx.request
    // body.password = await bcrypt.hash(body.password, 5)
    const user = new UsersModel(body)
    let res = await user.save()
    const userObj = res.toJSON()
    const arr = ['password']
    arr.forEach(item => (delete userObj[item]))
    if (res) {
      ctx.body = {
        code: 200,
        msg: '添加用户成功',
        data: res
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '添加用户失败'
      }
    }
  }
}

export default new UserController()