import { redis } from "../../config/redis";
import { prisma } from "../../config/db";
import speakeasy from "speakeasy";
import { generateAuthToken } from "../../lib/auth-token-generator";
import { toSafeUser } from "../../lib/safe-user";
export class TwoFactorChallengeService {
    async verifyLoginCode(data) {
        const cacheKey = `tfchal:${data.challenge_id}`;
        const payload = await redis.get(cacheKey);
        if (!payload)
            throw new Error("TFA_CHALLENGE_NOT_FOUND");
        const { userId } = JSON.parse(payload);
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
        if (!user || !user.two_factor_enabled)
            throw new Error("TFA_NOT_ENABLED");
        let ok = false;
        if (user.two_factor_secret) {
            ok = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: "base32",
                token: data.code,
                window: 1,
            });
        }
        let backupCodes = [...(user.two_factor_recovery_codes ?? [])];
        if (!ok && backupCodes.length) {
            const idx = backupCodes.indexOf(data.code);
            if (idx !== -1) {
                ok = true;
                backupCodes.splice(idx, 1); // consume
            }
        }
        if (!ok)
            throw new Error("INVALID_TFA_TOKEN");
        if (backupCodes.length !== (user.two_factor_recovery_codes?.length ?? 0)) {
            await prisma.user.update({
                where: { id: user.id },
                data: { two_factor_recovery_codes: backupCodes },
            });
        }
        const tokens = await generateAuthToken({
            id: user.id,
            email: user.email,
        });
        await redis
            .multi()
            .setEx(`session:${tokens.jti}`, 60 * 5, JSON.stringify({ userId: user.id, jti: tokens.jti }))
            .setEx(`user:${user.id}`, 60 * 5, JSON.stringify(toSafeUser(user)))
            .del(cacheKey)
            .exec();
        return {
            user: toSafeUser(user),
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        };
    }
}
