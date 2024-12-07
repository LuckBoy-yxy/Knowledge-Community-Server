import ErrorRecord from '../model/ErrorRecord'

class ErrorController {
  async getErrorList (ctx) {
    const query = {}
    const params = ctx.query

    const page = params.page ? +params.page - 1 : 0
    const pageSize = params.pageSize ? +params.pageSize : 10

    const result = await ErrorRecord.find(query)
     .skip(page * pageSize)
     .limit(pageSize)
     .sort({ created: -1 })
    const total = await ErrorRecord.find(query).countDocuments()

    ctx.body = {
      code: 200,
      msg: '查询成功',
      data: result,
      total: total
    }
  }

  async deleteError (ctx) {
    const { body } = ctx.request
    const result = await ErrorRecord.deleteMany({ _id: { $in: body.ids } })
    ctx.body = {
      code: 200,
      msg: '删除成功',
      data: result
    }
  }

  async addError (ctx) {
    const { body } = ctx.request
    const error = new ErrorRecord(body)
    const result = await error.save()
    ctx.body = {
      code: 200,
      msg: '保存成功',
      data: result
    }
  }
}

export default new ErrorController()