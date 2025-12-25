import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import {Express, Request, Response} from "express";
import {env} from "../utils/environment-variables";

export function setupSwagger(app: Express) {
    if (!env.SWAGGER_ENABLED)
        return;
    const options = {
        definition: {
            openapi: "3.0.3",
            info: {
                title: env.APP_NAME ? `${env.APP_NAME} API` : "API Docs",
                version: "0.0.1",
                description: "API with full Auth pipeline.",
            },
            servers: [
                {url: env.APP_URL || `http://localhost:${env.PORT}`},
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [
                {bearerAuth: []},
            ],
        },
        apis: [
            "./src/routes/**/*.ts",
            "./src/controllers/**/*.ts",
            "./src/docs/**/*.ts",
            "./app.ts",
        ],
    };
    const spec = swaggerJsdoc(options);
    app.get("/docs.json", (_req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(spec);
    });
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, {explorer: true}));
}
