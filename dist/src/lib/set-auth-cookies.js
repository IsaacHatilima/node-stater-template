import ms from "ms";
export function setAuthCookies(res, tokens) {
    const isProduction = process.env.NODE_ENV === "production";
    const refreshMaxAge = ms((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"));
    const accessMaxAge = ms((process.env.JWT_ACCESS_EXPIRES_IN ?? "120m"));
    res.cookie("refresh_token", tokens.refresh, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/auth",
        maxAge: refreshMaxAge,
    });
    res.cookie("access_token", tokens.access, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: accessMaxAge,
    });
}
