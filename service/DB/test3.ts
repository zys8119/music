import {DBModel} from "@wisdom-serve/core-plug/mysql";

export default <DBModel>{
    commit:"测试栏目",
    columns:{
        id:{
            int:true,
            auto_increment:true,
            primary_key:true
        },
        tid:{
            varchar:255,
            not_null:true,
        },
        name:{
            varchar:255,
        }
    }
}
