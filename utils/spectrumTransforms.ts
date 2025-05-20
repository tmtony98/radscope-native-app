/**
 * Spectrum data transformation utilities
 */

const EPSILON = 0.0001; // Small constant for log scale zero handling

export type ScaleType = 'linear' | 'logarithmic' | 'square-root';

/**
 * Transform spectrum data based on selected scale type
 */
export const transformSpectrumData = (
  data: number[],
  scaleType: ScaleType
): { x: number; y: number }[] => {
  return data.map((value, index) => ({
    x: index,
    y: transformValue(value, scaleType),
  }));
};

/**
 * Transform a single value based on scale type
 */
export const transformValue = (value: number, scaleType: ScaleType): number => {
  switch (scaleType) {
    case 'logarithmic':
      return value <= 0 ? Math.log10(EPSILON) : Math.log10(value + EPSILON);
    
    case 'square-root':
      return value <= 1 ? 0 : Math.sqrt(value);
    
    case 'linear':
    default:
      return value;
  }
};