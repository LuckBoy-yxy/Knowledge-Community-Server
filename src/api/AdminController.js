import MenuModel from '../model/Menus'
import RolesModel from '../model/Roles'

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
}

export default new AdminController()