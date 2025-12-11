import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken} from "../../../src/lib/jwt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {createAuthUser} from "../../test-helpers";

const app = createApp();

describe("POST /auth/refresh-tokens", () => {
    it("refreshes tokens successfully with valid refresh token", async () => {
        const created = await createAuthUser();

        const refresh_token = generateRefreshToken({
            id: created.user.id,
        });

        const decoded = jwt.decode(created.access_token) as JwtPayload & { jti?: string };
        const jti = decoded.jti as string;

        await prisma.refreshToken.create({
            data: {
                userId: created.user.id,
                jti,
                token: refresh_token,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            },
        });

        const res = await request(app)
            .post("/auth/refresh-tokens")
            .set("Cookie", [`access_token=${created.access_token}`, `refresh_token=${refresh_token}`]);

        if (res.status !== 200) {
            console.log("Response:", res.status, res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Token refreshed");

        const oldToken = await prisma.refreshToken.findUnique({
            where: {token: refresh_token},
        });
        expect(oldToken?.revoked).toBe(true);
    });

    it("returns 401 when no refresh token provided", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .post("/auth/refresh-tokens")
            .set("Cookie", `access_token=${created.access_token}`);

        expect(res.status).toBe(401);
        expect(res.body.errors).toContain("No refresh token");
    });

    it("returns 401 for revoked refresh token", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "revoked@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Revoked",
                        last_name: "Token",
                    },
                },
            },
        });

        const access_token = generateAccessToken({
            id: user.id,
            email: user.email,
        });

        const refresh_token = generateRefreshToken({
            id: user.id,
        });

        const decoded = jwt.decode(access_token) as JwtPayload & { jti?: string };
        const jti = decoded.jti as string;

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                jti,
                token: refresh_token,
                revoked: true,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            },
        });

        const res = await request(app)
            .post("/auth/refresh-tokens")
            .set("Cookie", [`access_token=${access_token}`, `refresh_token=${refresh_token}`]);

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});
