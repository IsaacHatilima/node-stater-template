import {generateAccessToken, generateRefreshToken} from "./jwt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {prisma} from "../config/db";

export async function generateAuthToken({id, email}: { id: string; email: string }) {
    const access_token = generateAccessToken({id: id, email: email});
    const refresh_token = generateRefreshToken({id: id});

    const decoded = jwt.decode(access_token) as JwtPayload & { jti?: string };
    const jti = decoded.jti as string;

    await prisma.refreshToken.create({
        data: {
            userId: id,
            jti,
            token: refresh_token,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        },
    });
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "jti": jti
    };
}