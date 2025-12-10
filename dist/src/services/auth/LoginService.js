import { prisma } from "../../config/db";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../lib/jwt";
import jwt from "jsonwebtoken";
import { redis } from "../../config/redis";
import { v4 as uuidv4 } from "uuid";
import { toSafeUser } from "../../lib/safe-user";
export class LoginService {
    async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: { profile: true },
        });
        if (!user) {
            throw new Error("INVALID_CREDENTIALS");
        }
        const valid = await bcrypt.compare(data.password, user.password);
        if (!valid) {
            throw new Error("INVALID_CREDENTIALS");
        }
        // Handle Two-Factor Authentication requirement
        if ((user).two_factor_enabled) {
            const challengeId = uuidv4();
            await redis.setEx(`tfchal:${challengeId}`, 60 * 5, JSON.stringify({ userId: user.id }));
            return {
                two_factor_required: true,
                challenge_id: challengeId,
                user: toSafeUser(user),
            };
        }
        const access_token = generateAccessToken({
            id: user.id,
            email: user.email,
        });
        const refresh_token = generateRefreshToken({
            id: user.id,
        });
        const decoded = jwt.decode(access_token);
        const jti = decoded.jti;
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                jti,
                token: refresh_token,
                expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000)
            }
        });
        await prisma.user.update({
            where: { email: data.email },
            data: { last_login: new Date() }
        });
        await redis.multi()
            .setEx(`session:${jti}`, 60 * 5, JSON.stringify({
            userId: user.id,
            jti,
        }))
            .setEx(`user:${user.id}`, 60 * 5, JSON.stringify(toSafeUser(user)))
            .exec();
        return {
            user: toSafeUser(user),
            access_token,
            refresh_token,
        };
    }
}
