import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/auth-cookies";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

export async function TwoFactorChallengeController(req: Request, res: Response, next: NextFunction) {
    try {
        const {challenge_id, code} = req.body;

        if (!challenge_id || !code) {
            return fail(res, {
                status: 422,
                errors: ["challenge_id and code are required"],
            });
        }

        const result = await container.twoFactorChallengeService.verifyLoginCode({challenge_id, code});

        setAuthCookies(res, {
            access: result.access_token,
            refresh: result.refresh_token,
        });

        return success(res, {
            message: "2FA verified",
            data: {
                user: result.user,
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            },
        });
    } catch (error: any) {
        next(error);
    }
}
