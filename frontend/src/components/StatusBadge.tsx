import { FieldStage, FieldStatus } from '../types';

interface StatusBadgeProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

interface StageBadgeProps {
  stage: FieldStage;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    AT_RISK: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const labels = {
    ACTIVE: 'Active',
    AT_RISK: 'At Risk',
    COMPLETED: 'Completed',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styles[status]}`}>
      {status === 'AT_RISK' && <span className="mr-1">⚠️</span>}
      {labels[status]}
    </span>
  );
}

export function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  const styles = {
    PLANTED: 'bg-amber-100 text-amber-800 border-amber-200',
    GROWING: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    READY: 'bg-blue-100 text-blue-800 border-blue-200',
    HARVESTED: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const labels = {
    PLANTED: 'Planted',
    GROWING: 'Growing',
    READY: 'Ready',
    HARVESTED: 'Harvested',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styles[stage]}`}>
      {labels[stage]}
    </span>
  );
}
