import {Plugin} from "@wisdom-serve/serve/types/type";
import {createHash} from "crypto";
import {Socket} from "net";
import * as ncol from "ncol";
import * as EventEmitter from "events";

/**
 * 解码数据
 * @param data
 */
const decodeWsFrame = (data) =>{
    let start = 0;
    const frame:any = {
        isFinal: (data[start] & 0x80) === 0x80,
        opcode: data[start++] & 0xF,
        masked: (data[start] & 0x80) === 0x80,
        payloadLen: data[start++] & 0x7F,
        maskingKey: '',
        payloadData: null
    };

    if (frame.payloadLen === 126) {
        frame.payloadLen = (data[start++] << 8) + data[start++];
    } else if (frame.payloadLen === 127) {
        frame.payloadLen = 0;
        for (let i = 7; i >= 0; --i) {
            frame.payloadLen += (data[start++] << (i * 8));
        }
    }

    if (frame.payloadLen) {
        if (frame.masked) {
            const maskingKey = [
                data[start++],
                data[start++],
                data[start++],
                data[start++]
            ];

            frame.maskingKey = maskingKey;

            frame.payloadData = data
                .slice(start, start + frame.payloadLen)
                .map((byte, idx) => byte ^ maskingKey[idx % 4]);
        } else {
            frame.payloadData = data.slice(start, start + frame.payloadLen);
        }
    }
    return frame;
}

/***
 * 加密数据
 * @param data
 */
const encodeWsFrame = (data)=> {
    const isFinal = data.isFinal !== undefined ? data.isFinal : true,
        opcode = data.opcode !== undefined ? data.opcode : 1,
        payloadData = data.payloadData ? Buffer.from(data.payloadData) : null,
        payloadLen = payloadData ? payloadData.length : 0;

    let frame:any = [];

    if (isFinal) frame.push((1 << 7) + opcode);
    else frame.push(opcode);

    if (payloadLen < 126) {
        frame.push(payloadLen);
    } else if (payloadLen < 65536) {
        frame.push(126, payloadLen >> 8, payloadLen & 0xFF);
    } else {
        frame.push(127);
        for (let i = 7; i >= 0; --i) {
            frame.push((payloadLen & (0xFF << (i * 8))) >> (i * 8));
        }
    }

    frame = payloadData ? Buffer.concat([Buffer.from(frame), payloadData]) : Buffer.from(frame);
    return frame;
}

const socketWrite = (socket:Socket, payloadData:any, config:any = {})=>{
    socket.write(encodeWsFrame({
        payloadData,
        opcode:1,
        ...config,
    }))
}


class myEmitter extends EventEmitter {
    constructor() {
        super();
    }
}

const {on, emit, off, once} = new myEmitter()

type SocketSend = (payloadData:any, socketTargetKeys?:string[],config?:{[key:string]:any})=>void

interface SocketListItem {
    [key:string]:any
    key:string,
    socket:Socket,
    send:SocketSend,
    payload?:any,
}

interface SocketList {
    [key:string]:SocketListItem
}
const websocket:Plugin = function ({url, headers,socket}){
    if(!global.$on) global.$on = on
    if(!global.$emit) global.$emit = emit
    if(!global.$off) global.$off = off
    if(!global.$once) global.$once = once
    global.$socketList = global.$socketList || {}
    if(!global.$socketSend) global.$socketSend = (payloadData:any, socketTargetKeys:string[] = [],config:any = {})=>{
        try {
            if(socketTargetKeys.length === 0){
                // 全部广播
                for(const k in global.$socketList){
                    const {socket} = global.$socketList[k];
                    socketWrite(socket, payloadData, config)
                }
            }else {
                // 指定广播
                socketTargetKeys.forEach(k => {
                    if(global.$socketList[k]){
                        const {socket} = global.$socketList[k];
                        socketWrite(socket, payloadData, config)
                    }
                })
            }
        }catch (e){
            if(this.options.debug) ncol.error(e)
        }
    }
    const reg = Object.prototype.toString.call(this.options.websocketUrl) === '[object RegExp]' ? this.options.websocketUrl : /^\/websocket/;
    if(reg.test(url) && headers['upgrade'] === 'websocket'){
        if (headers['sec-websocket-version'] !== '13') {
            // 判断WebSocket版本是否为13，防止是其他版本，造成兼容错误
            Promise.reject('WebSocket版本错误')
        } else {
            return new Promise((resolve, reject) => {
                // 校验Sec-WebSocket-Key，完成连接
                /*
                  协议中规定的校验用GUID，可参考如下链接：
                  https://tools.ietf.org/html/rfc6455#section-5.5.2
                  https://stackoverflow.com/questions/13456017/what-does-258eafa5-e914-47da-95ca-c5ab0dc85b11-means-in-websocket-protocol
                */
                const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
                const key = headers['sec-websocket-key'];
                const hash = createHash('sha1')  // 创建一个签名算法为sha1的哈希对象
                hash.update(`${key}${GUID}`)  // 将key和GUID连接后，更新到hash
                const result = hash.digest('base64') // 生成base64字符串
                const header = `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-Websocket-Accept: ${result}\r\n\r\n` // 生成供前端校验用的请求头
                socket.write(header)  // 返回HTTP头，告知客户端校验结果，HTTP状态码101表示切换协议：https://httpstatuses.com/101。
                if(this.options.debug){
                    ncol.color(function (){this.log(`【websocket】：`).info(`websocket版本->sec-websocket-version：${headers['sec-websocket-version']}`)})
                    ncol.color(function (){this.log(`【websocket】：`).info(`websocket连接成功->客户端密钥：${key}`)})
                }
                // 注册监听
                if(Object.prototype.toString.call(this.options.websocket) === '[object Object]'){
                    Object.keys(this.options.websocket || {}).forEach(k=>{
                        const fn = this.options.websocket[k];
                        if(Object.prototype.toString.call(fn) === '[object Function]' && !(this.options.websocket[k] as any).isOn){
                            (this.options.websocket[k] as any).isOn = true;
                            global.$on(k, (...args)=>{
                                fn.call(this, ...args)
                            })
                        }
                    })
                }
                // 写入连接缓存

                const emitData:SocketListItem = {
                    key,
                    socket,
                    send:global.$socketSend
                }
                global.$socketList[key] = emitData
                global.$emit("ws-connection", emitData)
                // 若客户端校验结果正确，在控制台的Network模块可以看到HTTP请求的状态码变为101 Switching Protocols，同时客户端的ws.onopen事件被触发。
                socket.on('data', (buffer) => {
                    try {
                        const data = decodeWsFrame(buffer);
                        global.$emit("ws-data", emitData, data, buffer)
                        // opcode为8，表示客户端发起了断开连接
                        if (data.opcode === 8) {
                            // delete global.$socketList[key]
                            // socket.end()  // 与客户端断开连接
                        } else {
                            let payloadDataStr = '{}';
                            try {
                                payloadDataStr = data.payloadData.toString()
                            }catch (e){
                                payloadDataStr = '{}';
                            }
                            let payload:any = {}
                            try {
                                payload = JSON.parse(payloadDataStr)
                            }catch (e) {
                                payload = {};
                            }
                            global.$emit("ws-payload", payloadDataStr)
                            if(!/^ws-/.test(payload.emit) && payload.emit){
                                global.$emit(payload.emit, {
                                    ...emitData,
                                    payload
                                })
                            }
                        }
                    }catch (e){
                        console.log(e)
                    }
                })
                socket.on("close",hadError => {
                    global.$emit("ws-close", emitData)
                    delete global.$socketList[key]
                    socket.end()
                    if(this.options.debug) ncol.error(hadError)
                    reject(false)
                })
                socket.on("error",hadError => {
                    global.$emit("ws-error", emitData)
                    delete global.$socketList[key]
                    socket.end()
                    if(this.options.debug) ncol.error(hadError)
                    reject(false)
                })
                socket.on("timeout",()=> {
                    global.$emit("ws-timeout", emitData)
                    delete global.$socketList[key]
                    socket.end()
                    if(this.options.debug) ncol.error("连接超时")
                    reject(false)
                })
                socket.on("end",()=> {
                    global.$emit("ws-end", emitData)
                    // delete global.$socketList[key]
                    // socket.end()
                    if(this.options.debug) ncol.error("连接关闭")
                    reject(false)
                })
            })
        }
        return Promise.reject(false)
    }
    return Promise.resolve()
}

export default websocket

declare module "@wisdom-serve/serve" {
    interface SocketListItemOptions extends SocketListItem {
    }

    interface AppServeInterface {
    }
}


declare global {
    const globalThis:{
        $on:typeof on
        $emit:typeof emit
        $off:typeof off
        $once:typeof once
        $socketList:SocketList
        $socketSend:SocketSend
    }
}
