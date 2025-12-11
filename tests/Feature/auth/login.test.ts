import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import bcrypt from "bcrypt";
import {createPublicUser} from "../../test-helpers";

const app = createApp();

describe("POST /auth/login", () => {
    it("user can login with valid credentials", async () => {
        const user = await createPublicUser();

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: "Password1#",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Logged in");
        expect(res.body.user).toBeDefined();
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
    });

    it("returns 400 for non-existent user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "Password1#",
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid Email or Password.");
    });

    it("returns 400 for incorrect password", async () => {
        const user = await createPublicUser();

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: "WrongPassword1#",
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid Email or Password.");
    });

    it("returns 2FA challenge when two-factor is enabled", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "2fauser@example.com",
                password: hashedPassword,
                two_factor_enabled: true,
                two_factor_secret: "TESTSECRET",
                profile: {
                    create: {
                        first_name: "TwoFactor",
                        last_name: "User",
                    },
                },
            },
        });

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password: "Password1#",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Two-factor authentication required");
        expect(res.body.two_factor_required).toBe(true);
        expect(res.body.challenge_id).toBeDefined();
    });
});
