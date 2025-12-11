import "dotenv/config";
import {container} from "../../lib/container";
import {setAuthCookies} from "../../lib/set-auth-cookies";
import {NextFunction, Request, Response} from "express";

export default async function GoogleLoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const {id_token} = req.body;
        if (!id_token) {
            return res.status(422).json({errors: ["id_token is required"]});
        }
        const result = await container.googleLoginService.loginWithIdToken({id_token});
        if ((result).two_factor_required) {
            return res.status(200).json({
                message: "Two-factor authentication required",
                two_factor_required: true,
                challenge_id: (result).challenge_id,
                user: (result).user,
            });
        }
        if ((result).no_account) {
            return res.status(404).json({
                errors: ["No account connected"],
                no_account: true,
                email: (result).email,
            });
        }

        setAuthCookies(res, {
            access: result.tokens!.access_token,
            refresh: result.tokens!.refresh_token,
        });

        return res.json({
            message: "Logged in with Google",
            user: result.user,
            access: result.tokens!.access_token,
            refresh: result.tokens!.refresh_token,
        });
    } catch (error) {
        next(error);
    }
}
