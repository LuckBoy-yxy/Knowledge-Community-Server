import CommentsModel from '../model/Comments'
import CommentsHandsModel from '../model/CommentsHands'
import UsersModel from '../model/User'
import PostModel from '../model/Post'

import { checkCode, getJWTPayload } from '../common/utils'

const canReply = async ctx => {
  let res = false
  const obj = await getJWTPayload(ctx.header.authorization)
  if (typeof obj !== 'undefined' && obj._id !== '') {
    const user = await UsersModel.findById(obj._id)
    if (user.status !== '1') {
      res = true
    }
  } else {
    return res
  }
  return res
}

class CommentController {
  async getComments (ctx, next) {
    const params = ctx.query
    const tid = params.tid
    const page = params.page ? params.page : 0
    const pageSize = params.pageSize ? +params.pageSize : 10

    let result = await CommentsModel.getCommentsList(tid, page, pageSize)
    if (ctx.header.authorization) {
      const obj = await getJWTPayload(ctx.header.authorization)
      if (typeof obj !== 'undefined' && obj._id !== '') {
        result = result.map(comment => comment.toJSON())
        for (let i = 0; i < result.length; i++) {
          result[i].handed = '0'
          const hand = await CommentsHandsModel.findOne({
            uid: obj._id,
            cid: result[i]._id
          })
          if (hand && hand._id) {
            if (hand.uid === obj._id) {
              result[i].handed = '1'
            }
          }
        }
      }
    }

    const total = await CommentsModel.queryCount(tid)

    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '请求成功'
    }
  }

  async addComment (ctx, next) {
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '当前用户已被禁言, 请联系管理员'
      }
      return
    }

    const { body } = ctx.request
    const sid = body.sid
    const code = body.code

    const res = await checkCode(sid, code)
    if (!res) {
      ctx.body = {
        code: 401,
        msg: '图片验证码不正确'
      }
      return
    }
    const newComment = new CommentsModel(body)
    const userId = await getJWTPayload(ctx.header.authorization)
    newComment.cuid = userId._id
    const comment = await newComment.save()
    const result = await PostModel.updateOne({ _id: body.tid }, {
      $inc: { answer: 1 }
    })

    if (comment._id && result) {
      ctx.body = {
        code: 200,
        data: comment,
        msg: '上传评论成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '上传评论失败'
      }
    }
  }

  async updateComment (ctx, next) {
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '当前用户已被禁言, 请联系管理员'
      }
      return
    }

    const { body } = ctx.request
    const sid = body.sid
    const code = body.code

    const res = await checkCode(sid, code)
    if (!res) {
      ctx.bodty = {
        code: 401,
        msg: '图片验证码不正确'
      }
      return
    }
    const result = await CommentsModel.updateOne({ _id: body.cid }, {
      $set: body
    })
    if (result) {
      ctx.body = {
        code: 200,
        data: body,
        msg: '编辑成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '编辑失败'
      }
    }
  }

  async setBest (ctx, next) {
    const obj = await getJWTPayload(ctx.header.authorization)
    if (typeof obj === 'undefined' && obj._id === '') {
      ctx.body = {
        code: 401,
        msg: '用户未登录或用户为授权'
      }
      return
    }
    const params = ctx.query
    const post = await PostModel.findOne({ _id: params.tid })
    if (post.uid === obj._id && post.isEnd !== '1') {
      const res = await PostModel.updateOne({
        _id: params.tid
      }, {
        $set: { isEnd: '1' }
      })
      const res1 = await CommentsModel.updateOne({
        _id: params.cid
      }, {
        $set: { isBest: '1' }
      })
      if (res && res1) {
        const comment = await CommentsModel.findByCid(params.cid)
        const result2 = await UsersModel.updateOne({ _id: comment.cuid },{
          $inc: { favs: +post.fav }
        })
        if (result2) {
          ctx.body = {
            code: 200,
            msg: '采纳评论成功, 积分发放成功'
          }
        } else {
          ctx.body = {
            code: 500,
            msg: '积分发放失败'
          }
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '采纳评论失败'
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '帖子已结帖, 无法重复采纳'
      }
    }
  }

  async setHands (ctx, next) {
    const obj = await getJWTPayload(ctx.header.authorization)
    if (typeof obj === 'undefined' && obj._id === '') {
      ctx.body = {
        code: 401,
        msg: '用户未登录或用户未授权'
      }
      return
    }

    const params = ctx.query
    const tmp = await CommentsHandsModel.find({
      cid: params.cid,
      uid: obj._id
    })
    if (tmp.length) {
      ctx.body = {
        code: 500,
        msg: '请勿重复点赞'
      }
      return
    }

    const newHand = new CommentsHandsModel({
      cid: params.cid,
      uid: obj._id
    })
    const res = await newHand.save()
    if (res) {
      await CommentsModel.updateOne({ _id: params.cid }, {
        $inc: { hands: 1 }
      })
      ctx.body = {
        code: 200,
        msg: '点赞成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '点赞失败'
      }
    }
  }

  async getPublicCommentList (ctx, next) {
    const params = ctx.query
    const page = +params.page ? +params.page - 1 : 0
    const pageSize = +params.pageSize ? +params.pageSize : 10
    const uid = params.uid
    if (!uid) {
      ctx.body = {
        code: 401,
        msg: '参数错误, 缺少 uid'
      }
    }

    const commentList = await CommentsModel.getCommentPublic(uid, page, pageSize)
    if (commentList.length) {
      ctx.body = {
        code: 200,
        data: commentList,
        msg: '获取成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '获取失败'
      }
    }
  }
}

export default new CommentController()