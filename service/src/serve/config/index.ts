import {AppServeOptions} from "../types/type";

export default <Partial<AppServeOptions>>{
    serve:{
        port:81,
        LogServeInfo:true
    },
    mysqlConfig:{
        connectionLimit : 100,
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        port: 3306,
        database:"system_monitoring_node",
        prefix:""
    },
    cors:true,
    mysqlAuto:false
}
