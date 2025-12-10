import "dotenv/config";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpires = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m");
const refreshExpires = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d");
export function generateAccessToken(payload) {
    return jwt.sign({
        ...payload,
        jti: randomUUID(),
    }, accessSecret, { expiresIn: accessExpires });
}
export function generateRefreshToken({ id }) {
    return jwt.sign({
        id,
        jti: randomUUID(),
    }, refreshSecret, { expiresIn: refreshExpires });
}
