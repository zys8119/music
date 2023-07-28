import {readJSONSync} from "fs-extra"
import {create as tsNode} from "ts-node"
import BuildServe from "ts-node-build"
import {obfuscate} from "javascript-obfuscator";
new BuildServe({
    inputFiles:[
        "!(node_modules|.git|.idea|.DS_Store|dist|build|unit_test)/**/**",
        "!package-lock.json"
    ],
    rules:[
        {
            rule:/package\.json$/,
            transform(transformOptions){
                const json = readJSONSync(transformOptions.file)
                json.main = json.main.replace(/\.ts/img, '.js')
                json.scripts = Object.fromEntries(Object.entries(json.scripts || {}).map((e:any)=>[e[0],e[1].replace(/ts-node/img, 'node').replace(/\.ts/img, '.js')]))
                delete json.scripts.build
                delete json.scripts.test
                delete json.scripts['dev-local']
                return JSON.stringify(json, null, 4)
            },
        },
        {
            rule:/\.ts$/,
            outFileName:"[name].js",
            transform(transformOptions){
                transformOptions.targetFilePath
                /***
                 * ts代码编译
                 */
                const tss = tsNode({
                        cwd:transformOptions.config.cwd,
                        transpileOnly:true,
                    })
                const fileContent = tss.compile(transformOptions.code, transformOptions.targetFileParse.base);
                const outCode = fileContent
                    .replace(/\.ts/img,".js")
                    .replace(/(\n|^)\/\/# sourceMappingURL.*/,"")
                /**
                 * 代码加密
                 */
                const obfuscationResult = obfuscate(outCode, {
                    compact: true,
                    numbersToExpressions: true,
                    simplify: true,
                    stringArrayShuffle: true,
                    splitStrings: true,
                    stringArrayThreshold: 1,
                    unicodeEscapeSequence:true
                })
                return obfuscationResult.getObfuscatedCode()
            },
        },
    ],
    onError(error: Error): Promise<any> | void {
        console.error(error)
    }
}).compile().then(()=>{
    process.exit()
})
