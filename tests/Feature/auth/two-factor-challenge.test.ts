import request from "supertest";
import {createApp} from "../../../app";
import {prisma} from "../../../src/config/db";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import {redis} from "../../../src/config/redis";
import {v4 as uuidv4} from "uuid";

const app = createApp();

describe("POST /auth/2fa/verify", () => {
    it("verifies 2FA code successfully with valid TOTP", async () => {
        const secret = speakeasy.generateSecret({length: 20});
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "2faverify@example.com",
                password: hashedPassword,
                two_factor_enabled: true,
                two_factor_secret: secret.base32,
                profile: {
                    create: {
                        first_name: "TwoFactor",
                        last_name: "Verify",
                    },
                },
            },
        });

        const challengeId = uuidv4();
        await redis.setEx(
            `tfchal:${challengeId}`,
            60 * 5,
            JSON.stringify({userId: user.id})
        );

        const code = speakeasy.totp({
            secret: secret.base32,
            encoding: "base32",
        });

        const res = await request(app)
            .post("/auth/2fa/verify")
            .send({
                challenge_id: challengeId,
                code: code,
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("2FA verified");
        expect(res.body.user).toBeDefined();
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
    });

    it("verifies 2FA with backup code", async () => {
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const backupCode = "BACKUP123456";
        const user = await prisma.user.create({
            data: {
                email: "2fabackup@example.com",
                password: hashedPassword,
                two_factor_enabled: true,
                two_factor_secret: "TESTSECRET",
                two_factor_recovery_codes: [backupCode, "BACKUP789012"],
                profile: {
                    create: {
                        first_name: "Backup",
                        last_name: "Code",
                    },
                },
            },
        });

        const challengeId = uuidv4();
        await redis.setEx(
            `tfchal:${challengeId}`,
            60 * 5,
            JSON.stringify({userId: user.id})
        );

        const res = await request(app)
            .post("/auth/2fa/verify")
            .send({
                challenge_id: challengeId,
                code: backupCode,
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("2FA verified");

        const updatedUser = await prisma.user.findUnique({
            where: {id: user.id},
        });
        expect(updatedUser?.two_factor_recovery_codes).not.toContain(backupCode);
    });

    it("returns 422 when challenge_id or code missing", async () => {
        const res = await request(app)
            .post("/auth/2fa/verify")
            .send({
                challenge_id: "some-id",
            });

        expect(res.status).toBe(422);
        expect(res.body.errors).toContain("challenge_id and code are required");
    });

    it("returns 400 for non-existent challenge", async () => {
        const res = await request(app)
            .post("/auth/2fa/verify")
            .send({
                challenge_id: "nonexistent-challenge",
                code: "123456",
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Two-factor challenge not found.");
    });

    it("returns 400 for invalid 2FA code", async () => {
        const secret = speakeasy.generateSecret({length: 20});
        const hashedPassword = await bcrypt.hash("Password1#", 10);
        const user = await prisma.user.create({
            data: {
                email: "invalid2fa@example.com",
                password: hashedPassword,
                two_factor_enabled: true,
                two_factor_secret: secret.base32,
                profile: {
                    create: {
                        first_name: "Invalid",
                        last_name: "Code",
                    },
                },
            },
        });

        const challengeId = uuidv4();
        await redis.setEx(
            `tfchal:${challengeId}`,
            60 * 5,
            JSON.stringify({userId: user.id})
        );

        const res = await request(app)
            .post("/auth/2fa/verify")
            .send({
                challenge_id: challengeId,
                code: "000000",
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain("Invalid two-factor authentication code.");
    });
});
