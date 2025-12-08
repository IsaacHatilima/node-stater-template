import request from "supertest";
import {createApp} from "../../app";
import {prisma} from "../../src/config/db";
import bcrypt from "bcrypt";

const app = createApp();

describe("POST /auth/login", () => {
    it("user can login with valid credentials", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "logintest@example.com",
                password: hashedPassword,
                email_verified_at: new Date(),
                profile: {
                    create: {
                        first_name: "Login",
                        last_name: "Test",
                    },
                },
            },
        });

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "logintest@example.com",
                password: "Password1#",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Logged in");
        expect(res.body.user).toBeDefined();
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
    });

    it("returns 404 for non-existent user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "Password1#",
            });

        expect(res.status).toBe(404);
        expect(res.body.errors).toContain("Invalid Email or Password");
    });

    it("returns 404 for incorrect password", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        await prisma.user.create({
            data: {
                email: "wrongpass@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Wrong",
                        last_name: "Pass",
                    },
                },
            },
        });

        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "wrongpass@example.com",
                password: "WrongPassword1#",
            });

        expect(res.status).toBe(404);
        expect(res.body.errors).toContain("Invalid Email or Password");
    });

    it("returns 2FA challenge when two-factor is enabled", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        await prisma.user.create({
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
                email: "2fauser@example.com",
                password: "Password1#",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Two-factor authentication required");
        expect(res.body.two_factor_required).toBe(true);
        expect(res.body.challenge_id).toBeDefined();
    });
});
