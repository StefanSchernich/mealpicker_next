"use server";

type NewDish = {
  title: string;
  imgUrl?: string;
  category: string;
  calories: string;
  difficulty: string;
  ingredients?: string[];
  _id: string;
  __v: number;
};

import { connectToDb, Recipe } from "@/db/db";
import { FormDataObj } from "@/types/types";

/**
 * Add a new dish to the database based on the provided form data.
 *
 * @param {FormData} formData - The form data containing information about the new dish.
 * @return {object} The _id of the newly created dish if successful, otherwise an error message.
 */
export async function addDishToDb(formData: FormData) {
  // console.log("formData IN action / run on server: ", formData); TODO: remove console.log once development is completed

  // Convert FormData to Object
  const formDataObj: FormDataObj = Object.fromEntries(formData.entries());

  // Overwrite ingredients key with array of ingredients (before this, there are several entries with the same key 'ingredients')
  if (formDataObj.ingredients) {
    formDataObj.ingredients = formData.getAll("ingredients");
  }

  // add recipe to db
  try {
    await connectToDb();
    const newDish = (await Recipe.create(formDataObj)) as NewDish;
    const result = {
      _id: newDish._id.toString(), // Adding toString should not be necessary since _id is already string. But Next complains otherwise ("not plain object sent from server to client component")
    };
    return result; // if adding is successful, send back the _id of newDish as result
  } catch (error: any) {
    return { error: error.message.toString() };
  }
}
