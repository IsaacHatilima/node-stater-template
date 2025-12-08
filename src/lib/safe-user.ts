// src/lib/safe-user.ts
import type {Profile, User} from "../generated/prisma/client";

export function toSafeUser(user: User & { profile?: Profile | null }) {
    const {
        password,
        two_factor_secret,
        two_factor_recovery_codes,
        ...rest
    } = user;

    return {
        ...rest,
        profile: user.profile ?? null,
    };
}
