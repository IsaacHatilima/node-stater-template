import type {Profile} from "../../generated/prisma/client";

export class ProfileDTO {
    readonly publicId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly createdAt: string | null;
    readonly updatedAt: string | null;

    constructor(profile: Profile) {
        this.publicId = profile.public_id;
        this.firstName = profile.first_name;
        this.lastName = profile.last_name;
        this.createdAt = profile.created_at?.toISOString() ?? null;
        this.updatedAt = profile.updated_at?.toISOString() ?? null;
    }

    toJSON() {
        return {
            public_id: this.publicId,
            first_name: this.firstName,
            last_name: this.lastName,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
        };
    }
}

