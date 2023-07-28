import {Plugin} from "@wisdom-serve/serve/types/type"
/**
 * url解析
 * @param req
 * @param res
 * @param next
 * @constructor
 */
const UrlParse:Plugin = function (request, response,next){
    this.$urlParse = new URL(request.url, "https://target.com/");
    this.$query = this.$urlParse.searchParams
    this.$url = this.$urlParse.pathname
    return next();
}

export default UrlParse

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $urlParse?:URL
        $query?:URLSearchParams
        $url?:string
    }
}
