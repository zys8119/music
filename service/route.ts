import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
export default createRoute({
    routes:[
        {
            path:'/',
            children:[
                {
                    path:"yinyue",
                    controller:async function(req, res){
                        const {data} = await axios("https://music.liuzhijin.cn/", {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "x-requested-with": "XMLHttpRequest",
                            },
                            data: {
                                input:"烈爱成灰 陈慧琳",
                                filter:"name",
                                type:"qq",
                                page:1,
                                pages:1
                            },
                            method: "POST",
                        });
                        this.$success(data)
                    }
                },
                {
                    path:'search/hot',
                    async controller(){
                        const {data} = await axios("https://u.y.qq.com/cgi-bin/musics.fcg?_=1690530075162&sign=zzb7427254ducavxqgmjm1yanm1zvj1q1cd04a1b", {
                            "data": "{\"comm\":{\"cv\":4747474,\"ct\":24,\"format\":\"json\",\"inCharset\":\"utf-8\",\"outCharset\":\"utf-8\",\"notice\":0,\"platform\":\"yqq.json\",\"needNewCode\":1,\"uin\":0,\"g_tk_new_20200303\":5381,\"g_tk\":5381},\"req_1\":{\"module\":\"music.musicsearch.HotkeyService\",\"method\":\"GetHotkeyForQQMusicMobile\",\"param\":{\"searchid\":\"30240095988465145\",\"remoteplace\":\"txt.yqq.top\",\"from\":\"yqqweb\"}},\"req_2\":{\"module\":\"music.musicHall.MusicHallPlatform\",\"method\":\"GetFocus\",\"param\":{}},\"req_3\":{\"module\":\"newalbum.NewAlbumServer\",\"method\":\"get_new_album_area\",\"param\":{}},\"req_4\":{\"module\":\"newalbum.NewAlbumServer\",\"method\":\"get_new_album_info\",\"param\":{\"area\":1,\"sin\":0,\"num\":20}},\"req_5\":{\"module\":\"musicToplist.ToplistInfoServer\",\"method\":\"GetAll\",\"param\":{}},\"req_6\":{\"module\":\"MvService.MvInfoProServer\",\"method\":\"GetNewMv\",\"param\":{\"style\":0,\"tag\":0,\"start\":0,\"size\":40}}}",
                            "method": "POST",
                        });
                        this.$success({
                            "hots": data.req_1.data.vec_hotkey.map(e=>({
                                ...e,
                                "first": e.title,
                                "second": 1,
                                "third": null,
                                "iconType": 1
                            }))
                        },{dataField:'result'})
                    }
                },
                {
                    path:'cloudsearch',
                    async controller(){
                        const {data} = await axios("https://music.liuzhijin.cn/", {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "x-requested-with": "XMLHttpRequest",
                            },
                            data: {
                                input:"烈爱成灰 陈慧琳",
                                filter:"name",
                                type:"qq",
                                page:1,
                            },
                            method: "POST",
                        });
                        this.$success({
                            searchQcReminder:null,
                            songCount:data.data.length,
                            songs:data.data.map(e=>({
                                ...e,
                                name:e.title,
                                ar:[
                                    {name:e.author},
                                ]
                            }))
                        },{dataField:'result'})
                    }
                }
            ]
        }
    ]
});
