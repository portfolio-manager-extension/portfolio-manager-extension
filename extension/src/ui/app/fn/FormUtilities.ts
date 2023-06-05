const FormUtilities = {
  calcMaxCapitalGainsTaxFromReceived(received: number): number {
    // received amount usually ~74%, tax ~25%
    // max tax can be input when we have received = received / 74% x 25% x 150% margin
    return (received / 0.74) * 0.25 * 1.5;
  },

  calcMaxSolidarityTaxFromReceived(received: number): number {
    // received amount usually ~74%, tax ~1.5%
    // max tax can be input when we have received = received / 74% x 1.5% x 150% margin
    return (received / 0.74) * 0.015 * 1.5;
  },

  isValid(fieldRefList: UI.FieldRefList): boolean {
    let result = true;
    for (const fieldRef of fieldRefList) {
      if (fieldRef.current != null && !fieldRef.current.validate()) {
        return false;
      }
    }
    return result;
  },

  buildData(fieldRefList: UI.FieldRefList): object {
    const data = [];
    for (const fieldRef of fieldRefList) {
      if (fieldRef.current != null) {
        data.push(fieldRef.current.getNameValue());
      }
    }
    return Object.assign({}, ...data);
  },
};

export default FormUtilities;
