/**
 * - Convert nautical miles to meter: x * UNIT_METER_PER_NM
 * - Convert meter to nautical miles: x / UNIT_METER_PER_NM
 */
export const UNIT_METER_PER_NM = 1852;

/**
 * - Convert statute miles to meter: x * UNIT_METER_PER_SM
 * - Convert meter to statute miles: x / UNIT_METER_PER_SM
 */
export const UNIT_METER_PER_SM = 1609.344;

/**
 * - Convert yard to meter: x * UNIT_METER_PER_YARD
 * - Convert meter to yard: x / UNIT_METER_PER_YARD
 */
export const UNIT_METER_PER_YARD = 0.9144;

/**
 * - Convert feet to meter: x * UNIT_METER_PER_FEET
 * - Convert meter to feet: x / UNIT_METER_PER_FEET
 *
 * 3 feet are excatly 1 yard
 */
export const UNIT_METER_PER_FEET = 0.3048;
