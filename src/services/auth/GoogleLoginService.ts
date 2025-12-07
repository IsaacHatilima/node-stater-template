import {OAuth2Client} from "google-auth-library";
import {prisma} from "../../config/db";
import {redis} from "../../config/redis";
import {v4 as uuidv4} from "uuid";
import {generateAuthToken} from "../../lib/auth-token-generator";

export class GoogleLoginService {
    private client: OAuth2Client;

    constructor() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID_NOT_SET");
        }
        this.client = new OAuth2Client(clientId);
    }

    async loginWithIdToken(data: { id_token: string }) {
        const ticket = await this.client.verifyIdToken({
            idToken: data.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("GOOGLE_TOKEN_INVALID");
        }

        const email = payload.email.toLowerCase();

        const user = await prisma.user.findFirst({
            where: {email},
            include: {profile: true},
            omit: {password: true},
        });

        if (!user) {
            return {no_account: true, email};
        }

        // Two-Factor Authentication handling
        if (user.two_factor_enabled) {
            const challengeId = uuidv4();
            await redis.setEx(
                `tfchal:${challengeId}`,
                60 * 5,
                JSON.stringify({userId: user.id})
            );

            return {
                two_factor_required: true,
                challenge_id: challengeId,
                user: user,
            };
        }

        const tokens = await generateAuthToken({id: user.id, email: user.email});

        await prisma.user.update({
            where: {id: user.id},
            data: {last_login: new Date()},
        });

        await redis
            .multi()
            .setEx(
                `session:${tokens.jti}`,
                60 * 5,
                JSON.stringify({userId: user.id, jti: tokens.jti})
            )
            .setEx(`user:${user.id}`, 60 * 5, JSON.stringify(user))
            .exec();

        return {
            user,
            tokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token
            }
        };
    }
}
