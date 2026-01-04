import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import jwt from "jsonwebtoken";
import {createPublicUser} from "../../test-helpers";
import bcrypt from "bcrypt";

const app = createApp();

describe("GET /auth/verify-email", () => {

    it("verifies email successfully with a valid token", async () => {
        const user = await createPublicUser();

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        const res = await request(app).get(`/auth/verify-email?token=${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Email successfully verified.");

        const refreshed = await prisma.user.findUnique({
            where: {id: user.id},
        });

        expect(refreshed?.email_verified_at).not.toBeNull();
    });

    it("returns 400 for invalid or expired token", async () => {
        const res = await request(app)
            .get("/auth/verify-email?token=invalid.token.haha");

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("Invalid or expired token");
    });

    it("returns 404 if user from token does not exist", async () => {
        const fakeToken = jwt.sign(
            {id: 78, email: "ghost@example.com"},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        const res = await request(app)
            .get(`/auth/verify-email?token=${fakeToken}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("User not found");
    });

    it("returns 400 if user is already verified", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "already@example.com",
                password: hashedPassword,
                email_verified_at: new Date(),
                profile: {
                    create: {
                        first_name: "Already",
                        last_name: "Verified",
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
            .get(`/auth/verify-email?token=${token}`);

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Email already verified");
    });
});
