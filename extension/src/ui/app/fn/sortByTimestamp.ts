export function sortByTimestamp<T extends Entity.ITimestamp>(input: T[], asc: boolean): T[] {
  return input.sort(function (a, b) {
    if (a.timestamp == b.timestamp) {
      return 0;
    }
    if (!asc) {
      return a.timestamp < b.timestamp ? 1 : -1;
    }
    return a.timestamp < b.timestamp ? -1 : 1;
  });
}

export function sortByTimestampAsc<T extends Entity.ITimestamp>(input: T[]): T[] {
  return input.sort(function (a, b) {
    if (a.timestamp == b.timestamp) {
      return 0;
    }
    return a.timestamp < b.timestamp ? -1 : 1;
  });
}

export function sortByTimestampDesc<T extends Entity.ITimestamp>(input: T[]): T[] {
  return input.sort(function (a, b) {
    if (a.timestamp == b.timestamp) {
      return 0;
    }
    return a.timestamp < b.timestamp ? 1 : -1;
  });
}
