import express from "express";
import router from "./src/routes/routes";
import cookieParser from "cookie-parser";
import {setupSwagger} from "./src/config/swagger";
import {errorMiddleware} from "./src/middleware/errorMiddleware";
import {pinoHttp} from "pino-http";
import {logger} from "./src/lib/logger";

export function createApp() {
    const app = express();
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
        app.use(
            pinoHttp({
                logger,
                autoLogging: {
                    ignore: (req) => req.url.startsWith("/docs"),
                },
                customLogLevel(req, res, err) {
                    if (res.statusCode >= 500) return "error";
                    if (res.statusCode >= 400) return "warn";
                    return "info";
                },
                customSuccessMessage(req, res) {
                    return `${req.method} ${req.url} → ${res.statusCode}`;
                },
                redact: {
                    paths: [
                        "req.headers.cookie",
                        "req.headers.authorization",
                    ],
                    remove: true,
                },
            })
        );
    }
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());
    setupSwagger(app);
    app.use(router);
    app.use(errorMiddleware);
    return app;
}
