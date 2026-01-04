import "dotenv/config";
import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/auth-cookies";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

export default async function GoogleLoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const {id_token} = req.body;
        if (!id_token) {
            return fail(res, {status: 422, errors: ["id_token is required"]});
        }
        const result = await container.googleLoginService.loginWithIdToken({id_token});
        if ((result).two_factor_required) {
            return success(res, {
                message: "Two-factor authentication required",
                data: {
                    two_factor_required: true,
                    challenge_id: (result).challenge_id,
                    user: (result).user,
                }
            });
        }
        if ((result).no_account) {
            return fail(res, {
                status: 404,
                message: "No account connected",
                errors: ["No account connected"],
            });
        }

        setAuthCookies(res, {
            access: result.tokens!.access_token,
            refresh: result.tokens!.refresh_token,
        });

        return success(res, {
            message: "Logged in with Google",
            data: {
                user: result.user,
                access_token: result.tokens!.access_token,
                refresh_token: result.tokens!.refresh_token,
            },
        });
    } catch (error) {
        next(error);
    }
}
