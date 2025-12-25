import "dotenv/config";
import {PrismaClient} from "../generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {logger} from "../lib/logger.js";
import {env} from "../utils/environment-variables";

const isTest = env.NODE_ENV === "test";
const schema = isTest ? "test" : "public";

let adapter: PrismaPg;

try {
    adapter = new PrismaPg(
        {connectionString: env.DATABASE_URL},
        {schema}
    );

    logger.info("[DB] PrismaPg adapter created");
} catch (err) {
    logger.fatal(
        {err},
        "[DB] Failed to create PrismaPg adapter"
    );
    process.exit(1);
}

let prisma: PrismaClient;

try {
    prisma = new PrismaClient({adapter});

    logger.info("[DB] PrismaClient instance created");
} catch (err) {
    logger.fatal(
        {err},
        "[DB] Failed to instantiate PrismaClient"
    );
    process.exit(1);
}

const connectDB = async () => {
    logger.info("[DB] Connecting to database...");

    try {
        await prisma.$connect();
        logger.info("[DB] Database connection established");
    } catch (err) {
        logger.fatal(
            {err},
            "[DB] prisma.$connect() failed"
        );
        process.exit(1);
    }
};

const disconnectDB = async () => {
    logger.info("[DB] Disconnecting Prisma...");
    await prisma.$disconnect();
    logger.info("[DB] Prisma disconnected");
};

export {prisma, connectDB, disconnectDB};
