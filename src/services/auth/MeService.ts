import {prisma} from "../../config/db";
import {toSafeUser} from "../../lib/safe-user";

export class MeService {
    async getMe(id: string) {
        const user = await prisma.user.findUnique({
            where: {id},
            include: {profile: true},
        });

        if (!user) throw new Error("USER_NOT_FOUND");

        return toSafeUser(user);
    }
}