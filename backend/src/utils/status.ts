import { FieldStage, FieldStatus } from '@prisma/client';

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
  stage: FieldStage, 
  plantingDate: Date, 
  lastUpdateDate?: Date
): FieldStatus {
  // Harvested fields are always completed
  if (stage === FieldStage.HARVESTED) {
    return FieldStatus.COMPLETED;
  }
  
  const now = new Date();
  const daysSincePlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Risk assessment based on stage and timing
  if (stage === FieldStage.PLANTED && daysSincePlanting > 45) {
    return FieldStatus.AT_RISK;
  }
  
  if (stage === FieldStage.GROWING && daysSincePlanting > 150) {
    return FieldStatus.AT_RISK;
  }
  
  return FieldStatus.ACTIVE;
}

export function getExpectedDuration(stage: FieldStage): number {
  switch (stage) {
    case FieldStage.PLANTED:
      return 30; // Expected to sprout within 30 days
    case FieldStage.GROWING:
      return 90; // Expected growing period
    case FieldStage.READY:
      return 14; // Expected to harvest within 2 weeks
    case FieldStage.HARVESTED:
      return 0;
    default:
      return 30;
  }
}
