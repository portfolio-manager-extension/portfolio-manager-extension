export function getCountString(value: number, empty: string, singular: string, plural: string): string {
  if (value == 0) {
    return empty;
  }
  if (value < -1 || value > 1) {
    return plural.replace("[count]", value.toString());
  }
  return singular.replace("[count]", value.toString());
}
