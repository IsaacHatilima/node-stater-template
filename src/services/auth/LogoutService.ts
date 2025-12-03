import {prisma} from "../../config/db";

export class LogoutService {
    async logout(refreshToken: string) {
        const stored = await prisma.refreshToken.findUnique({
            where: {token: refreshToken}
        });

        if (stored) {
            await prisma.refreshToken.update({
                where: {token: refreshToken},
                data: {revoked: true}
            });
        }

        return true;
    }
}
