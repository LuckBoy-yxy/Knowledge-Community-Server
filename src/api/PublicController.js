import svgCaptcha from 'svg-captcha'

class PublicController {
  constructor() {}
  async getCaptcha(ctx, next) {
    const newCaptcha = svgCaptcha.create({
      size: 6,
      ignoreChars: '0o1i',
      color: true,
      noise: Math.floor(Math.random() * 5),
      width: 150,
      height: 50
    })
    ctx.body = {
      code: 200,
      data: newCaptcha.data
    }
  }
}

export default new PublicController()