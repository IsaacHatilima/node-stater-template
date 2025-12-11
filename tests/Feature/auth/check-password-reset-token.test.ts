import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import jwt from "jsonwebtoken";
import {createPublicUser} from "../../test-helpers";

const app = createApp();

describe("GET /auth/check-password-reset-token", () => {
    it("validates token successfully", async () => {
        const user = await createPublicUser();

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
    });

    it("returns 400 when no token provided", async () => {
        const res = await request(app)
            .get("/auth/check-password-reset-token");

        expect(res.status).toBe(400);
        expect(res.body.errors).toBe("Missing Token");
    });

    it("returns 404 for invalid token", async () => {
        const res = await request(app)
            .get("/auth/check-password-reset-token?token=invalid.token.here");

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid or expired token.");
    });

    it("returns 404 for token not in database", async () => {
        const user = await createPublicUser();

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        const res = await request(app)
            .get(`/auth/check-password-reset-token?token=${token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid or expired token.");
    });
});
