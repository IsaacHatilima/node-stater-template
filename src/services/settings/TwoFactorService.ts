import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import {v4 as uuidv4} from "uuid";

export class TwoFactorService {
    async initiateSetup(reqUser: { id: string; email?: string }) {
        const user = await prisma.user.findUnique({where: {id: reqUser.id}});
        if (!user) throw new Error("USER_NOT_FOUND");

        const secret = speakeasy.generateSecret({
            length: 20,
            name: `${process.env.APP_NAME ?? "App"} (${user.email})`,
            issuer: process.env.APP_NAME ?? "App",
        });

        await redis.setEx(`tfsetup:${user.id}`, 60 * 10, JSON.stringify(secret));

        const otpauthUrl = secret.otpauth_url as string;
        const qr = await QRCode.toDataURL(otpauthUrl);

        return {otpauth_url: otpauthUrl, qr_code: qr, secret: secret.base32};
    }

    async verifyAndEnable(data: { code: string }, reqUser: { id: string }) {
        const cached = await redis.get(`tfsetup:${reqUser.id}`);
        if (!cached) throw new Error("TFA_SETUP_NOT_FOUND");
        const secret = JSON.parse(cached) as { base32: string };

        const verified = speakeasy.totp.verify({
            secret: secret.base32,
            encoding: "base32",
            token: data.code,
            window: 1,
        });

        if (!verified) throw new Error("INVALID_TFA_TOKEN");

        const backupCodes = this.generateBackupCodes();

        await prisma.user.update({
            where: {id: reqUser.id},
            data: {
                two_factor_enabled: true,
                two_factor_secret: secret.base32,
                two_factor_recovery_codes: backupCodes,
            },
        });

        await redis.del(`tfsetup:${reqUser.id}`);

        return {enabled: true, backup_codes: backupCodes};
    }

    async disableMFA(data: { code?: string; backup_code?: string }, reqUser: { id: string }) {
        const user = await prisma.user.findUnique({where: {id: reqUser.id}});
        if (!user) throw new Error("USER_NOT_FOUND");

        if (!user.two_factor_enabled) return {disabled: true};

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

        if (!ok) throw new Error("INVALID_TFA_VERIFICATION");

        await prisma.user.update({
            where: {id: reqUser.id},
            data: {
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_recovery_codes: [],
            },
        });

        return {disabled: true};
    }

    async regenerateBackupCodes(reqUser: { id: string }) {
        const user = await prisma.user.findUnique({where: {id: reqUser.id}});
        if (!user) throw new Error("USER_NOT_FOUND");
        if (!user.two_factor_enabled) throw new Error("TFA_NOT_ENABLED");

        const backupCodes = this.generateBackupCodes();
        await prisma.user.update({
            where: {id: reqUser.id},
            data: {two_factor_recovery_codes: backupCodes},
        });

        return {backup_codes: backupCodes};
    }

    private generateBackupCodes(): string[] {
        const codes: string[] = [];
        for (let i = 0; i < 8; i++) {
            const id = uuidv4().replace(/-/g, "").slice(0, 10);
            codes.push(id);
        }
        return codes;
    }
}
