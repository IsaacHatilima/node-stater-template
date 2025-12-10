import { RegisterService } from "../services/auth/RegisterService";
import { MeService } from "../services/auth/MeService";
import { LoginService } from "../services/auth/LoginService";
import { EmailVerificationService } from "../services/auth/EmailVerificationService";
import { RefreshTokenService } from "../services/auth/RefreshTokenService";
import { LogoutService } from "../services/auth/LogoutService";
import { ForgotPasswordService } from "../services/auth/ForgotPasswordService";
import { ForgotPasswordTokenCheckerService } from "../services/auth/ForgotPasswordTokenCheckerService";
import { ChangePasswordService } from "../services/auth/ChangePasswordService";
import { UpdatePasswordService } from "../services/settings/UpdatePasswordService";
import { UpdateProfileService } from "../services/settings/UpdateProfileService";
import { DeleteAccountService } from "../services/settings/DeleteAccountService";
import { TwoFactorService } from "../services/settings/TwoFactorService";
import { TwoFactorChallengeService } from "../services/auth/TwoFactorChallengeService";
import { GoogleLoginService } from "../services/auth/GoogleLoginService";
class Container {
    services = {
        loginService: LoginService,
        registerService: RegisterService,
        emailVerificationService: EmailVerificationService,
        meService: MeService,
        refreshTokenService: RefreshTokenService,
        logoutService: LogoutService,
        forgotPasswordService: ForgotPasswordService,
        forgotPasswordTokenCheckerService: ForgotPasswordTokenCheckerService,
        changePasswordService: ChangePasswordService,
        updatePasswordService: UpdatePasswordService,
        updateProfileService: UpdateProfileService,
        deleteAccountService: DeleteAccountService,
        twoFactorService: TwoFactorService,
        twoFactorChallengeService: TwoFactorChallengeService,
        googleLoginService: GoogleLoginService,
    };
    singletons = {};
    constructor() {
        for (const [key, ServiceClass] of Object.entries(this.services)) {
            Object.defineProperty(this, key, {
                get: () => {
                    if (!this.singletons[key]) {
                        this.singletons[key] = new ServiceClass();
                    }
                    return this.singletons[key];
                },
                enumerable: true,
            });
        }
    }
}
export const container = new Container();
