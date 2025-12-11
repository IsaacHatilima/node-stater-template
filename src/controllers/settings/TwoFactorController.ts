import {container} from "../../lib/container";
import {NextFunction, Request, Response} from "express";

export async function TwoFASetupController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await container.twoFactorService.initiateSetup(req);
        return res.json({
            message: "2FA setup initiated",
            ...result,
        });
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFAEnableController(req: Request, res: Response, next: NextFunction) {
    try {
        const {code} = req.body;
        if (!code)
            return res.status(422).json({errors: ["Token is required"]});
        const result = await container.twoFactorService.verifyAndEnable({code}, req);
        return res.json({message: "2FA enabled", ...result});
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFADisableController(req: Request, res: Response, next: NextFunction) {
    try {
        const {code, backup_code} = req.body;
        const result = await container.twoFactorService.disableMFA({code, backup_code}, req);
        return res.json({message: "2FA disabled", ...result});
    } catch (error: any) {
        next(error);
    }
}

export async function TwoFARegenerateCodesController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await container.twoFactorService.regenerateBackupCodes(req);
        return res.json({message: "Backup codes regenerated", ...result});
    } catch (error: any) {
        next(error);
    }
}
