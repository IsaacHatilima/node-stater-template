import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import {Express, Request, Response} from "express";

export function setupSwagger(app: Express) {
    const enabled = (process.env.SWAGGER_ENABLED || "").toLowerCase() === "true";
    if (!enabled)
        return;
    const options = {
        definition: {
            openapi: "3.0.3",
            info: {
                title: process.env.APP_NAME ? `${process.env.APP_NAME} API` : "API Docs",
                version: "0.0.1",
                description: "API with full Auth pipeline.",
            },
            servers: [
                {url: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`},
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
