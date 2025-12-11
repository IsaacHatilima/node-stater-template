export class AppError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
    }
}

export class InvalidGoogleTokenError extends AppError {
    constructor() {
        super("Invalid Google token.", 400);
    }
}

export class EmailTakenError extends AppError {
    constructor() {
        super("Email is already in use.", 400);
    }
}

export class InvalidPasswordTokenError extends AppError {
    constructor() {
        super("Invalid or expired token.", 400);
    }
}

export class UserNotFoundError extends AppError {
    constructor() {
        super("User not found.", 404);
    }
}

export class InvalidRefreshTokenError extends AppError {
    constructor() {
        super("Invalid or expired refresh token", 400);
    }
}


export class PasswordResetCreationError extends AppError {
    constructor() {
        super("Could not create reset token.", 500);
    }
}

export class PasswordResetEmailError extends AppError {
    constructor() {
        super("Failed to send password reset email.", 500);
    }
}

export class InvalidCredentialsError extends AppError {
    constructor() {
        super("Invalid Email or Password.", 400);
    }
}

export class TwoFactorChallengeError extends AppError {
    constructor() {
        super("Failed to initiate two-factor challenge.", 500);
    }
}

export class SessionCreationError extends AppError {
    constructor() {
        super("Failed to create login session.", 500);
    }
}

export class LoginMetadataError extends AppError {
    constructor() {
        super("Failed to update login metadata.", 500);
    }
}

export class TwoFactorChallengeNotFoundError extends AppError {
    constructor() {
        super("Two-factor challenge not found.", 400);
    }
}

export class TwoFactorNotEnabledError extends AppError {
    constructor() {
        super("Two-factor authentication is not enabled.", 400);
    }
}

export class InvalidTwoFactorTokenError extends AppError {
    constructor() {
        super("Invalid two-factor authentication code.", 400);
    }
}

export class TwoFactorUpdateError extends AppError {
    constructor() {
        super("Failed to update recovery codes.", 500);
    }
}

export class InvalidPasswordError extends AppError {
    constructor() {
        super("Invalid password.", 400);
    }
}

export class UserDeletionError extends AppError {
    constructor() {
        super("Failed to delete user account.", 500);
    }
}

export class LogoutSessionError extends AppError {
    constructor() {
        super("Failed to clear user session.", 500);
    }
}

export class TwoFactorSetupNotFoundError extends AppError {
    constructor() {
        super("Two-factor setup session not found.", 400);
    }
}

export class TwoFactorSetupError extends AppError {
    constructor() {
        super("Failed to initiate two-factor setup.", 500);
    }
}

export class TwoFactorEnableError extends AppError {
    constructor() {
        super("Failed to enable two-factor authentication.", 500);
    }
}

export class TwoFactorDisableError extends AppError {
    constructor() {
        super("Failed to disable two-factor authentication.", 500);
    }
}

export class BackupCodeRegenerationError extends AppError {
    constructor() {
        super("Failed to regenerate backup codes.", 500);
    }
}

export class UpdatePasswordError extends AppError {
    constructor() {
        super("Failed to update password.", 500);
    }
}

export class UpdateProfileError extends AppError {
    constructor() {
        super("Failed to update profile.", 500);
    }
}




