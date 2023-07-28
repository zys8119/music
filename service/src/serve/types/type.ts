import {IncomingMessage, Server, ServerOptions, ServerResponse} from "http";
import {AppServeInterface, SocketListItemOptions} from "@wisdom-serve/serve";
import {HttpHeadersTypeInterface, Method} from "@wisdom-serve/serve/HttpHeaderConfig";
import {PoolConfig} from "mysql";
import {Options} from "nodemailer/lib/smtp-transport";
import * as Buffer from "buffer";

export type Plugin = (this:AppServe & Record<any, any>, request: IncomingMessage, response: ServerResponse, next:(arg?:any)=>Promise<any>, options?:any) => Promise<any> | void

export interface AppServe extends Partial<AppServeInterface>{
    Serve:Server
    options?:Partial<AppServeOptions>;
    originOptions?:Partial<AppServeOptions>;
    Plugins?:Array<Plugin>;
    use?(this:AppServe, plugin:Plugin, options?:any):AppServe
    listen?(port?: number): Promise<Server>;
    RouteOptions?: RouteOptions
    $url?: string
    $params?: { [key:string]:any }
    $route?: RouteOptionsRow
    request?:IncomingMessage
    response?:ServerResponse
}

export type RouteOptions = {
    [key:string]:RouteOptionsRow
}

export type RouteOptionsRow = routeRow & RouteOptionsExtends

export type RouteOptionsExtends = {
    Parents?:routes,
    reg?:RegExp
    regName?:string[]
}
export type MysqlConfig = Partial<PoolConfig> & {
    [key:string]:any
}
export type ExtMysqlConfig = {
    // 其他数据库配置
    // OtherDatabaseConfig:MysqlConfig
}

export interface AppServeOptions extends ServerOptions {
    serve?:{
        host?:string
        port?:number
        LogServeInfo?:boolean // 是否打印服务信息
    },
    cors?:boolean // 是否允许跨域
    corsHeaders?:string // 是否允许跨域header字段
    credentials?:boolean // 是否允许携带cookie
    debug?:boolean // 是否开启调试模式
    query_params?:boolean // 如果为true则解析params参数，同时暴露全局参数 $params , 注： 开启可能会有微量的性能开销
    mysqlAuto?:boolean | RegExp | ((this:AppServe, params:{
        // 数据表目录名称
        dirName:string
        // DBKeyName
        DBKeyName:string
        // app
        app:AppServe
        request:IncomingMessage
        response:ServerResponse,
    })=> boolean) // 是否自动创建数据字段， 当类型为RegExp判断
    mysqlConfig?:MysqlConfig,
    // 扩展数据库, 可以配置多个数据库
    extMysqlConfig?:ExtMysqlConfig
    route?:AppServeOptionsRoute
    // 核心插件配置
    CorePlugConfig?:{
        [key:string]:any
        // 静态资源插件配置
        staticPulgin?:Partial<{
            cwd:string // 静态资源根不如，默认是执行目录
            dirName:string | string[] // 根目录下开放的静态资源目录名称， 默认 static
            // 根据文件后缀返回对应的header头
            extHeader:ExtHeader
        }>
    }
    // websocket url 访问正则规则， 默认为
    websocketUrl?:RegExp
    // websocket 事件钩子
    websocket?:Partial<Websocket>
    // 邮件配置
    mailConfig?:Options
}

export interface Websocket {
    "ws-end":(this:AppServe, SocketListItemOptions:SocketListItemOptions)=> void
    "ws-timeout":(this:AppServe, SocketListItemOptions:SocketListItemOptions)=> void
    "ws-error":(this:AppServe, SocketListItemOptions:SocketListItemOptions)=> void
    "ws-close":(this:AppServe, SocketListItemOptions:SocketListItemOptions)=> void
    "ws-connection":(this:AppServe, SocketListItemOptions:SocketListItemOptions)=> void
    "ws-data":(this:AppServe, SocketListItemOptions:SocketListItemOptions, data:any, buffer:Buffer)=> void
    "ws-payload":(this:AppServe, payloadDataStr:any)=> void

    /**
     * @如果想用自定义钩子，需注意如下事项：
     *
     * 1、其key 必须不能以 'ws-' 开头
     * 2、客户端传输的 payload 数据必须是一个 json 字符串格式， 其格式如下：
     payload = {
            // emit必传，其值为 自定义 key 名称
            "emit":'keyName',
            // 其他的数据...
        }
     *
     */
    [key:string]:(this:AppServe, SocketListItemOptions:SocketListItemOptions, ...args:any[])=> void;
}


export type ExtHeader = {
    [key:string]:Partial<HttpHeadersType>
}

export type AppServeOptionsRoute = route | AppServeOptionsRouteLazy

export type AppServeOptionsRouteLazy = ()=>(Promise<{default:route}> | Promise<route> | route)

export type route = {
    routes:routes
}

export type routes = routeRow[]

export type routeRow = {
    path:string,
    name?:string,
    funName?:string,
    controller?:controller;
    children?:routes
    method?:Method | Method[];
}



export type HttpHeadersType =  HttpHeadersTypeInterface

export type controller = ((this:AppServe, req: IncomingMessage, res: ServerResponse, resultMaps:{[key:string]:any}) => void | Promise<any>) | Promise<any>

export type createApp = (options:AppServeOptions)=>AppServe;
export type createRoute = (routerConfig:route)=>route;

declare module "@wisdom-serve/serve" {
    export const createApp:createApp
    export const createRoute:createRoute
    export type Controller = controller;
    export type PluginUse = Plugin;
    export type Route = route;
    export type HttpHeaders = HttpHeadersType;
    export interface AppServeInterface {
    }
}
