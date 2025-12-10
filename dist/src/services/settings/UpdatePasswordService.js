import { prisma } from "../../config/db";
import bcrypt from "bcrypt";
export class UpdatePasswordService {
    async updatePassword(data, reqUser) {
        const user = await prisma.user.findFirst({
            where: { id: reqUser.id },
        });
        const valid = await bcrypt.compare(data.current_password, user.password);
        if (!valid) {
            throw new Error("INVALID_PASSWORD");
        }
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            await prisma.user.update({
                where: { id: reqUser.id },
                data: { password: hashedPassword },
            });
            return { success: true };
        }
        catch (error) {
            throw error;
        }
    }
}
