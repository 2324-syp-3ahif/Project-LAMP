import jwt, {JwtPayload} from "jsonwebtoken";

export function generateTokens(payload: object) {
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: '1m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

export function verifyToken(token: string, secret: string): JwtPayload | string | null {
    try{
        return jwt.verify(token, secret);
    }catch(err){
        return null;
    }
}
