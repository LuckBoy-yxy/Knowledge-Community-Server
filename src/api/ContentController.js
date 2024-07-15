import PostModel from '../model/Post'
import LinkModel from '../model/Link'
import UserCollect from '../model/UserCollect'
import fs from 'fs'
import moment from 'moment'
import uuid from 'uuid/v4'
import config from '../config'
import { checkCode, dirExists, getJWTPayload, rename } from '../common/utils'
import UsersModel from '../model/User'
// import mkdir from 'make-dir'

class ContentController {
  constructor () {

  }

  async getPostList (ctx, next) {
    const body = ctx.query
    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const pageSize = body.pageSize ? parseInt(body.pageSize) : 10

    const options = {}
    if (typeof body.catalog !== 'undefined' && body.catalog !== '') {
      options.catalog = body.catalog
    }
    if (typeof body.isTop !== 'undefined' && body.isTop !== '') {
      options.isTop = body.isTop
    }
    // if (typeof body.isEnd !== 'undefined' && body.isEnd !== '') {
    //   options.isEnd = body.isEnd
    // }
    if (typeof body.tag !== 'undefined' && body.tag !== '') {
      options.tags = { $elemMatch: { name: body.tag } }
    }
    if (typeof body.status !== 'undefined' && body.status !== '') {
      options.status = body.status
    }

    const result = await PostModel.getList(options, sort, page, pageSize)

    ctx.body = {
      code: 200,
      data: result,
      msg: '获取文章列表成功'
    }
  }

  async getTipsOrLinks (ctx, next) {
    const { type } = ctx.query
    let data = []
    if (typeof type !== 'undefined' && type !== '') {
      if (type === 'links') {
        data = await LinkModel.find({ type: 'links' })
      } else {
        data = await LinkModel.find({ type: 'tips' }) 
      }
    }

    ctx.body = {
      code: 200,
      data,
      msg: '获取成功'
    }
  }

  async getTopWeek (ctx, next) {
    const data = await PostModel.getTopWeek()
    ctx.body = {
      code: 200,
      data,
      msg: '获取本周热议列表成功'
    }
  }

  async uploadImg (ctx, next) {
    const file = ctx.request.files.file
    const ext = file.newFilename.split('.').pop()
    const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
    
    await dirExists(dir)

    const picName = uuid()
    const destPath = `${dir}/${picName}.${ext}`
    const reader = fs.createReadStream(file.filepath)
    const upStream = fs.createWriteStream(destPath)
    const filePath = `/${moment().format('YYYYMMDD')}/${picName}.${ext}`

    // method 1
    reader.pipe(upStream)

    // method 2
    // let totalLength = 0
    // // chunk 表示每次上传区块的数据
    // reader.on('data', chunk => {
    //   totalLength += chunk.length
    //   if (upStream.write(chunk) === false) {
    //     reader.pause()
    //   }
    // })
    // reader.on('drain', () => {
    //   reader.resume()
    // })
    // reader.on('end', () => {
    //   upStream.end()
    // })

    ctx.body = {
      code: 200,
      filePath,
      msg: '上传图片成功'
    }
  }

  async addPost (ctx, next) {
    const { body } = ctx.request
    const code = body.code
    const sid = body.sid
    const flag = await checkCode(sid, code)
    if (flag) {
      const obj = await getJWTPayload(ctx.header.authorization)
      const user = await UsersModel.findById(obj._id)
      if (body.fav > user.favs) {
        ctx.body = {
          code: 501,
          msg: '积分不足'
        }
        return
      } else {
        await UsersModel.updateOne({
          _id: obj._id
        }, {
          $inc: { favs: -body.fav }
        })
      }

      const newPost = new PostModel(body)
      newPost.uid = obj._id
      const result = await newPost.save()
      ctx.body = {
        code: 200,
        data: result,
        msg: '帖子发布成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '图片验证码错误'
      }
    }
  }

  async getPostDetail (ctx, next) {
    const params = ctx.query
    if (!params.tid) {
      ctx.body = {
        code: 500,
        msg: '参数错误'
      }
      return
    }

    const res = await PostModel.updateOne({ _id: params.tid }, {
      $inc: { reads: 1 }
    })
    const post = await PostModel.findByTid(params.tid)

    let isFav = 0
    const authorization = ctx.header.authorization
    if (typeof authorization !== 'undefined' && authorization !== '') {
      const obj = await getJWTPayload(authorization)
      if (obj) {
        const collect = await UserCollect.findOne({
          uid: obj._id,
          tid: params.tid
        })
        if (collect?.tid) {
          isFav = 1
        }
      }
    }
    const newPost = post.toJSON()
    newPost.isFav = isFav

    if (post._id && res) {
      // const post = await PostModel.findById({ _id: params.tid })
      const result = rename(newPost, 'uid', 'user')
      ctx.body = {
        code: 200,
        data: result,
        msg: '请求成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '请求失败'
      }
    }
  }

  async updatePost (ctx, next) {
    const { body } = ctx.request
    const code = body.code
    const sid = body.sid
    const flag = await checkCode(sid, code)
    if (flag) {
      const obj = await getJWTPayload(ctx.header.authorization)
      const post = await PostModel.findOne({ _id: body.tid })
      if (post.uid === obj._id) {
        if (post.isEnd !== '1') {
          const res = await PostModel.updateOne({ _id: body.tid }, body)
          if (res) {
            ctx.body = {
              code: 200,
              msg: '帖子编辑成功'
            }
          } else {
            ctx.body = {
              code: 500,
              msg: '帖子编辑成功'
            }
          }
        } else {
          ctx.body = {
            code: 500,
            msg: '帖子已结帖, 无法再编辑'
          }
        }
      } else {
        ctx.body = {
          code: 401,
          msg: '没有编辑权限'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '图片验证码错误'
      }
    }
  }

  async getPostByUid (ctx, next) {
    const params = ctx.query
    const page = params.page ? +params.page - 1 : 0
    const pageSize = +params.pageSize ? +params.pageSize : 10
    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
      return
    }

    const list = await PostModel.getListByUid(obj._id, page, pageSize)
    const total = await PostModel.countByUid(obj._id)
    if (list.length) {
      ctx.body = {
        code: 200,
        data: {
          list,
          total
        },
        msg: '获取成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '获取失败'
      }
    }
  }

  async delPostByUid (ctx, next) {
    const params = ctx.query
    const obj = await getJWTPayload(ctx.header.authorization)
    if (!obj) {
      ctx.body = {
        code: 401,
        msg: '请先登录'
      }
      return
    }

    const post = await PostModel.findOne({
      _id: params.tid,
      uid: obj._id
    })
    if (post.uid === obj._id) {
      if (post.isEnd === '0') {
        const result = await PostModel.deleteOne({ _id: params.tid })
        if (result) {
          ctx.body = {
            code: 200,
            msg: '删除成功'
          }
        } else {
          ctx.body = {
            code: 500,
            msg: '删除失败'
          }
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '帖子已结帖, 无法删除'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '无权限删除'
      }
    }
  }
}

export default new ContentController()