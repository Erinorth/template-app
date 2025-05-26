// Types สำหรับระบบ Risk Assessment
export interface OrganizationalRisk {
  id: number;
  risk_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DivisionRisk {
  id: number;
  risk_name: string;
  description: string;
  organizational_risk_id?: number;
  organizational_risk?: OrganizationalRisk;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface RiskAssessment {
  id: number;
  assessment_year: number;
  assessment_period: number;
  likelihood_level: number;
  impact_level: number;
  risk_score: number;
  division_risk_id: number;
  division_risk?: DivisionRisk;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface LikelihoodCriteria {
  id: number;
  level: number;
  name: string;
  description?: string;
  division_risk_id: number;
  created_at: string;
  updated_at: string;
}

export interface ImpactCriteria {
  id: number;
  level: number;
  name: string;
  description?: string;
  division_risk_id: number;
  created_at: string;
  updated_at: string;
}

// Generic table column definition
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
  format?: (value: any, row: T) => string;
  component?: any;
}

// Table configuration
export interface TableConfig<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}
