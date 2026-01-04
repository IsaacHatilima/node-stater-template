import type {Profile, User} from "../../generated/prisma/client";
import {ProfileDTO} from "./ProfileDTO";

export class UserDTO {
    readonly publicId: string;
    readonly email: string;
    readonly emailVerifiedAt: string | null;
    readonly twoFactorEnabled: boolean;
    readonly profile: ProfileDTO | null;
    readonly createdAt: string | null;
    readonly updatedAt: string | null;

    constructor(user: User & { profile?: Profile | null }) {
        this.publicId = user.public_id;
        this.email = user.email;
        this.emailVerifiedAt = user.email_verified_at?.toISOString() ?? null;
        this.twoFactorEnabled = user.two_factor_enabled;
        this.profile = user.profile ? new ProfileDTO(user.profile) : null;
        this.createdAt = user.created_at?.toISOString() ?? null;
        this.updatedAt = user.updated_at?.toISOString() ?? null;
    }

    toJSON() {
        return {
            public_id: this.publicId,
            email: this.email,
            email_verified_at: this.emailVerifiedAt,
            two_factor_enabled: this.twoFactorEnabled,
            profile: this.profile?.toJSON(),
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }
}

