export type UserRole = 'ADMIN' | 'FIELD_AGENT';
export type FieldStage = 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';
export type FieldStatus = 'ACTIVE' | 'AT_RISK' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Field {
  id: string;
  name: string;
  cropType: string;
  plantingDate: string;
  stage: FieldStage;
  status: FieldStatus;
  location?: string;
  size?: number;
  agentId?: string;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    updates: number;
  };
  updates?: FieldUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldUpdate {
  id: string;
  fieldId: string;
  agentId: string;
  agent?: {
    name: string;
  };
  stage: FieldStage;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalFields: number;
  statusBreakdown: {
    active: number;
    atRisk: number;
    completed: number;
  };
  stageBreakdown: {
    planted: number;
    growing: number;
    ready: number;
    harvested: number;
  };
  recentUpdates: (FieldUpdate & {
    field: {
      name: string;
      cropType: string;
    };
  })[];
}
