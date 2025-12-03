import {PrismaClient} from "../generated/prisma/client";

const prisma = new PrismaClient({
    log: process.env.APP_ENV === "local" ? ["query", "error", "warn"] : ["error", "warn"],
})

const connectDB = async () => {
    try {
        await prisma.$connect();
    } catch (error: any) {
        console.error(error.message);
        process.exit(1);
    }
}
const disconnectDB = async () => {
    await prisma.$disconnect();
}

export {prisma, connectDB, disconnectDB}