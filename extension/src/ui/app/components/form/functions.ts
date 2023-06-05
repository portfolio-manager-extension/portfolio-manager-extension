const LAYOUT_LABEL_SM_MAP: { [key: string]: number } = {
  "4-8": 4,
  "5-7": 5,
  "6-6": 6,
  "7-5": 7,
  "8-4": 8,
};
export function getLabelSmallCol(layout?: UI.InlineLayout): number {
  return LAYOUT_LABEL_SM_MAP[typeof layout == "undefined" ? "6-6" : layout];
}
