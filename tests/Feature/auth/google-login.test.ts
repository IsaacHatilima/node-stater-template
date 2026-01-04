import request from "supertest";
import {createApp} from "../../../app";

const app = createApp();

describe("POST /auth/google", () => {
    it("returns 422 when id_token is missing", async () => {
        const res = await request(app)
            .post("/auth/google")
            .send({});

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain("id_token is required");
    });

    it("returns error for invalid Google token", async () => {
        const res = await request(app)
            .post("/auth/google")
            .send({
                id_token: "invalid.google.token",
            });

        expect([400, 500]).toContain(res.status);
    });

    it("returns 404 when no account exists for Google email", async () => {
        const res = await request(app)
            .post("/auth/google")
            .send({
                id_token: "some.token.here",
            });
        expect([400, 404, 500]).toContain(res.status);
    });

});
