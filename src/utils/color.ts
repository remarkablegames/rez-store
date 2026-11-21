/**
 * Generate CSS-compatible rgba string.
 */
export function rgba(
  red: number,
  green: number,
  blue: number,
  alpha: number,
): string {
  return `rgba(${[red, green, blue, alpha].join(',')})`;
}
