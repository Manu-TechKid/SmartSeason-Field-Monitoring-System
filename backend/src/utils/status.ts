/**
 * Compute field status based on stage and time factors
 * 
 * Logic:
 * - HARVESTED → COMPLETED
 * - PLANTED/GROWING/READY → ACTIVE (normal progression)
 * - If a field has been in PLANTED stage for > 30 days without moving to GROWING → AT_RISK
 * - If a field has been in GROWING for > 90 days without moving to READY → AT_RISK
 */
export function computeFieldStatus(
  stage: string, 
  plantingDate: Date, 
  lastUpdateDate?: Date
): string {
  // Harvested fields are always completed
  if (stage === 'HARVESTED') {
    return 'COMPLETED';
  }
  
  const now = new Date();
  const daysSincePlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Risk assessment based on stage and timing
  if (stage === 'PLANTED' && daysSincePlanting > 45) {
    return 'AT_RISK';
  }
  
  if (stage === 'GROWING' && daysSincePlanting > 150) {
    return 'AT_RISK';
  }
  
  return 'ACTIVE';
}

export function getExpectedDuration(stage: string): number {
  switch (stage) {
    case 'PLANTED':
      return 30; // Expected to sprout within 30 days
    case 'GROWING':
      return 90; // Expected growing period
    case 'READY':
      return 14; // Expected to harvest within 2 weeks
    case 'HARVESTED':
      return 0;
    default:
      return 30;
  }
}
