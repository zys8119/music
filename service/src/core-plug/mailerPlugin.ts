import {Plugin} from "@wisdom-serve/serve/types/type"
import {createTransport, SendMailOptions} from "nodemailer"
import * as ncol from "ncol"
const mailerPlugin:Plugin = function (request, response, next){
    this.sendMail = async (mailOptions:SendMailOptions)=>{
        const server = createTransport(this.options.mailConfig)
        ncol.success("正在发送邮件：")
        ncol.log(`邮件发送数据：${JSON.stringify(mailOptions)}`)
        return server.sendMail({
            ...mailOptions,
            from:this.options.mailConfig.auth.user
        }).then((res)=>{
            ncol.success("邮件发送成功")
            return res
        }).catch((err)=>{
            ncol.error("邮件发送失败")
            ncol.error(err)
            throw Error("邮件发送失败")
        }).finally(()=>{
            server.close()
        })
    }
    return next()
}
export default mailerPlugin

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        sendMail(mailOptions:SendMailOptions):Promise<any>
    }
}
