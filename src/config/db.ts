import "dotenv/config";
import {PrismaClient} from "../generated/prisma/client";
import {PrismaPg} from '@prisma/adapter-pg';

const isTest = process.env.NODE_ENV === "local";
const schema = isTest ? "test" : "public";

const adapter = new PrismaPg(
    {connectionString: process.env.DATABASE_URL},
    {schema}
);

const prisma = new PrismaClient({adapter});

const connectDB = async () => {
    try {
        await prisma.$connect();
    } catch (error: any) {
        process.exit(1);
    }
}
const disconnectDB = async () => {
    await prisma.$disconnect();
}

export {prisma, connectDB, disconnectDB}