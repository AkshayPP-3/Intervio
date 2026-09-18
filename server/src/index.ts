import app from "./app";
import {env} from "./config/env";

app.listen(env.PORT,()=>{
    console.log(`Intervio server is running on ${env.PORT}`);
})