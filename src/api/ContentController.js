import PostModel from '../model/Post'
import LinkModel from '../model/Link'
import fs from 'fs'
import moment from 'moment'
import uuid from 'uuid/v4'
import config from '../config'
import { dirExists } from '../common/utils'
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
}

export default new ContentController()