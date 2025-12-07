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
import {DeleteAccountService} from "../services/settings/DeleteAccountService";
import {TwoFactorService} from "../services/settings/TwoFactorService";
import {TwoFactorChallengeService} from "../services/auth/TwoFactorChallengeService";
import {GoogleLoginService} from "../services/auth/GoogleLoginService";

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
    deleteAccountService = new DeleteAccountService();
    twoFactorService = new TwoFactorService();
    twoFactorChallengeService = new TwoFactorChallengeService();
    googleLoginService = new GoogleLoginService();
}

export const container = new Container();
