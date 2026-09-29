/**
 * - Convert nautical miles to meter: x * UNIT_METER_PER_NM
 * - Convert meter to nautical miles: x / UNIT_METER_PER_NM
 */
export const UNIT_METER_PER_NM = 1852;

/**
 * For simplified use refer to UNIT_METER_PER_NM
 */
export const UNIT_NM_PER_METER = 1 / UNIT_METER_PER_NM;

/**
 * - Convert statute miles to meter: x * UNIT_METER_PER_SM
 * - Convert meter to statute miles: x / UNIT_METER_PER_SM
 */
export const UNIT_METER_PER_SM = 1609.344;

/**
 * For simplified use refer to UNIT_METER_PER_SM
 */
export const UNIT_SM_PER_METER = 1 / UNIT_METER_PER_SM;

/**
 * - Convert yard to meter: x * UNIT_METER_PER_YARD
 * - Convert meter to yard: x / UNIT_METER_PER_YARD
 */
export const UNIT_METER_PER_YARD = 0.9144;

/**
 * For simplified use refer to UNIT_METER_PER_YARD
 */
export const UNIT_YARD_PER_METER = 1 / UNIT_METER_PER_YARD;

/**
 * - Convert feet to meter: x * UNIT_METER_PER_FEET
 * - Convert meter to feet: x / UNIT_METER_PER_FEET
 *
 * 3 feet are excatly 1 yard
 */
export const UNIT_METER_PER_FEET = 0.3048;

/**
 * For simplified use refer to UNIT_METER_PER_FEET
 */
export const UNIT_FEET_PER_METER = 1 / UNIT_METER_PER_FEET;
