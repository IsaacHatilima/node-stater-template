import {PrismaClient} from "../generated/prisma/client";
import {RegisterService} from "../services/auth/RegisterService";
import {MeService} from "../services/auth/MeService";
import {LoginService} from "../services/auth/LoginService";
import {EmailVerificationService} from "../services/auth/EmailVerificationService";
import {RefreshTokenService} from "../services/auth/RefreshTokenService";
import {LogoutService} from "../services/auth/LogoutService";
import {ForgotPasswordService} from "../services/auth/ForgotPasswordService";
import {ForgotPasswordTokenCheckerService} from "../services/auth/ForgotPasswordTokenCheckerService";
import {ChangePasswordService} from "../services/auth/ChangePasswordService";

class Container {
    prisma = new PrismaClient();

    loginService = new LoginService(this.prisma);
    registerService = new RegisterService(this.prisma);
    emailVerificationService = new EmailVerificationService(this.prisma);
    meService = new MeService(this.prisma);
    refreshTokenService = new RefreshTokenService(this.prisma);
    logoutService = new LogoutService(this.prisma);
    forgotPasswordService = new ForgotPasswordService(this.prisma);
    forgotPasswordTokenCheckerService = new ForgotPasswordTokenCheckerService(this.prisma);
    changePasswordService = new ChangePasswordService(this.prisma);
}

export const container = new Container();
