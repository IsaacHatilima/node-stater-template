import request from "supertest";
import {createApp} from "../../app";

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
        expect(res.body.message).toBe("Registered successfully.");
    });

    it("user cannot register with different passwords", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                first_name: "John",
                last_name: "Doe",
                email: "johndoes@mail.com",
                password: "Password1#",
                password_confirm: "Password12#"
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Passwords do not match");
    });

    it("returns 400 on weak password", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({
                first_name: "Al",
                last_name: "Pacino",
                email: "al.pacino@example.com",
                password: "weakpass",
                password_confirm: "weakpass"
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeTruthy();
        expect(Array.isArray(res.body.errors)).toBe(true);
    });
});