import {Response} from "express";
import ms from "ms";

export function setAuthCookies(res: Response, tokens: { access: string; refresh: string }) {
    const isProduction = process.env.NODE_ENV === "production";
    const refreshMaxAge = ms((process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as ms.StringValue);
    const accessMaxAge = ms((process.env.JWT_ACCESS_EXPIRES_IN ?? "120m") as ms.StringValue);

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
