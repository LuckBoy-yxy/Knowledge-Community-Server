class DemoController {
  constructor() {}
  async demo(ctx, next) {
    ctx.body = {
      msg: 'Hello Demo!!!!'
    }
  }
}

export default new DemoController()