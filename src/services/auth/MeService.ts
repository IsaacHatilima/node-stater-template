import {prisma} from "../../config/db";

export class MeService {
    async getMe(id: string) {
        const user = await prisma.user.findUnique({
            where: {id},
            include: {profile: true},
            omit: {password: true}
        });

        if (!user) throw new Error("USER_NOT_FOUND");

        return user;
    }
}