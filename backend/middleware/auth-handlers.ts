import {NextFunction, Response, Request} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.replace('Bearer ', '')
        if (!token) {
            throw new Error("No bearer token available");
        }
        // check if the token is valid => otherwise an error is thrown
        const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
        (req as AuthRequest).payload = decoded as JwtPayload;
        next();
    } catch (err) {
        res.status(401).send(`Please authenticate! ${err}`);
    }
};
export interface AuthRequest extends Request {
    payload: JwtPayload;
}