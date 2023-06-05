const DataUtilities = {
  calculateAverage(input: number[]): number {
    let total = 0;
    for (const item of input) {
      total += item;
    }
    return total / input.length;
  },

  calculateMedian(input: number[]): number {
    const sorted = input
      .map((item) => item)
      .sort(function (a, b) {
        if (a == b) return 0;
        return a < b ? -1 : 1;
      });

    if (sorted.length % 2 == 0) {
      const position = Math.floor(sorted.length / 2);
      return (sorted[position] + sorted[position + 1]) / 2;
    }
    const position = Math.ceil(sorted.length / 2);
    return sorted[position];
  },
};
export default DataUtilities;
