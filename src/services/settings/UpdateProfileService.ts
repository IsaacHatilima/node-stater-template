import {prisma} from "../../config/db";
import {normalizeEmail, normalizeName} from "../../utils/string";
import {redis} from "../../config/redis";

export class UpdateProfileService {
    async updateProfile(data: {
        email: string;
        first_name: string;
        last_name: string;
    }, reqUser: { id: string; email: string }) {
        const emailChanged = data.email !== reqUser.email;

        try {
            const updatedUser = await prisma.user.update({
                where: {id: reqUser.id},
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
                include: {
                    profile: true,
                },
                omit: {password: true},
            });

            await redis.setEx(
                `user:${updatedUser.id}`,
                60 * 5,
                JSON.stringify(updatedUser)
            );

            return {success: true};
        } catch (error: any) {
            if (error.code === "P2025") {
                throw new Error("USER_NOT_FOUND");
            }
            throw error;
        }
    }
}