/* eslint-disable */
import {bufferSplit} from "./index";

export interface RequestFormData {
    type?:string | "file" | "data"; // 文件数据
    keyName?:string; // 数据字段
    keyValue?:string; // 数据值,type = data 时生效
    fileType?:string; // 文件Content-Type,type = file 时生效
    fileName?:string; // 文件名称,type = file 时生效
    fileBuff?:string; // 文件数据,buff类型,type = file 时生效
    [keyName:string]:any;
}
export const getRequestFormData:((bodySource, request) => Promise<RequestFormData[]>) = (bodySource, request)=>{
    return new Promise((resolve,reject) => {
        try {
            const splitter = (request.headers['content-type'].match(/----(.*)/) || [])[1]
            if(bodySource.length > 0 && splitter){
                const bodyFormData = bufferSplit(bodySource,`------${splitter}`).map(e=>{
                    const buffArr = bufferSplit(e,"\r\n\r\n");
                    if(buffArr.length === 2){
                        const resUlt:any = {};
                        const info:any = bufferSplit(buffArr[0],"\; ").map(e=>e.toString());
                        if(buffArr[0].indexOf(Buffer.from("Content-Type")) > -1){
                            // 文件
                            resUlt.type = "file";
                            // keyName
                            const split = Buffer.from("name=\"");
                            resUlt.keyName = info[1].slice(info[1].indexOf(split)+split.length,info[1].length-1);

                            const fileInfo = bufferSplit(info[2],"\r\n");

                            // fileType
                            try {
                                resUlt.fileType = bufferSplit(fileInfo[1]," ")[1];
                            }catch (e) {
                                // ewer
                            }
                            // filename
                            const splitFileName = Buffer.from("filename=\"");
                            resUlt.fileName = fileInfo[0].slice(fileInfo[0].indexOf(splitFileName)+splitFileName.length,fileInfo[0].length - 1);
                            // fileBuff
                            resUlt.fileBuff = buffArr[1].slice(0,buffArr[1].length-Buffer.from("\r\n").length);
                        }else {
                            // 数据
                            resUlt.type = "data";
                            // keyName
                            const split = Buffer.from("name=\"");
                            resUlt.keyName = info[1].slice(info[1].indexOf(split)+split.length,info[1].length-1);
                            // keyValue
                            const splitVal = Buffer.from("\r\n");
                            resUlt.keyValue = buffArr[1].slice(0,buffArr[1].indexOf(splitVal)).toString();
                        }
                        return resUlt;
                    }
                    return null;
                }).filter(e=>e);
                resolve(bodyFormData);
            }else {
                resolve([]);
            }
        }catch (err){
            reject(err);
        }
    });
}


export default class formData {
    constructor(bodySource, request){
        return (async ()=>{
            const postDataObject:any = {};
            const formData = await getRequestFormData(bodySource, request);
            (formData || []).forEach(it=>{
                switch (it.type) {
                    case "data":
                        postDataObject[it.keyName] = it.keyValue
                        break
                    case 'file':
                        const keyName = (it.keyName.match(/^([^\[]*)/) || [])[1]
                        postDataObject[keyName] = postDataObject[keyName] || []
                        postDataObject[keyName].push(it)
                        break;
                }
            })
            return postDataObject
        })();
    }
}
