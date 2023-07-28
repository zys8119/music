const bufferSplit = (buff:Buffer, splitter:any)=>{
    const buffTter = Buffer.from(splitter);
    const index = buff.indexOf(buffTter);
    let resUlt = [];
    if(index > -1){
        resUlt = resUlt.concat(buff.slice(0,index));
        const buffChild = buff.slice(index+buffTter.length);
        resUlt = resUlt.concat(bufferSplit(buffChild,splitter));
    }else {
        resUlt = resUlt.concat(buff)
    }
    return resUlt;
}
export default bufferSplit
