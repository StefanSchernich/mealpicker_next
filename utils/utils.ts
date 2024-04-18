import type { Dish, FilterObj } from "@/types/types";

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
 * Retrieves an array of liked dishes from session storage.
 *
 * @param {string} key - The key used to store the liked dishes in session storage.
 * @return {Dish[]} An array of liked dishes. If no liked dishes are found, an empty array is returned.
 */
export function getLikedDishesFromSessionStorage(key: string): Dish[] {
  return JSON.parse(sessionStorage.getItem(key) || "[]");
}

/**
 * Toggles the presence of a dish in the list of favorite dishes.
 *
 * @param {Dish[]} favDishes - The list of favorite dishes.
 * @param {Dish} dish - The dish to toggle.
 * @return {Dish[]} The updated list of favorite dishes.
 */
export function toggleDish(favDishes: Dish[], dish: Dish) {
  if (favDishes.some((favDish) => favDish._id === dish._id)) {
    return favDishes.filter((favDish) => favDish._id !== dish._id);
  } else {
    return [...favDishes, dish];
  }
}

/**
 * Function to toggle the like status of a dish in sessionStorage
 *
 * @param {string} id - the id of the dish to toggle like status
 * @return {void}
 */
export function toggleLike(dish: Dish) {
  const likedDishes = getLikedDishesFromSessionStorage("likedDishes");
  const updatedDishes = toggleDish(likedDishes, dish);
  sessionStorage.setItem("likedDishes", JSON.stringify(updatedDishes));
  window.dispatchEvent(new Event("storage")); // manually fire "storage" event, because by default storage event is only fired when *another* tab changes storage
}

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
