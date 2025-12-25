import {z} from "zod";

const EnvSchema = z.object({
    APP_NAME: z.string().default("Auth API"),
    APP_KEY: z.string({required_error: "APP_KEY is required"}),
    APP_URL: z.string({required_error: "APP_URL is required"}).url("APP_URL must be a valid URL"),
    NODE_ENV: z.enum(["local", "development", "test", "production"]).default("local"),
    GOOGLE_CLIENT_ID: z.string({required_error: "GOOGLE_CLIENT_ID is required"}),
    JWT_REFRESH_SECRET: z.string({required_error: "JWT_REFRESH_SECRET is required"}),
    JWT_ACCESS_SECRET: z.string({required_error: "JWT_ACCESS_SECRET is required"}),

    PORT: z.coerce.number().int().positive().default(3000),
    SWAGGER_ENABLED: z.coerce.boolean().default(false),

    JWT_ACCESS_EXPIRES_IN: z.string().default("120m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    DATABASE_URL: z.string({required_error: "DATABASE_URL is required"}).url("DATABASE_URL must be a valid URL"),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),

    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
    MAIL_HOST: z.string().default("localhost"),
    MAIL_PORT: z.coerce.number().int().positive().default(1025),
    MAIL_USERNAME: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string().default("noreply@example.com"),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
    const formattedErrors = parsedEnv.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
    throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

export const env = parsedEnv.data;
