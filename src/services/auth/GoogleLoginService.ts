import {OAuth2Client} from "google-auth-library";
import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import {v4 as uuidv4} from "uuid";
import {generateAuthToken} from "../../lib/auth-token-generator";
import {toSafeUser} from "../../lib/safe-user";
import {env} from "../../utils/environment-variables";
import {AppError, InvalidGoogleTokenError} from "../../lib/errors";

export class GoogleLoginService {
    client;

    constructor() {
        const clientId = env.GOOGLE_CLIENT_ID;
        this.client = new OAuth2Client(clientId);
    }

    async loginWithIdToken(data: { id_token: string }) {
        let payload;
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: data.id_token,
                audience: env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch {
            throw new InvalidGoogleTokenError();
        }

        if (!payload || !payload.email) {
            throw new InvalidGoogleTokenError();
        }

        const email = payload.email.toLowerCase();

        const user = await prisma.user.findFirst({
            where: {email},
            include: {profile: true},
        });

        if (!user) {
            return {no_account: true, email};
        }

        if (user.two_factor_enabled) {
            try {
                const challengeId = uuidv4();
                await redis.setEx(
                    `tfchal:${challengeId}`,
                    60 * 5,
                    JSON.stringify({userId: user.id})
                );

                return {
                    two_factor_required: true,
                    challenge_id: challengeId,
                    user: toSafeUser(user),
                };
            } catch (error) {
                throw new AppError("Failed to initiate two-factor challenge");
            }
        }

        let tokens;
        try {
            tokens = await generateAuthToken({id: user.id, email: user.email});
        } catch (error) {
            throw new AppError("Failed to generate authentication tokens");
        }

        try {
            await prisma.user.update({
                where: {id: user.id},
                data: {last_login: new Date()},
            });
        } catch {
            throw new AppError("Failed to update login metadata");
        }

        try {
            await redis
                .multi()
                .setEx(`session:${tokens.jti}`, 60 * 5, JSON.stringify({userId: user.id, jti: tokens.jti}))
                .setEx(`user:${user.id}`, 60 * 5, JSON.stringify(toSafeUser(user)))
                .exec();
        } catch {
            throw new AppError("Failed to create login session");
        }

        return {
            user: toSafeUser(user),
            tokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
            },
        };
    }

}
