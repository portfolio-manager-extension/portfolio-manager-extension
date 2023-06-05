const ProcessorUtilities = {
  mergeOptionalLocalized<T>(
    current: Localized<T> | undefined,
    newValue: Localized<T> | undefined
  ): Localized<T> | undefined {
    if (typeof current === "undefined" && typeof newValue === "undefined") {
      return undefined;
    }

    if (typeof current === "undefined" && typeof newValue !== "undefined") {
      return newValue;
    }

    if (typeof current !== "undefined" && typeof newValue === "undefined") {
      return current;
    }
    return this.mergeLocalized(current!, newValue!);
  },

  mergeLocalized<T>(current: Localized<T>, newValue: Localized<T>): Localized<T> {
    const result = Object.assign({}, current);
    for (const name in newValue) {
      // @ts-ignore
      result[name] = newValue[name];
    }
    return result;
  },
};

export default ProcessorUtilities;
