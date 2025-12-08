import {connectDB, disconnectDB, prisma} from "../src/config/db";
import {initRedis} from "../src/config/redis";


async function resetPostgresDatabase() {
    const tables = await prisma.$queryRaw<
        Array<{ table_name: string }>
    >`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'test'
          AND table_name != '_prisma_migrations';
    `;

    for (const {table_name} of tables) {
        await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "test"."${table_name}" RESTART IDENTITY CASCADE;`
        );
    }
}

beforeAll(async () => {
    await connectDB();
    await initRedis();
    await resetPostgresDatabase();
});

afterAll(async () => {
    await disconnectDB();
});
