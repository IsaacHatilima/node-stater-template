import "dotenv/config";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {setAuthCookies} from "../../lib/auth-cookies";
import {fail, success} from "../../lib/response";

export default async function RefreshTokenController(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies?.refresh_token as string;
        if (!refreshToken) {
            return fail(res, {status: 401, errors: ["No refresh token"]});
        }
        const tokens = await container.refreshTokenService.refresh(refreshToken);

        setAuthCookies(res, {
            refresh: tokens.refresh_token,
            access: tokens.access_token,
        });

        return success(res, {
            message: "Token refreshed",
            data: {
                refresh_token: tokens.refresh_token,
                access_token: tokens.access_token,
            },
        });
    } catch (error: any) {
        next(error);
    }
}
