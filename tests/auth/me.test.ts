import request from "supertest";
import {createApp} from "../../app";
import {prisma} from "../../src/config/db";
import bcrypt from "bcrypt";
import {generateAccessToken} from "../../src/lib/jwt";

const app = createApp();

describe("GET /auth/me", () => {
    it("returns authenticated user data", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "metest@example.com",
                password: hashedPassword,
                profile: {
                    create: {
                        first_name: "Me",
                        last_name: "Test",
                    },
                },
            },
        });

        const access_token = generateAccessToken({
            id: user.id,
            email: user.email,
        });

        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", `access_token=${access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe("metest@example.com");
        expect(res.body.user.profile.first_name).toBe("Me");
    });

    it("returns 401 when no token provided", async () => {
        const res = await request(app).get("/auth/me");

        expect(res.status).toBe(401);
    });

    it("returns 401 when user no longer exists", async () => {
        const access_token = generateAccessToken({
            id: "nonexistent-user-id",
            email: "ghost@example.com",
        });

        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", `access_token=${access_token}`);

        expect(res.status).toBe(401);
        expect(res.body.errors).toContain("Invalid or expired token");
    });
});
