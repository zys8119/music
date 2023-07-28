import {PluginUse,HttpHeaders} from "@wisdom-serve/serve"
const corsPlugin:PluginUse = function (request, response){
    if(request.headers.referer &&!/localhost|192\.168\./.test(request.headers.referer)){
        return Promise.reject("不允许不安全的请求来源：跨域了！")
    }

    if(request.method.toLowerCase() === 'options'){
        this.$success(null)
        return Promise.reject(false)
    }

    return Promise.resolve()
}
export default corsPlugin
