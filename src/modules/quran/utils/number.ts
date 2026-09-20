const formatter = new Intl.NumberFormat('ar-EG', { useGrouping: false })
export function toArabicNumber(value: number) { return formatter.format(value) }
