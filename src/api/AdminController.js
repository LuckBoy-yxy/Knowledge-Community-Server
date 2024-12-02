import MenuModel from '../model/Menus'
import RolesModel from '../model/Roles'
import UsersModel from '../model/User'
import PostModel from '../model/Post'
import CommentsModel from '../model/Comments'
import SignRecordModel from '../model/SignRecord'

import { getMenuData, getRights } from '../common/utils'

import moment from 'moment'

class AdminController {
  async getMenu (ctx) {
    const res = await MenuModel.find({})

    ctx.body = {
      code: 200,
      data: res,
      msg: '菜单查询成功'
    }
  }

  async addMenu (ctx) {
    const { body } = ctx.request
    const menu = new MenuModel(body)
    const res = await menu.save()

    ctx.body = {
      code: 200,
      data: res,
      msg: '菜单添加成功'
    }
  }

  async updateMenu (ctx) {
    const { body } = ctx.request
    const data = { ...body }
    // delete data._id
    const res = await MenuModel.updateOne({
      _id: body._id
    }, { ...data })

    if (res) {
      ctx.body = {
        code: 200,
        data: res,
        msg: '菜单更新成功'
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '菜单更新失败'
      }
    }
  }

  async deleteMenu (ctx) {
    const { body } = ctx.request
    const res = await MenuModel.deleteOne({ _id: body._id })

    if (res) {
      ctx.body = {
        code: 200,
        data: res,
        msg: '菜单删除成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '菜单删除失败'
      }
    }
  }

  async getRoles (ctx) {
    const result = await RolesModel.find({})
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async addRole (ctx) {
    const { body } = ctx.request
    const role = new RolesModel(body)
    const result = await role.save()
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async updateRole (ctx) {
    const { body } = ctx.request
    const data = { ...body }
    const result = await RolesModel.updateOne({ _id: body._id }, { ...data })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async deleteRole (ctx) {
    const { body } = ctx.request
    const result = await RolesModel.deleteOne({ _id: body._id })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  async getRoleNames (ctx) {
    const res = await RolesModel.find({}, { menu: 0, desc: 0 })
    ctx.body = {
      code: 200,
      data: res
    }
  }

  async getRoutes (ctx) {
    const user = await UsersModel.findOne({ _id: ctx._id }, { roles: 1 })
    const { roles } = user
    let menus = []
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const rights = await RolesModel.findOne({ role }, { menu: 1 })
      menus = menus.concat(rights.menu)
    }
    menus = Array.from(new Set(menus))
    
    const treeData = await MenuModel.find({})
    const routes = getMenuData(treeData, menus, ctx.isAdmin)

    ctx.body = {
      code: 200,
      data: routes
    }
  }

  async getOperations (ctx) {
    const user = await UsersModel.findOne({ _id: ctx._id }, { roles: 1 })
    const { roles } = user
    let menus = []
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const rights = await RolesModel.findOne({ role }, { menu: 1 })
      menus = menus.concat(rights.menu)
    }
    menus = Array.from(new Set(menus))
    
    const treeData = await MenuModel.find({})
    const operations = getRights(treeData, menus)

    return operations
    // ctx.body = {
    //   code: 200,
    //   data: operations
    // }
  }

  async getStat (ctx) {
    let res = {}
    const inforCardData = []
    const newZero = new Date().setHours(0, 0, 0, 0)

    const time = moment().format('YYYY-MM-DD 00:00:00')
    const userNewCount = await UsersModel.find({
      created: { $gte: time }
    }).countDocuments()
    // const userNewCount = await UsersModel.find({
    //   created: {
    //     $gte: moment().set({
    //       hour: 0,
    //       minute: 0,
    //       second: 0,
    //       millisecond: 0
    //     })
    //   }
    // }).countDocuments()

    const postsCount = await PostModel.find({}).countDocuments()

    const commentsNewCount = await CommentsModel.find({
      created: { $gte: time }
    }).countDocuments()

    const startTime = moment(newZero).weekday(1).format()
    const endTime = moment(newZero).weekday(8).format()

    const weekEndCount = await CommentsModel.find({
      created: { $gte: startTime, $lte: endTime },
      isBest: '1'
    }).countDocuments()

    const signWeebCount = await SignRecordModel.find({
      created: { $gte: startTime, $lte: endTime }
    }).countDocuments()

    const postWeekCount = await PostModel.find({
      created: { $gte: startTime, $lte: endTime }
    }).countDocuments()

    inforCardData.push(userNewCount)
    inforCardData.push(postsCount)
    inforCardData.push(commentsNewCount)
    inforCardData.push(weekEndCount)
    inforCardData.push(signWeebCount)
    inforCardData.push(postWeekCount)

    const pieData = {}
    const postsCatalogCount = await PostModel.aggregate([
      { $group: { _id: '$catalog', count: { $sum: 1 } } }
    ])
    postsCatalogCount.forEach(item => {
      pieData[item._id] = item.count
    })

    const startMonth = moment(newZero).subtract(5, 'M').date(1).format()
    // const endMonth = moment('2024-12-02').date(31).format('YYYY-MM-DD 23:59:59')
    const endMonth = moment(newZero).add(1, 'M').date(1).format()
    let monthData = await PostModel.aggregate([
      { 
        $match: {
          created: {
            $gte: new Date(startMonth),
            $lte: new Date(endMonth)
          }
        }
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: '$created'
            }
          }
        }
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
    monthData = monthData.reduce((obj, item) => {
      return {
        ...obj,
        [item._id]: item.count
      }
    }, {})

    res = {
      inforCardData,
      pieData,
      monthData
    }

    ctx.body = {
      code: 200,
      data: res
    }
  }
}

export default new AdminController()