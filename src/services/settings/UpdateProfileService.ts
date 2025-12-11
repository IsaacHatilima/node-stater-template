import {prisma} from "../../config/db";
import {normalizeEmail, normalizeName} from "../../utils/string";
import {redis} from "../../config/redis";
import {toSafeUser} from "../../lib/safe-user";
import {Request} from "express";
import {EmailTakenError, UpdateProfileError, UserNotFoundError} from "../../lib/errors";

export class UpdateProfileService {
    async updateProfile(
        data: { email: string; first_name: string; last_name: string },
        reqUser: Request
    ) {
        const emailChanged = data.email !== reqUser.user.email;

        let updatedUser;

        try {
            updatedUser = await prisma.user.update({
                where: {id: reqUser.user.id},
                data: {
                    email: normalizeEmail(data.email),
                    ...(emailChanged && {email_verified_at: null}),
                    profile: {
                        update: {
                            first_name: normalizeName(data.first_name),
                            last_name: normalizeName(data.last_name),
                        },
                    },
                },
                include: {profile: true},
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new UserNotFoundError();
            }

            if (error.code === "P2002") {
                throw new EmailTakenError();
            }

            throw new UpdateProfileError();
        }

        try {
            await redis.setEx(
                `user:${updatedUser.id}`,
                60 * 5,
                JSON.stringify(toSafeUser(updatedUser))
            );
        } catch {

        }

        return;
    }

}
