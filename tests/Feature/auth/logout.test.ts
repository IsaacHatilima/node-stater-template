import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import {generateAccessToken, generateRefreshToken} from "../../../src/lib/jwt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {createAuthUser, createPublicUser} from "../../test-helpers";

const app = createApp();

describe("POST /auth/logout", () => {
    it("user can logout successfully", async () => {
        const user = await createPublicUser();

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
        const createdData = await createAuthUser();

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", `access_token=${createdData.access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Logged out.");
    });
});
