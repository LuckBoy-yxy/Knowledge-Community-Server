import svgCaptcha from 'svg-captcha'
import { setValue, getValue } from '@/config/RedisConfig'
// import { setValue, getValue } from '../config/RedisConfig'

class PublicController {
  constructor() {}
  async getCaptcha(ctx, next) {
    const body = ctx.request.query
    const newCaptcha = svgCaptcha.create({
      size: 6,
      ignoreChars: '0o1i',
      color: true,
      noise: Math.floor(Math.random() * 5),
      width: 150,
      height: 50
    })
    setValue(body.sid, newCaptcha.text, 10 * 60)
    getValue(body.sid).then(res => {
      console.log(res)
    })

    ctx.body = {
      code: 200,
      data: newCaptcha.data
    }
  }
}

export default new PublicController()