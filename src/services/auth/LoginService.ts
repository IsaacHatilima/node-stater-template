import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {generateAccessToken, generateRefreshToken} from "../../lib/jwt";
import {redis} from "../../config/redis";
import {v4 as uuidv4} from "uuid";
import {UserDTO} from "../../dtos/read/UserReadDTO";
import {
    AppError,
    InvalidCredentialsError,
    LoginMetadataError,
    SessionCreationError,
    TwoFactorChallengeError
} from "../../lib/errors";
import {LoginRequestDTO} from "../../dtos/command/LoginRequestDTO";

export class LoginService {
    async login(dto: LoginRequestDTO) {
        const user = await prisma.user.findUnique({
            where: {email: dto.email},
            include: {profile: true},
        });

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new InvalidCredentialsError();
        }

        if (user.two_factor_enabled) {
            try {
                const challengeId = uuidv4();
                await redis.setEx(
                    `tfchal:${challengeId}`,
                    60 * 5,
                    JSON.stringify({userId: user.public_id})
                );

                return {
                    two_factor_required: true,
                    challenge_id: challengeId,
                };
            } catch (error) {
                throw new TwoFactorChallengeError();
            }
        }

        const access_token = generateAccessToken({
            id: user.id,
            email: user.email,
        });
        const refresh_token = generateRefreshToken({
            id: user.id,
        });

        try {
            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    token: refresh_token,
                    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
                },
            });
        } catch (error) {
            throw new AppError("Failed to store refresh token.");
        }

        try {
            await prisma.user.update({
                where: {email: dto.email},
                data: {last_login: new Date()},
            });
        } catch (error) {
            throw new LoginMetadataError();
        }

        try {
            await redis
                .multi()
                .setEx(
                    `user:${user.id}`,
                    60 * 5,
                    JSON.stringify(new UserDTO(user))
                )
                .exec();
        } catch (error) {
            throw new SessionCreationError();
        }

        return {
            user: new UserDTO(user),
            access_token,
            refresh_token,
        };
    }

}
