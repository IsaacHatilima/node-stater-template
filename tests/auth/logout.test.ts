import request from "supertest";
import {createApp} from "../../app";
import {prisma} from "../../src/config/db";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken} from "../../src/lib/jwt";
import jwt, {JwtPayload} from "jsonwebtoken";

const app = createApp();

describe("POST /auth/logout", () => {
    it("user can logout successfully", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "logouttest@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Logout",
                        last_name: "Test",
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
            email: user.email,
        });

        const decoded = jwt.decode(access_token) as JwtPayload & { jti?: string };
        const jti = decoded.jti as string;

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                jti,
                token: refresh_token,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            },
        });

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", [`access_token=${access_token}`, `refresh_token=${refresh_token}`]);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Logged out.");

        const refreshTokenInDb = await prisma.refreshToken.findUnique({
            where: {token: refresh_token},
        });

        expect(refreshTokenInDb?.revoked).toBe(true);
    });

    it("returns 200 when no refresh token provided", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "norefresh@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "No",
                        last_name: "Refresh",
                    },
                },
            },
        });

        const access_token = generateAccessToken({
            id: user.id,
            email: user.email,
        });

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", `access_token=${access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Logged out");
    });
});
