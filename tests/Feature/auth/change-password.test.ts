import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {createPublicUser} from "../../test-helpers";

const app = createApp();

describe("POST /auth/change-password", () => {
    it("changes password successfully with valid token", async () => {
        const user = await createPublicUser();

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: token,
            },
        });

        const res = await request(app)
            .post(`/auth/change-password?token=${token}`)
            .send({
                password: "NewPassword1#",
                password_confirm: "NewPassword1#",
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Password changed successfully.");

        const updatedUser = await prisma.user.findUnique({
            where: {id: user.id},
        });

        const isNewPassword = await bcrypt.compare("NewPassword1#", updatedUser!.password);
        expect(isNewPassword).toBe(true);

        const tokenInDb = await prisma.passwordResetToken.findUnique({
            where: {token: token},
        });
        expect(tokenInDb).toBeNull();
    });

    it("returns 400 when no token provided", async () => {
        const res = await request(app)
            .post("/auth/change-password")
            .send({
                password: "NewPassword1#",
                password_confirm: "NewPassword1#",
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("MISSING_TOKEN");
    });

    it("returns 422 when passwords do not match", async () => {
        const user = await createPublicUser();

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: token,
            },
        });

        const res = await request(app)
            .post(`/auth/change-password?token=${token}`)
            .send({
                password: "NewPassword1#",
                password_confirm: "DifferentPassword1#",
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toContain("Passwords do not match");
    });

    it("returns 422 for weak password", async () => {
        const user = await createPublicUser();

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.APP_KEY!,
            {expiresIn: "1h"}
        );

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: token,
            },
        });

        const res = await request(app)
            .post(`/auth/change-password?token=${token}`)
            .send({
                password: "weak",
                password_confirm: "weak",
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toBeDefined();
    });

    it("returns 400 for invalid token", async () => {
        const res = await request(app)
            .post("/auth/change-password?token=invalid.token")
            .send({
                password: "NewPassword1#",
                password_confirm: "NewPassword1#",
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid or expired token.");
    });
});
