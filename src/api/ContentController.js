import PostModel from '../model/Post'

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
}

export default new ContentController()