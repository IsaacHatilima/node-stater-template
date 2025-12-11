import express, {NextFunction, Request, Response} from "express";
import router from "./src/routes/routes";
import cookieParser from "cookie-parser";
import {setupSwagger} from "./src/config/swagger";
import {AppError} from "./src/lib/errors";

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());
    setupSwagger(app);
    app.use(router);
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof AppError) {
            return res.status(err.status).json({errors: err.message});
        }

        console.error(err);
        res.status(500).json({errors: "Internal server error"});
    });
    return app;
}
