import urlParse from "./urlParse"
import helperFun from "./helperFun"
import bodyData from "./bodyData"
import mysql from "./mysql"
import staticPlugin from "./staticPlugin"
import websocket from "./websocket"
import corsPlugin from "./corsPlugin"
import mailerPlugin from "./mailerPlugin"
export default [
    urlParse,
    helperFun,
    bodyData,
    mysql,
    staticPlugin,
    websocket,
    corsPlugin,
    mailerPlugin,
    async function (){
        if(/coi-serviceworker\.min\.js$/.test(this.$url)){
            return Promise.reject(false)
        }
    }
]
