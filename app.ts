import express from "express";
import router from "./src/routes/routes";
import cookieParser from "cookie-parser";
import {setupSwagger} from "./src/config/swagger";

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());
    setupSwagger(app);
    app.use(router);
    return app;
}
