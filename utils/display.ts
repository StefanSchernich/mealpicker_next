// This file contains functions that help with displaying data.

/**
 * Pick correct symbol for categories
 *
 * @param {string} value - the value to match for symbol
 * @param {[{ id: number; value: string; icon: string }]} options - the array of options to search through
 * @return {string} the icon symbol corresponding to the value
 */
export function getIcon(
  value: string,
  options: { id: number; value: string; icon: string }[],
) {
  const option = options.find((option) => option.value === value);
  if (!option) {
    return "";
  }
  return option.icon;
}
