/**
 * Compute field status based on stage and time factors
 *
 * Logic:
 * - HARVESTED → COMPLETED
 * - PLANTED/GROWING/READY → ACTIVE (normal progression)
 * - If a field has been in PLANTED stage for > 30 days without moving to GROWING → AT_RISK
 * - If a field has been in GROWING for > 90 days without moving to READY → AT_RISK
 */
export declare function computeFieldStatus(stage: string, plantingDate: Date, lastUpdateDate?: Date): string;
export declare function getExpectedDuration(stage: string): number;
//# sourceMappingURL=status.d.ts.map