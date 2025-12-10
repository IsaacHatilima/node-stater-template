export function toSafeUser(user) {
    const { password, two_factor_secret, two_factor_recovery_codes, ...rest } = user;
    return {
        ...rest,
        profile: user.profile ?? null,
    };
}
