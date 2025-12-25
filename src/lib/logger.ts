import pino from "pino";
import {env} from "../utils/environment-variables";

const isProduction = env.NODE_ENV === "production";

export const logger = pino({
    level: env.LOG_LEVEL,
    ...(isProduction
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                },
            },
        }),
});
