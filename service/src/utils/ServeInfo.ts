import {networkInterfaces} from "os"
import * as ncol from "ncol"
export default class ServeInfo{
    constructor() {
        //
    }

    /**
     * 获取Ipv4 地址
     */
    static getIPv4():Array<string>{
        const network = networkInterfaces();
        return Object.keys(network).map(k=>network[k].filter(e=>e.family === "IPv4").map(e=>e.address)).toString().split(",");
    }

    static ouinputAddress(port = 80):void{
        ServeInfo.getIPv4().filter(e=>e).forEach(e=>{
            let local = null;
            if(e === "127.0.0.1"){
                local = "localhost"
            }
            ncol.color(function (){
                this.log(`- ${local ? "Local  " : "Network"}:`)
                    .info(` http://${local || e}:${port}`)
            });
        })
    }
}
