import "dotenv/config";
import {createApp} from "./app";
import {connectDB, disconnectDB} from "./src/config/db";
import {initRedis} from "./src/config/redis";

(async () => {
    try {
        await connectDB();
        await initRedis();

        const app = createApp();
        const port = process.env.PORT ? Number(process.env.PORT) : 3000;

        const server = app.listen(port, () => {
            console.log("Server running on port 3000");
        });

        process.on("unhandledRejection", (err) => {
            const isDev = process.env.NODE_ENV === "local";
            if (isDev) console.error("Unhandled Rejection:", err);
            server.close(async () => {
                await disconnectDB();
                process.exit(1);
            });
        });

        process.on("SIGTERM", () => {
            server.close(async () => {
                disconnectDB().finally(() => process.exit(0));
            });
        });

    } catch (err) {
        const isDev = process.env.NODE_ENV === "local";
        if (isDev) console.error("Failed to start server:", err);
        process.exit(1);
    }
})();
