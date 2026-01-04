import {prisma} from "../../config/db";
import {AppError, UserNotFoundError} from "../../lib/errors";
import {UserDTO} from "../../dtos/read/UserReadDTO";

export class MeService {
    async getMe(public_id: string) {
        let user;

        try {
            user = await prisma.user.findUnique({
                where: {public_id: public_id},
                include: {profile: true},
            });
        } catch (error) {
            throw new AppError("Failed to retrieve user");
        }

        if (!user) {
            throw new UserNotFoundError();
        }

        return new UserDTO(user);
    }
}
