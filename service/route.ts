import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
import {ReadStream} from "fs"
import * as Keyv from "@keyvhq/core"
import * as KeyvMySQL from "@keyvhq/mysql"
export default createRoute({
    routes:[
        {
            path:"/v1/chat/completions",
            controller:async function (){
                try {
                    const res = await axios({
                        baseURL:'https://api.openai.com',
                        url:this.$url,
                        proxy:{
                            protocol:'http',
                            host:'127.0.0.1',
                            port:7890
                        },
                        method:this.request.method,
                        data:this.$body,
                        headers:{
                            'Content-Type': 'application/json',
                            authorization:this.request.headers['authorization']
                        } as any,
                        responseType:'stream'
                    })  as {data:ReadStream}
                    await new Promise<void>((resolve, reject)=>{
                        this.response.writeHead(200, {
                            "access-control-allow-origin":this.request.headers.origin
                        })
                        res.data.on('data', e=>{
                            this.response.write(e)
                        })
                        res.data.on('end', ()=>{
                            resolve()
                        })
                        res.data.on('error', e=>{
                            reject(e)
                        })
                    })
                }catch (e){
                    await new Promise<void>((resolve, reject)=>{
                        this.response.writeHead(403, {
                            "access-control-allow-origin":this.request.headers.origin
                        })
                        e.response.data.on('data', e=>{
                            this.response.write(e)
                        })
                        e.response.data.on('end', ()=>{
                            resolve()
                        })
                        e.response.data.on('error', e=>{
                            reject(e)
                        })
                    })
                }
            },
        },
        {
            path:"/v1/images/generations",
            controller:async function (){
                try {
                    const res = await axios({
                        baseURL:'https://api.openai.com',
                        url:this.$url,
                        proxy:{
                            protocol:'http',
                            host:'127.0.0.1',
                            port:7890
                        },
                        method:this.request.method,
                        data:this.$body,
                        headers:{
                            'Content-Type': 'application/json',
                            authorization:this.request.headers['authorization']
                        } as any,
                    })
                    this.$send(JSON.stringify(res.data), {
                        headers:{
                            "Content-Type":"application/json; charset=utf-8",
                        }
                    })
                }catch (e){
                   this.$error(e.message)
                }
            },
        },
        {
            path:'/db',
            async controller(){
                const keyv = new Keyv({store: new KeyvMySQL('mysql://root:rootroot@localhost:3306/dbname')})
                for await (const  [,v] of  keyv.iterator() as any){
                    console.log(v)
                }
                this.$success()
            }
        },
        {
            path:"yinyue",
            controller:async function(req, res){
                const {data} = await axios("https://music.liuzhijin.cn/", {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "x-requested-with": "XMLHttpRequest",
                    },
                    data: {
                        input:"烈爱成灰 陈慧琳",
                        filter:"name",
                        type:"qq",
                        page:1,
                        pages:1
                    },
                    method: "POST",
                });
                this.$success(data)
            }
        }
    ]
});
