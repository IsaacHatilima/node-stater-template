import request from "supertest";
import {createApp} from "../../../app";
import {createAuthUser} from "../../test-helpers";
import {generateRefreshToken} from "../../../src/lib/jwt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {prisma} from "../../../src/config/db";

const app = createApp();

describe("POST /settings/delete-account", () => {
    it("user can delete account with correct password", async () => {
        const created = await createAuthUser();

        const refresh_token = generateRefreshToken({
            id: created.user.id,
        });

        const decoded = jwt.decode(created.access_token) as JwtPayload & { jti?: string };
        const jti = decoded.jti as string;

        await prisma.refreshToken.create({
            data: {
                userId: created.user.id,
                jti,
                token: refresh_token,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            },
        });

        const res = await request(app)
            .post("/settings/delete-account")
            .set("Cookie", [`access_token=${created.access_token}`, `refresh_token=${refresh_token}`])
            .send({
                password: "Password1#"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Profile Deleted successfully.");
    });

    it("user cannot delete account with wrong password", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .post("/settings/delete-account")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({
                password: "WrongPassword#"
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid password.");
    });

    it("user cannot delete account without password", async () => {
        const created = await createAuthUser();

        const res = await request(app)
            .post("/settings/delete-account")
            .set("Cookie", `access_token=${created.access_token}`)
            .send({});

        expect(res.status).toBe(422);
        expect(res.body.errors).toBeDefined();
    });
});
