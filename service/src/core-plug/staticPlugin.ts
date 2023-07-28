import {Plugin, HttpHeadersType} from "@wisdom-serve/serve/types/type"
import {get} from "lodash"
import {resolve, parse} from "path"
import {existsSync, readFileSync} from "fs"
import * as ncol from "ncol"
const staticDirName = async (request, response, dirName, options)=>{
    const cwd = get(options,'cwd', process.cwd())
    const extHeader = get(options,'extHeader', {})
    const reg = new RegExp(`^\/(${dirName}\/|${dirName}$|favicon.ico$)`)
    if(reg.test(request.url)){
        const filePath = resolve(cwd,`.${request.url}`)
        if(existsSync(filePath)){
            const extHeaderConfig = extHeader[parse(filePath).ext]
            if(Object.prototype.toString.call(extHeaderConfig) === '[object Object]'){
                response.writeHead(200,extHeaderConfig)
            }
            response.end(readFileSync(filePath))
        }else {
            response.writeHead(404, <HttpHeadersType>{"Content-Type":"text/plain; charset=utf-8"})
            ncol.color(function (){
                ncol
                    .warnBG("【静态资源插件】：")
                    .warn(`资源 -> ${filePath} 不存在`)
            })
            response.end("静态资源不存在")
        }
        return Promise.reject(false)
    }
    return Promise.resolve()
}
const staticPulgin:Plugin = async function (request, response, next, options:any = {}){
    const dirName = get(options,'dirName', "static")
    if(Object.prototype.toString.call(dirName) === '[object Array]'){
        return await staticDirName(request, response, `(${dirName.join("|")})`, options)
    }
    return await staticDirName(request, response, dirName, options)
}
export default staticPulgin

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
    }
}
