import request from "supertest";
import {createApp} from "../../app";
import {prisma} from "../../src/config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = createApp();

describe("GET /auth/check-password-reset-token", () => {
    it("validates token successfully", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "tokencheck@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Token",
                        last_name: "Check",
                    },
                },
            },
        });

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: token,
            },
        });

        const res = await request(app)
            .get(`/auth/check-password-reset-token?token=${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("returns 400 when no token provided", async () => {
        const res = await request(app)
            .get("/auth/check-password-reset-token");

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Missing Token");
    });

    it("returns 404 for invalid token", async () => {
        const res = await request(app)
            .get("/auth/check-password-reset-token?token=invalid.token.here");

        expect(res.status).toBe(404);
        expect(res.body.errors).toContain("Invalid Token Provided.");
    });

    it("returns 404 for token not in database", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "notindb@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Not",
                        last_name: "InDB",
                    },
                },
            },
        });

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        const res = await request(app)
            .get(`/auth/check-password-reset-token?token=${token}`);

        expect(res.status).toBe(404);
        expect(res.body.errors).toContain("Invalid Token Provided.");
    });
});
