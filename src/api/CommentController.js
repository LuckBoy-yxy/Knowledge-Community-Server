import CommentsModel from '../model/Comments'
import UsersModel from '../model/User'
import PostModel from '../model/Post'

import { checkCode, getJWTPayload } from '../common/utils'

class CommentController {
  async getComments (ctx, next) {
    const params = ctx.query
    const tid = params.tid
    const page = params.page ? params.page : 0
    const pageSize = params.pageSize ? +params.pageSize : 10

    const result = await CommentsModel.getCommentsList(tid, page, pageSize)
    const total = await CommentsModel.queryCount(tid)

    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '请求成功'
    }
  }

  async addComment (ctx, next) {
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
    ctx.body = {
      code: 200,
      data: comment,
      msg: '上传评论成功'
    }
  }

  async updateComment (ctx, next) {
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
}

export default new CommentController()