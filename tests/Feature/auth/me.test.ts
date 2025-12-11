import request from "supertest";
import {createApp} from "../../../app";
import {generateAccessToken} from "../../../src/lib/jwt";
import {createAuthUser} from "../../test-helpers";

const app = createApp();

describe("GET /auth/me", () => {
    it("returns authenticated user data", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", `access_token=${created.access_token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(created.user.email);
        expect(res.body.user.profile.first_name).toBe("Me");
    });

    it("returns 401 when no token provided", async () => {
        const res = await request(app).get("/auth/me");

        expect(res.status).toBe(401);
    });

    it("returns 404 when user no longer exists", async () => {
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
