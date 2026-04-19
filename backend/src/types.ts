import { UserRole, FieldStage, FieldStatus } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export { UserRole, FieldStage, FieldStatus };
