import nodemailer from 'nodemailer'
import config from '../config'
import qs from 'qs'

// 定制邮件服务
// const sendInfo = {
//   // 验证码
//   code: '1234',
//   // 验证码过期时间
//   expire: '2024-02-05',
//   // 收件人邮箱
//   email: '3129166417@qq.com',
//   // 收件人昵称
//   user: '海绵先生'
// }

// 使用邮件服务
const transporter = nodemailer.createTransport({
  // 发件服务器域名
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: "3129166417@qq.com",
    pass: "ybrsejtraxytdeij"
  }
})

// 发送邮件
async function send(sendInfo) {
  const baseUrl = config.baseUrl
  const route = sendInfo.type === 'email' ? '/confirm' : '/reset'
  // 重置密码链接
  const url = `${baseUrl}/#${route}?` + qs.stringify(sendInfo.data)

  const info = await transporter.sendMail({
    // 谁发送的邮件(发件人和发送人邮箱)
    from: '"大帅" <3129166417@qq.com>',
    // 邮件发送给谁
    to: sendInfo.email,
    // 标题
    subject: sendInfo.user !== '' && sendInfo.type !== 'email' ? `你好开发者, ${sendInfo.user}! 《知识论坛》注册码` : '《知识论坛》确认修改邮件链接',
    // 纯文本的邮件内容
    text: `您在知识论坛中进行了注册, 您的邀请码是 ${sendInfo.code} , 邀请码的过期时间: ${sendInfo.expire}`,
    // 包含的 html 元素的邮件内容
    html: `
      <body>
        <div style="border: 1px solid #dcdcdc;color: #676767;width: 600px; margin: 0 auto; padding-bottom: 50px;position: relative;">
            <div style="height: 60px; background: #393d49; line-height: 60px; color: #58a36f; font-size: 18px;padding-left: 10px;">知识论坛——欢迎来到官方论坛</div>
            <div style="padding: 25px">
              <div>您好，${sendInfo.user}, 重置链接有效时间30分钟. 请在${sendInfo.expire}之前重置您的密码: </div>
              <a href="${url}" style="padding: 10px 20px; color: #fff; background: #009e94; display: inline-block;margin: 15px 0;">立即重置密码</a>
              <div style="padding: 5px; background: #f2f2f2;">如果该邮件不是由你本人操作, 请勿进行激活! 否则你的邮箱将会被他人绑定</div>
            </div>
            <div style="background: #fafafa; color: #b4b4b4;text-align: center; line-height: 45px; height: 45px; position: absolute; left: 0; bottom: 0;width: 100%;">系统邮件，请勿直接回复</div>
        </div>
      </body>
    `
  })
  // 控制台打印邮件发送成功信息
  // console.log("Message sent: %s", info.messageId)

  return 'Message sent: %s', info.messageId
}

// send().catch(console.error)

export default send