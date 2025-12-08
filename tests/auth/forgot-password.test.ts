import request from "supertest";
import {createApp} from "../../app";
import {prisma} from "../../src/config/db";
import bcrypt from "bcrypt";

const app = createApp();

describe("POST /auth/forgot-password", () => {
    it("sends reset link for valid email", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        await prisma.user.create({
            data: {
                email: "forgot@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Forgot",
                        last_name: "Password",
                    },
                },
            },
        });

        const res = await request(app)
            .post("/auth/forgot-password")
            .send({
                email: "forgot@example.com",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("A reset link has been sent to your email.");

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                user: {
                    email: "forgot@example.com",
                },
            },
        });

        expect(resetToken).toBeDefined();
    });

    it("returns 404 for non-existent email", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({
                email: "nonexistent@example.com",
            });

        expect(res.status).toBe(404);
        expect(res.body.errors).toContain("User with this email not found.");
    });

    it("returns 422 for invalid email format", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({
                email: "invalid-email",
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toBeDefined();
    });
});
