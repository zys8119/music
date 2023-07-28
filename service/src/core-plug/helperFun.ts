import {Plugin, HttpHeadersType} from "@wisdom-serve/serve/types/type"
import {merge} from "lodash"
import * as ncol from "ncol"
const helperFun:Plugin = function (request, response, next){
    /**
     * 正常返回
     * @param data
     * @param options
     */
    this.$success = (data, options:any = {}, code = 200)=>{
        switch (Object.prototype.toString.call(options)){
            case "[object Object]":
                break;
            case "[object Number]":
                options = {
                    code:options as number
                }
                break;
            case "[object String]":
                options = {
                    message:options as string
                }
                break;
            default:
                throw Error("options 数据格式错误")
        }
        response.writeHead((options as any).statusCode || 200,
            merge(code === "send" ? {} :
                    merge(
                        {
                            "Content-Type":"application/json; charset=utf-8",
                        }, this.options.cors ? {
                            "access-control-allow-origin":request.headers.origin || "*",
                            "access-control-allow-methods":"*",
                            "access-control-allow-headers":this.options.corsHeaders || "*",
                        } : {},
                        this.options.credentials ? {
                            "access-control-allow-credentials":true as any,
                        } : {}
                    ),
                (options as any).headers || {}))
        if(this.options.debug){
            ncol.color(function (){
                this.successBG(`【响应 ${request.method}】`)
                    .success("==========")
                    .success(request.url)
            })
        }
        response.end(code === "send" ? data : JSON.stringify({
            code:options.code || code,
            data:options.data || data,
            message:options.message || "请求成功",
        }))
    }
    /**
     * 错误返回
     * @param data
     * @param options
     */
    this.$error = (data, options = {})=>{
        this.$success(data, merge(options,{
            message:"请求失败！"
        }), 403)
    }
    /**
     * 任意返回
     * @param data
     * @param options
     */
    this.$send = (data, options = {})=>{
        this.$success(data, options, "send")
    }
    return next()
}
export default helperFun

type Options = {
    data:any
    code:number
    message:string
    statusCode:number
    headers:Partial<HttpHeadersType>
}
declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $success?(data?:any, options?:Partial<Options> | string, code?:number|string):void
        $error?(data?:any, options?:Partial<Options> | string):void
        $send?(data?:any, options?:Partial<Options> | string):void
    }
}
