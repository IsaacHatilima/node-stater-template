import express from "express";
import router from "./src/routes/routes.js";
import cookieParser from "cookie-parser";
import {setupSwagger} from "@/config/swagger.js";

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());
    setupSwagger(app);
    app.use(router);
    return app;
}
