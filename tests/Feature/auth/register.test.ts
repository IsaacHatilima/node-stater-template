import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";

const app = createApp();

describe("POST /auth/register", () => {
    it("user can register", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "johndoes@mail.com",
                password: "Password1#",
                password_confirm: "Password1#"
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Registered successfully.");
        expect(res.body.data).toBeDefined();
        const user = await prisma.user.findUnique({
            where: {email: "johndoes@mail.com"},
            include: {profile: true}
        });

        expect(user).not.toBeNull();
        expect(user!.email).toBe("johndoes@mail.com");
        expect(user!.profile).not.toBeNull();
        expect(user!.profile!.first_name).toBe("John");
        expect(user!.profile!.last_name).toBe("Doe");
    });

    it("user cannot register with different passwords", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "john.does@mail.com",
                password: "Password1#",
                password_confirm: "Password12#"
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("Passwords do not match");
        const user = await prisma.user.findUnique({
            where: {email: "john.does@mail.com"},
            include: {profile: true}
        });

        expect(user).toBeNull();
    });

    it("returns 400 on weak password", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                first_name: "Al",
                last_name: "Pacino",
                email: "al.pacino@example.com",
                password: "weakPass",
                password_confirm: "weakPass"
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeTruthy();
        expect(Array.isArray(res.body.errors)).toBe(true);
        const user = await prisma.user.findUnique({
            where: {email: "al.pacino@example.com"},
            include: {profile: true}
        });

        expect(user).toBeNull();
    });
});