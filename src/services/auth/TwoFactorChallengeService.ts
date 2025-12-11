import {redis} from "../../config/redis";
import {prisma} from "../../config/db";
import speakeasy from "speakeasy";
import {generateAuthToken} from "../../lib/auth-token-generator";
import {toSafeUser} from "../../lib/safe-user";
import {
    AppError,
    InvalidTwoFactorTokenError,
    SessionCreationError,
    TwoFactorChallengeNotFoundError,
    TwoFactorNotEnabledError,
    TwoFactorUpdateError
} from "../../lib/errors";

export class TwoFactorChallengeService {
    async verifyLoginCode(data: { challenge_id: string; code: string }) {
        const cacheKey = `tfchal:${data.challenge_id}`;

        const payload = await redis.get(cacheKey);
        if (!payload) {
            throw new TwoFactorChallengeNotFoundError();
        }

        let userId: string;
        try {
            userId = JSON.parse(payload).userId;
        } catch {
            throw new TwoFactorChallengeNotFoundError();
        }

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {profile: true},
        });

        if (!user || !user.two_factor_enabled) {
            throw new TwoFactorNotEnabledError();
        }

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

        if (!ok && backupCodes.length > 0) {
            const idx = backupCodes.indexOf(data.code);

            if (idx !== -1) {
                ok = true;
                backupCodes.splice(idx, 1);
            }
        }

        if (!ok) {
            throw new InvalidTwoFactorTokenError();
        }

        if (backupCodes.length !== (user.two_factor_recovery_codes?.length ?? 0)) {
            try {
                await prisma.user.update({
                    where: {id: user.id},
                    data: {two_factor_recovery_codes: backupCodes},
                });
            } catch {
                throw new TwoFactorUpdateError();
            }
        }

        const tokens = await generateAuthToken({
            id: user.id,
            email: user.email,
        });

        try {
            await redis
                .multi()
                .setEx(
                    `session:${tokens.jti}`,
                    60 * 5,
                    JSON.stringify({userId: user.id, jti: tokens.jti})
                )
                .setEx(
                    `user:${user.id}`,
                    60 * 5,
                    JSON.stringify(toSafeUser(user))
                )
                .del(cacheKey)
                .exec();
        } catch {
            throw new SessionCreationError();
        }

        try {
            await prisma.user.update({
                where: {id: user.id},
                data: {last_login: new Date()},
            });
        } catch {
            throw new AppError("Failed to update login metadata", 500);
        }

        return {
            user: toSafeUser(user),
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        };
    }

}
