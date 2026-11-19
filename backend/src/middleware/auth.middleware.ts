import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Cookie ya Bearer header dono support karega
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
      return;
    }

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: decoded.userId };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
};
