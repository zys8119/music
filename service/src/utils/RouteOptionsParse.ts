import {AppServeOptions, AppServeOptionsRoute, RouteOptions, routes} from "@wisdom-serve/serve/types/type";
import {get} from "lodash"
import ForEach from "./ForEach"
export default async (options:Partial<AppServeOptions>)=>{
    let route:AppServeOptionsRoute = get(options,"route", {}) as AppServeOptionsRoute;
    if(Object.prototype.toString.call(route) === "[object Function]"){
        route = (route as any)();
        if(Object.prototype.toString.call(route) === "[object Promise]"){
            route = await route;
            if((route as any).default){
                route = (route as any).default
            }
        }
    }
    const routes:routes = get(route,"routes",[]);
    const result:RouteOptions = {}
    ForEach(routes, (item,i, p)=>{
        const path = p.concat([item]).map(e=>(/^\//.test(e.path) ? "" : "/")+e.path).join("").replace(/\/{1,}/img,"/");
        result[path] = item;
        result[path].regName = [];
        result[path].Parents = p;
        result[path].reg = ["","/"].includes(path) ? null :new RegExp(((orginPath, path,arr)=>{
            if(Object.prototype.toString.call(arr) === '[object Array]'){
                arr.forEach(it=>{
                    path = path.replace(it,"([^\\\\/]+)")
                    result[orginPath].regName.push(it.replace(/^:/,""))
                })
            }
            return `^${path}($|\/$)`;
        })(path, path, path.match(/:([^\/]+)/img)));
    })
    return result
}
