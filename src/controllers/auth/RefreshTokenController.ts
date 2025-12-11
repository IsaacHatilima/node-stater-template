import "dotenv/config";
import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {setAuthCookies} from "../../lib/set-auth-cookies";

export default async function RefreshTokenController(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies?.refresh_token as string;
        if (!refreshToken) {
            return res.status(401).json({errors: ["No refresh token"]});
        }
        const tokens = await container.refreshTokenService.refresh(refreshToken);

        setAuthCookies(res, {
            refresh: tokens.refresh_token!,
            access: tokens.access_token!,
        });

        return res.json({
            message: "Token refreshed",
        });
    } catch (error: any) {
        next(error);
    }
}
