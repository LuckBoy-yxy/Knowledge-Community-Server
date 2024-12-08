import ErrorRecord from '../model/ErrorRecord'
import qs from 'qs'

class ErrorController {
  async getErrorList (ctx) {
    let query = {}
    const params = ctx.query
    const obj = qs.parse(params)

    const page = params.page ? +params.page - 1 : 0
    const pageSize = params.pageSize ? +params.pageSize : 10
    query = obj.filter ? { ...obj.filter } : {}
    if (query.method) {
      query.method = {
        $regex: query.method,
        $options: 'i'
      }
    }

    const result = await ErrorRecord.find(query)
     .skip(page * pageSize)
     .limit(pageSize)
     .sort({ created: -1 })
    const total = await ErrorRecord.find(query).countDocuments()

    const codeFilter = await ErrorRecord.aggregate([
      {
        $group: {
          _id: '$code'
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    const methodFilter = await ErrorRecord.aggregate([
      {
        $group: {
          _id: '$method'
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    ctx.body = {
      code: 200,
      msg: '查询成功',
      data: result,
      total: total,
      filters: {
        // method: methodFilter,
        method: methodFilter.map(item => {
          return {
            label: item._id,
            value: item._id.toLowerCase()
          }
        }),
        // code: codeFilter
        code: codeFilter.map(item => {
          return {
            label: item._id,
            value: +item._id
          }
        })
      }
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