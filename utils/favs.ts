// This file contains helpers to deal with the list of favorite dishes like mgmt of favorite dishes in sessionStorage.

import type { Dish } from "@/types/types";

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
