import {defineConfig} from "prisma/config";
//import * as dotenv from "dotenv";

//dotenv.config();

export default defineConfig({
    schema: "prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        //url: env("DATABASE_URL"),
        url: process.env.DATABASE_URL!
    },
});
