import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import {v4 as uuidv4} from "uuid";
import {Request} from "express";
import {env} from "../../utils/environment-variables";
import {
    AppError,
    BackupCodeRegenerationError,
    InvalidTwoFactorTokenError,
    TwoFactorDisableError,
    TwoFactorEnableError,
    TwoFactorNotEnabledError,
    TwoFactorSetupError,
    TwoFactorSetupNotFoundError,
    UserNotFoundError
} from "../../lib/errors";

export class TwoFactorService {
    // -----------------------------
    // 1. INITIATE TFA SETUP
    // -----------------------------
    async initiateSetup(reqUser: Request) {
        const user = await prisma.user.findUnique({
            where: {id: reqUser.user.id}
        });

        if (!user) throw new UserNotFoundError();

        let secret;
        try {
            secret = speakeasy.generateSecret({
                length: 20,
                name: `${env.APP_NAME ?? "App"} (${user.email})`,
                issuer: env.APP_NAME ?? "App",
            });
        } catch {
            throw new TwoFactorSetupError();
        }

        // Save in Redis (10 min)
        try {
            await redis.setEx(
                `tfsetup:${user.id}`,
                60 * 10,
                JSON.stringify(secret)
            );
        } catch {
            throw new TwoFactorSetupError();
        }

        let qr;
        try {
            qr = await QRCode.toDataURL(secret.otpauth_url as string);
        } catch {
            throw new TwoFactorSetupError();
        }

        return {
            otpauth_url: secret.otpauth_url!,
            qr_code: qr,
            secret: secret.base32
        };
    }

    // -----------------------------
    // 2. VERIFY TFA CODE & ENABLE
    // -----------------------------
    async verifyAndEnable(data: { code: string }, reqUser: Request) {
        let cached;
        try {
            cached = await redis.get(`tfsetup:${reqUser.user.id}`);
        } catch {
            throw new AppError("Failed to read MFA setup.");
        }

        if (!cached) throw new TwoFactorSetupNotFoundError();

        const secret = JSON.parse(cached);

        const verified = speakeasy.totp.verify({
            secret: secret.base32,
            encoding: "base32",
            token: data.code,
            window: 1,
        });

        if (!verified) throw new InvalidTwoFactorTokenError();

        const backupCodes = this.generateBackupCodes();

        try {
            await prisma.user.update({
                where: {id: reqUser.user.id},
                data: {
                    two_factor_enabled: true,
                    two_factor_secret: secret.base32,
                    two_factor_recovery_codes: backupCodes,
                },
            });
        } catch {
            throw new TwoFactorEnableError();
        }

        try {
            await redis.del(`tfsetup:${reqUser.user.id}`);
        } catch {

        }

        return {enabled: true, backup_codes: backupCodes};
    }

    // -----------------------------
    // 3. DISABLE MFA
    // -----------------------------
    async disableMFA(
        data: { code?: string; backup_code?: string },
        reqUser: Request
    ) {
        const user = await prisma.user.findUnique({
            where: {id: reqUser.user.id},
        });

        if (!user) throw new UserNotFoundError();

        if (!user.two_factor_enabled)
            return {disabled: true};

        let ok = false;

        if (data.code && user.two_factor_secret) {
            ok = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: "base32",
                token: data.code,
                window: 1,
            });
        }

        if (!ok && data.backup_code) {
            ok = (user.two_factor_recovery_codes ?? []).includes(data.backup_code);
        }

        if (!ok) throw new InvalidTwoFactorTokenError();

        try {
            await prisma.user.update({
                where: {id: user.id},
                data: {
                    two_factor_enabled: false,
                    two_factor_secret: null,
                    two_factor_recovery_codes: [],
                },
            });
        } catch {
            throw new TwoFactorDisableError();
        }

        return {disabled: true};
    }

    // -----------------------------
    // 4. REGENERATE BACKUP CODES
    // -----------------------------
    async regenerateBackupCodes(reqUser: Request) {
        const user = await prisma.user.findUnique({
            where: {id: reqUser.user.id}
        });

        if (!user) throw new UserNotFoundError();
        if (!user.two_factor_enabled) throw new TwoFactorNotEnabledError();

        const backupCodes = this.generateBackupCodes();

        try {
            await prisma.user.update({
                where: {id: reqUser.user.id},
                data: {two_factor_recovery_codes: backupCodes},
            });
        } catch {
            throw new BackupCodeRegenerationError();
        }

        return {backup_codes: backupCodes};
    }

    // -----------------------------
    // Helper: MFA Backup Codes
    // -----------------------------
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            const id = uuidv4().replace(/-/g, "").slice(0, 10);
            codes.push(id);
        }
        return codes;
    }
}

