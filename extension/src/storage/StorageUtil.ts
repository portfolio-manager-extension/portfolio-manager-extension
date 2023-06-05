export const StorageUtil = {
  getMonth(timestamp: number): string {
    const instant = new Date(timestamp);
    const month = instant.getMonth() + 1;

    return instant.getFullYear() + "-" + (month < 10 ? "0" + month : month.toString());
  },

  getDate(timestamp: number): string {
    const instant = new Date(timestamp);
    const month = instant.getMonth() + 1;
    const date = instant.getDate();

    return (
      instant.getFullYear() +
      "-" +
      (month < 10 ? "0" + month : month.toString()) +
      "-" +
      (date < 10 ? "0" + date : date.toString())
    );
  },

  generateCountMap<T>(input: T[]): Map<T, number> {
    const map = new Map();
    input.forEach(function (item) {
      const current = map.get(item);
      if (current) {
        map.set(item, current + 1);
      } else {
        map.set(item, 1);
      }
    });
    return map;
  },
};
