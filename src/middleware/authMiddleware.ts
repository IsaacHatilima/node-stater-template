import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {PrismaClient} from "../generated/prisma/client";

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

const prisma = new PrismaClient();

export async function AuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({errors: ["Unauthorized"]});
    }

    const token = authHeader.split(" ")[1];

    try {
        // 1. Verify token
        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        // 2. Check if THIS access token has been revoked
        if (decoded.jti) {
            const revoked = await prisma.refreshToken.findFirst({
                where: {
                    jti: decoded.jti,
                    revoked: true
                }
            });

            if (revoked) {
                return res.status(401).json({errors: ["Token expired"]});
            }
        }

        // 3. Put user on request and continue
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({errors: ["Invalid or expired token"]});
    }
}
