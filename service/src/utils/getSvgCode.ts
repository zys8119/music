import {AppServe} from "@wisdom-serve/serve/types/type";

export interface getSvgCodeOptions {
    fontSize?:number;// 字体大小，默认50
    index?:number;// 验证码长度，默认4
    background?:null|string;// 背景颜色
    color?:null|string;// 字体颜色，默认为多彩
    cb?(this:AppServe,code:string):void;// 回调
    headers?(this:AppServe,code:string):void;// headers返回头
}

export const getRandomIntInclusive = (min:number, max:number) =>{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值
}

export const getSvgCode = function (response, options?:getSvgCodeOptions):Promise<string>{
    return new Promise((resolve, reject) => {
        options = options || {};
        const cb = options.cb || new Function;
        const headers = options.headers || new Function;
        const str = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        const colorArr = [
            "#000000",	"#000033",	"#000066",	"#000099",	"#0000CC",   "#0000FF",
            "#003300",	"#003333",	"#003366",	"#003399",	"#0033CC",   "#0033FF",
            "#006600",	"#006633",	"#006666",	"#006699",	"#0066CC",   "#0066FF",
            "#009900",	"#009933",	"#009966",	"#009999",	"#0099CC",   "#0099FF",
            "#00CC00",	"#00CC33",	"#00CC66",	"#00CC99",	"#00CCCC",   "#00CCFF",
            "#00FF00",	"#00FF33",	"#00FF66",	"#00FF99",	"#00FFCC",   "#00FFFF",
            "#330000",	"#330033",	"#330066",	"#330099",	"#3300CC",   "#3300FF",
            "#333300",	"#333333",	"#333366",	"#333399",	"#3333CC",   "#3333FF",
            "#336600",	"#336633",	"#336666",	"#336699",	"#3366CC",   "#3366FF",
            "#339900",	"#339933",	"#339966",	"#339999",	"#3399CC",   "#3399FF",
            "#33CC00",	"#33CC33",	"#33CC66",	"#33CC99",	"#33CCCC",   "#33CCFF",
            "#33FF00",	"#33FF33",	"#33FF66",	"#33FF99",	"#33FFCC",   "#33FFFF",
            "#660000",	"#660033",	"#660066",	"#660099",	"#6600CC",   "#6600FF",
            "#663300",	"#663333",	"#663366",	"#663399",	"#6633CC",   "#6633FF",
            "#666600",	"#666633",	"#666666",	"#666699",	"#6666CC",   "#6666FF",
            "#669900",	"#669933",	"#669966",	"#669999",	"#6699CC",   "#6699FF",
            "#66CC00",	"#66CC33",	"#66CC66",	"#66CC99",	"#66CCCC",   "#66CCFF",
            "#66FF00",	"#66FF33",	"#66FF66",	"#66FF99",	"#66FFCC",   "#66FFFF",
            "#990000",	"#990033",	"#990066",	"#990099",	"#9900CC",   "#9900FF",
            "#993300",	"#993333",	"#993366",	"#993399",	"#9933CC",   "#9933FF",
            "#996600",	"#996633",	"#996666",	"#996699",	"#9966CC",   "#9966FF",
            "#999900",	"#999933",	"#999966",	"#999999",	"#9999CC",   "#9999FF",
            "#99CC00",	"#99CC33",	"#99CC66",	"#99CC99",	"#99CCCC",   "#99CCFF",
            "#99FF00",	"#99FF33",	"#99FF66",	"#99FF99",	"#99FFCC",   "#99FFFF",
            "#CC0000",	"#CC0033",	"#CC0066",	"#CC0099",	"#CC00CC",   "#CC00FF",
            "#CC3300",	"#CC3333",	"#CC3366",	"#CC3399",	"#CC33CC",   "#CC33FF",
            "#CC6600",	"#CC6633",	"#CC6666",	"#CC6699",	"#CC66CC",   "#CC66FF",
            "#CC9900",	"#CC9933",	"#CC9966",	"#CC9999",	"#CC99CC",   "#CC99FF",
            "#CCCC00",	"#CCCC33",	"#CCCC66",	"#CCCC99",	"#CCCCCC",   "#CCCCFF",
            "#CCFF00",	"#CCFF33",	"#CCFF66",	"#CCFF99",	"#CCFFCC",   "#CCFFFF",
            "#FF0000",	"#FF0033",	"#FF0066",	"#FF0099",	"#FF00CC",   "#FF00FF",
            "#FF3300",	"#FF3333",	"#FF3366",	"#FF3399",	"#FF33CC",   "#FF33FF",
            "#FF6600",	"#FF6633",	"#FF6666",	"#FF6699",	"#FF66CC",   "#FF66FF",
            "#FF9900",	"#FF9933",	"#FF9966",	"#FF9999",	"#FF99CC",   "#FF99FF",
            "#FFCC00",	"#FFCC33",	"#FFCC66",	"#FFCC99",	"#FFCCCC",   "#FFCCFF",
            "#FFFF00",	"#FFFF33",	"#FFFF66",	"#FFFF99",	"#FFFFCC",   "#FFFFFF",
        ];
        const strArr = [];
        const svgOptions = (<any>Object).assign(<getSvgCodeOptions>{
            fontSize:50,
            index:4,
            background:'rgb(178,200,255)',
            color:null,
        },options);
        for(let i = 0 ; i < svgOptions.index ; i ++){
            strArr.push(str[getRandomIntInclusive(0,str.length-1)])
        }
        const code = strArr.join("");
        cb.call(this,code);
        let svgStr = "";
        strArr.forEach((text, index)=>{
            let color = colorArr[getRandomIntInclusive(0,colorArr.length-1)];
            const rotate = getRandomIntInclusive(0,45);
            if(svgOptions.color){
                color = svgOptions.color;
            }
            svgStr += `<text x="${svgOptions.fontSize*index}" y="${svgOptions.fontSize}" width="${svgOptions.fontSize}" height="${svgOptions.fontSize}" style="fill:${color};font-size: ${svgOptions.fontSize}px;" rotate="${rotate}" >${text}</text>`;
        });
        let background = "";
        if(svgOptions.background){
            background = `
                <rect width="${svgOptions.fontSize * strArr.length}" height="${svgOptions.fontSize * 1.5}" style="fill:${svgOptions.background};" />
            `
        }
        const svg = `<?xml version="1.0" standalone="no"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
            "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${svgOptions.fontSize * strArr.length}" height="${svgOptions.fontSize*1.5}">
            ${background}
            ${svgStr}
            </svg>
            `;
        const header = headers.call(this, code) || {};
        response.writeHead(200,{
            "Content-Type":"image/svg+xml",
            ...header,
        });
        response.write(svg);
        response.end();
        resolve(code);
    });
}

export default getSvgCode
