import {get} from "lodash"
const ForEach = <T>(options:Array<T>, callbackfn: (value: T, index: number, ParentDeep:Array<T>, array: T[]) => void, childrenPathName?:string, thisArg?: any, ParentDeep:Array<T> = [])=>{
    if(Object.prototype.toString.call(options) === "[object Array]"){
        options.forEach((item,index,array)=>{
            if(Object.prototype.toString.call(callbackfn) === "[object Function]"){
                callbackfn.call(thisArg, item,index,ParentDeep,array);
            }
            const children:any = Object.prototype.toString.call(item) === "[object Object]" ? get(item,childrenPathName || "children", []) : [];
            ForEach(children, callbackfn, childrenPathName, thisArg, ParentDeep.concat(item));
        })
    }
}
export default ForEach
