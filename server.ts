import "dotenv/config";
import {createApp} from "./app";
import {connectDB, disconnectDB} from "./src/config/db";
import {initRedis} from "./src/config/redis";
import {logger} from "./src/lib/logger";
import {env} from "./src/utils/environment-variables";

(async () => {
    try {
        await connectDB();
        await initRedis();

        const app = createApp();
        const port = env.PORT;

        const server = app.listen(port, () => {
            logger.info(`🚀 Server running on port ${port}`);
        });

        process.on("unhandledRejection", (err) => {
            const isDev = env.NODE_ENV === "local";
            if (isDev) console.error("Unhandled Rejection:", err);
            server.close(async () => {
                await disconnectDB();
                process.exit(1);
            });
        });

        const gracefulShutdown = () => {
            server.close(async () => {
                disconnectDB().finally(() => process.exit(0));
            });
        };

        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);

    } catch (err) {
        const isDev = env.NODE_ENV === "local";
        if (isDev) console.error("Failed to start server:", err);
        process.exit(1);
    }
})();
