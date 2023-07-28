import {createApp} from "@wisdom-serve/serve"
import "./global.ts"
import websocket from "./websocket"
createApp({
    route:()=> import("./route"),
    websocket
})
.listen().then();
