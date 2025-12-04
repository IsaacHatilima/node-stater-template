import {RegisterService} from "../services/auth/RegisterService";
import {MeService} from "../services/auth/MeService";
import {LoginService} from "../services/auth/LoginService";
import {EmailVerificationService} from "../services/auth/EmailVerificationService";
import {RefreshTokenService} from "../services/auth/RefreshTokenService";
import {LogoutService} from "../services/auth/LogoutService";
import {ForgotPasswordService} from "../services/auth/ForgotPasswordService";
import {ForgotPasswordTokenCheckerService} from "../services/auth/ForgotPasswordTokenCheckerService";
import {ChangePasswordService} from "../services/auth/ChangePasswordService";
import {UpdatePasswordService} from "../services/settings/UpdatePasswordService";
import {UpdateProfileService} from "../services/settings/UpdateProfileService";

class Container {
    loginService = new LoginService();
    registerService = new RegisterService();
    emailVerificationService = new EmailVerificationService();
    meService = new MeService();
    refreshTokenService = new RefreshTokenService();
    logoutService = new LogoutService();
    forgotPasswordService = new ForgotPasswordService();
    forgotPasswordTokenCheckerService = new ForgotPasswordTokenCheckerService();
    changePasswordService = new ChangePasswordService();
    updatePasswordService = new UpdatePasswordService();
    updateProfileService = new UpdateProfileService();
}

export const container = new Container();
