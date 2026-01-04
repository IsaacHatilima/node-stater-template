import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";
import {fail, success} from "../../lib/response";

export async function TwoFASetupController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await container.twoFactorService.initiateSetup(req);
        return success(res, {
            message: "2FA setup initiated",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFAEnableController(req: Request, res: Response, next: NextFunction) {
    try {
        const {code} = req.body;
        if (!code)
            return fail(res, {status: 422, errors: ["Token is required"]});
        const result = await container.twoFactorService.verifyAndEnable({code}, req);
        return success(res, {message: "2FA enabled", data: result});
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFADisableController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await container.twoFactorService.disableMFA(req);
        return success(res, {message: "2FA disabled", data: result});
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFARegenerateCodesController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await container.twoFactorService.regenerateBackupCodes(req);
        return success(res, {message: "Backup codes regenerated", data: result});
    } catch (error: any) {
        next(error);
    }
}
