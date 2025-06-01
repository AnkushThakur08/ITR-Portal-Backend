import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@/models/user.model";
import { AppError } from "@/middleware/errorHandler";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Please log in to access this resource", 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    // 3) Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    // 4) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Invalid token. Please log in again", 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
