import CommentsModel from '../model/Comments'
import UsersModel from '../model/User'
import PostModel from '../model/Post'

class CommentController {
  async getComments (ctx, next) {
    const params = ctx.query
    const tid = params.tid
    const page = params.page ? params.page : 0
    const pageSize = params.pageSize ? params.pageSize : 10

    const result = await CommentsModel.getCommentsList(tid, page, pageSize)
    const total = await CommentsModel.queryCount(tid)

    ctx.body = {
      code: 200,
      deta: result,
      total,
      msg: '请求成功'
    }
  }
}

export default new CommentController()