/**
 * ru-RU number formatting — thin-space thousands, comma decimals,
 * proper minus sign. Single source so every counter formats identically.
 */
const cache = new Map<number, Intl.NumberFormat>();

export function ruNumber(decimals = 0): Intl.NumberFormat {
  let fmt = cache.get(decimals);
  if (!fmt) {
    fmt = new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    cache.set(decimals, fmt);
  }
  return fmt;
}

export function formatRu(value: number, decimals = 0): string {
  return ruNumber(decimals).format(value);
}
