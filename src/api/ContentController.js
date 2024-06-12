import PostModel from '../model/Post'
import LinkModel from '../model/Link'
import fs from 'fs'
import moment from 'moment'
import uuid from 'uuid/v4'
import config from '../config'
// import { dirExists } from '../common/utils'
import mkdir from 'make-dir'

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
    // ctx.request.files 表示获取客户端中传递的过来的 formData 格式的表单数据
    // 因为 formData 中的数据可以有很多, 这里我们主要获取的是 formData 对象中的 file key 的 value 值
    // file 是我们在客户端中, 通过 formData.append 添加的二进制图片数据
    const file = ctx.request.files.file
    // 拿到客户端传递过来的图片后缀
    const ext = file.newFilename.split('.').pop()
    // dir 表示当前这种图片在服务器中, 存储的路径地址
    // 在存储图片时, 需要考虑到用户上传的图片名称可能有一样的; 那么后来上传的图片就会覆盖掉先前上传的同名图片
    // 通常情况下, 服务器去存储图片资源时, 我们会给每一张图片一个唯一的名称
    // 然后按照日期或资源数据, 进行分门别类存到对应的文件夹中
    // 这样做方便了后续的查找, 也不会出现将所有的图片都统一的存储到一个文件夹中; 在打开这一个文件夹时, 非常耗时的一个情况

    // config.uploadPath 表示资源文件夹的路径, 它需要区分开发环境和生产环境
    // 如: 在开发环境中, 客户端上传的图片资源是统一的存在在 public 文件夹下的
    // 因为我们会在 app koa 的应用实例中, 去挂载一个 koa-static 的中间件
    // 它会将 public 文件夹下, 所有的资源进行暴露; 那么客户端就可以直接的通过暴露的路径去拿到服务器中存储的图片资源, 在页面中显示出来

    // const dir = `${config.uploadPath}/path1/path2/${moment().format('YYYYMMDD')}`
    const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
    // // console.log(dir)

    await mkdir(dir)

    // 创建图片唯一的名称
    const picName = uuid()
    // 将图片存放最终的位置
    const destPath = `${dir}/${picName}.${ext}`
    // 读取文件流
    const reader = fs.createReadStream(file.filepath)
    // 上传的文件流
    const upStream = fs.createWriteStream(destPath)
    const filePath = `/${moment().format('YYYYMMDD')}/${picName}.${ext}`
    reader.pipe(upStream)
    ctx.body = {
      code: 200,
      filePath,
      msg: '上传图片成功'
    }
  }
}

export default new ContentController()