import type {Profile, User} from "../generated/prisma/client";

export function toSafeUser(user: User & { profile: Profile | null }) {
    const {
        id,
        password,
        two_factor_secret,
        two_factor_recovery_codes,
        ...rest
    } = user;

    const safeProfile = user.profile
        ? (({id, ...profile}) => profile)(user.profile)
        : null;

    return {
        ...rest,
        profile: safeProfile,
    };
}
