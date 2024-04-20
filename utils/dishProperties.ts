// This file contains functions that help with dealing with the properties of dishes: preparing dish-property based filters for db queries, sanitizing input, and so on.

import type { FilterObj } from "@/types/types";
import { SetStateAction } from "react";

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
 * Adds a new ingredient to the end of the ingredients array in state, or adds a new ingredient after the given index if one is provided.
 *
 * @param {(prevState: SetStateAction<string[]>) => void} stateSetter - A function that sets the state of the ingredients array.
 * @param {number} [index] - The index after which to add the new ingredient.
 * @return {void} This function does not return a value.
 */
export function handleIngredientAdd(
  stateSetter: (prevState: SetStateAction<string[]>) => void,
  index?: number,
) {
  if (index === undefined) {
    stateSetter((prevState) => [...prevState, ""]);
  } else {
    stateSetter((prevState) => {
      const newSearchTerms = [...prevState];
      newSearchTerms.splice(index + 1, 0, "");
      return newSearchTerms;
    });
  }
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
