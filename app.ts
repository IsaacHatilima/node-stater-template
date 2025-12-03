import "dotenv/config";
import express from "express";
import router from "./src/routes/routes";
import cookieParser from "cookie-parser";
import {connectDB, disconnectDB} from "./src/config/db";

(async () => {
    try {
        await connectDB();

        const app = express();

        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(cookieParser());
        app.use(router);

        const server = app.listen(3000, () => {
            console.log("Server running on port 3000");
        });

        process.on("uncaughtRejection", async (err) => {
            const isDev = process.env.APP_ENV === "local";

            if (isDev) console.error("Unhandled Rejection:", err);

            server.close(async () => {
                await disconnectDB();
                process.exit(1);
            });
        });

    } catch (err) {
        const isDev = process.env.APP_ENV === "local";

        if (isDev) console.error("Failed to start server:", err);
        process.exit(1);
    }
})();