import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { AuthRequest };
//# sourceMappingURL=auth.d.ts.map