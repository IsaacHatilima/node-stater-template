import {z} from "zod";

export class EnvValidationError extends Error {
    readonly status = 500;
    readonly errors: Record<number, string>;

    constructor(issues: string[]) {
        super("Invalid environment configuration");

        this.errors = Object.fromEntries(
            issues.map((msg, idx) => [idx + 1, msg])
        );
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            errors: this.errors,
        };
    }
}

const EnvSchema = z.object({
    APP_NAME: z.string().default("Auth API"),
    APP_KEY: z.string({message: "APP_KEY is required"}),
    APP_URL: z
        .string({message: "APP_URL is required"})
        .url("APP_URL must be a valid URL"),

    NODE_ENV: z
        .enum(["local", "development", "test", "production"])
        .default("local"),

    GOOGLE_CLIENT_ID: z.string({message: "GOOGLE_CLIENT_ID is required"}),

    JWT_REFRESH_SECRET: z.string({message: "JWT_REFRESH_SECRET is required"}),
    JWT_ACCESS_SECRET: z.string({message: "JWT_ACCESS_SECRET is required"}),

    PORT: z.coerce.number().int().positive().default(3000),
    SWAGGER_ENABLED: z
        .enum(["true", "false"])
        .default("false")
        .transform(v => v === "true"),

    JWT_ACCESS_EXPIRES_IN: z.string().default("120m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    DATABASE_URL: z
        .string({message: "DATABASE_URL is required"})
        .url("DATABASE_URL must be a valid URL"),

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
    const issues = parsedEnv.error.issues.map(i => i.message);

    const error = new EnvValidationError(issues);

    console.error(JSON.stringify(error.toJSON(), null, 2));

    throw error;
}

export const env = parsedEnv.data;
