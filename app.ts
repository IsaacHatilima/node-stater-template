import express from "express";
import router from "./src/routes/routes";
import cookieParser from "cookie-parser";
import {setupSwagger} from "./src/config/swagger";
import {errorMiddleware} from "./src/middleware/errorMiddleware";
import {pinoHttp} from "pino-http";
import {logger} from "./src/lib/logger";
import {env} from "./src/utils/environment-variables";

export function createApp() {
    const app = express();

    app.use(
        pinoHttp({
            logger,
            autoLogging: env.NODE_ENV === "production",
            customLogLevel(req, res, err) {
                if (err || res.statusCode >= 500) return "error";
                if (res.statusCode >= 400) return "warn";
                return "silent";
            },
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());
    setupSwagger(app);
    app.use(router);
    app.use(errorMiddleware);
    return app;
}
