import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import {createPublicUser} from "../../test-helpers";

const app = createApp();

describe("POST /auth/forgot-password", () => {
    it("sends reset link for valid email", async () => {
        const user = await createPublicUser();

        const res = await request(app)
            .post("/auth/forgot-password")
            .send({
                email: user.email,
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("A reset link has been sent to your email.");

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                user: {
                    email: user.email,
                },
            },
        });

        expect(resetToken).toBeDefined();
    });

    it("returns 404 for non-existent email", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({
                email: "nonexistentemail@example.com",
            });

        expect(res.status).toBe(404);
        expect(res.body.errors).toBe("User not found.");
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
