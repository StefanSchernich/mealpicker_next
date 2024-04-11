import type { FilterObj } from "@/types/types";

/**
 * Trims leading and trailing whitespace from each search term in the input array.
 *
 * @param {string[]} freetextSearchTerms - an array of strings to be trimmed
 * @return {string[]} an array of trimmed strings
 */
export function trimFreetextSearchTerms(freetextSearchTerms: string[]) {
  const validatedSearchTerms: string[] = [];
  freetextSearchTerms.forEach((searchTerm) => {
    if (searchTerm) {
      validatedSearchTerms.push(searchTerm.trim());
    }
  });
  return validatedSearchTerms;
}

/**
 * Checks if prop "ingredients" is present in argument obj. If so, MongoDB cmd "$all" is prepended to "ingredient" value -> modifies filter to only show
 * db entries that include *all* of the selected incredients
 * @param {Object} reqFilterObj - object containing filter parameters for db query
 * @returns modified filter obj without falsy values and with "$all" prepended in "ingredients" value
 */
export function generateFilter(reqFilterObj: FilterObj) {
  const filterObj: any = { ...reqFilterObj };

  // modify filter to only show db entries that include *all* of the selected ingredients
  if ("ingredients" in filterObj) {
    filterObj["ingredients"] = {
      $all: filterObj["ingredients"].map(
        (ingredient: string) => new RegExp(ingredient, "i"),
      ),
    };
  }
  return filterObj;
}

/**
 * Gets array from session storage (items in session storage are saved as strings) and returns it parsed as object
 * @param {string} key - key of item in session storage
 * @returns array object
 */
export function getArrayFromSessionStorage(key: string): string[] {
  return JSON.parse(sessionStorage.getItem(key) || "[]");
}

/**
 * Toggle (add if not present, remove if present) a dish in array of dishes
 * @param {Array} dishes - array of dishes
 * @param {string} id - id of dish to toggle
 * @returns updated array of dishes
 */
export function toggleDish(dishes: string[], id: string) {
  if (dishes.includes(id)) {
    return dishes.filter((dish) => dish !== id);
  } else {
    return [...dishes, id];
  }
}
