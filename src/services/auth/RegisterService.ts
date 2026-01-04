import "dotenv/config";
import {prisma} from "../../config/db";
import bcrypt from "bcrypt";
import {normalizeEmail, normalizeName} from "../../utils/string";
import {container} from "../../lib/container";
import {buildEmailTemplate, sendMail} from "../../lib/mailer";
import {EmailTakenError} from "../../lib/errors";
import {env} from "../../utils/environment-variables";
import {RegisterRequestDTO} from "../../dtos/command/RegisterRequestDTO";
import {UserDTO} from "../../dtos/read/UserReadDTO";

export class RegisterService {
    async register(dto: RegisterRequestDTO) {
        try {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const user = await prisma.user.create({
                data: {
                    email: normalizeEmail(dto.email),
                    password: hashedPassword,
                    profile: {
                        create: {
                            first_name: normalizeName(dto.firstName),
                            last_name: normalizeName(dto.lastName),
                        },
                    },
                },
                include: {profile: true},
            });
            const verificationToken = container.emailVerificationService.generateVerificationToken(user.id, user.email);
            const verificationUrl = `${env.APP_URL}/auth/verify-email?token=${verificationToken}`;

            await sendMail(user.email, "Verify your email", buildEmailTemplate({
                name: user.profile?.first_name ?? "there",
                message: "Please verify your email by clicking the button below.",
                url: verificationUrl,
                buttonText: "Verify Email",
            }));

            return new UserDTO(user);
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new EmailTakenError();
            }
            throw error;
        }
    }
}
