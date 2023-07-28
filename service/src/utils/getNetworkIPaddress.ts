/**
 * 获取访问者网络ip
 * @param req
 */
const getNetworkIPaddress = async (req)=>{
    const ip = (req.headers['x-forwarded-for'] || '' as any).split(',').pop().trim() ||
        req.connection.remoteAddress || req.socket.remoteAddress || (req.connection as any).socket.remoteAddress;
    return ip
}

export default getNetworkIPaddress
