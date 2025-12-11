import {prisma} from "../../config/db";
import {toSafeUser} from "../../lib/safe-user";
import {AppError, UserNotFoundError} from "../../lib/errors";

export class MeService {
    async getMe(id: string) {
        let user;

        try {
            user = await prisma.user.findUnique({
                where: {id},
                include: {profile: true},
            });
        } catch (error) {
            throw new AppError("Failed to retrieve user");
        }

        if (!user) {
            throw new UserNotFoundError();
        }

        return toSafeUser(user);
    }
}
