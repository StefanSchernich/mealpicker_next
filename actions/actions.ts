"use server";

type DishDocumentInDb = {
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
export async function addDishToDb(
  formData: FormData,
): Promise<{ _id: string } | { error: any }> {
  // console.log("formData IN action / run on server: ", formData); TODO: remove console.log once development is completed

  // Convert FormData to Object
  const formDataObj: FormDataObj = Object.fromEntries(formData.entries());

  // Overwrite ingredients key with array of ingredients (before this, formData contains several entries with the same key 'ingredients')
  if (formDataObj.ingredients) {
    formDataObj.ingredients = formData.getAll("ingredients");
  }

  // add recipe to db
  try {
    await connectToDb();
    const newDish = (await Recipe.create(formDataObj)) as DishDocumentInDb;
    const result = {
      // Server Actions can only return plain objects.Adding toString should not be necessary since _id is already a string. But Next complains otherwise ("not plain object sent from server to client component")
      _id: newDish._id.toString(),
    };
    return result; // if adding is successful, send back the _id of newDish as result
  } catch (error: any) {
    return { error: error.message.toString() };
  }
}

/**
 * Edit a dish in the database based on the provided form data.
 *
 * @param {FormData} formData - The form data containing information about the dish to be edited.
 * @return {object} The _id of the edited dish if successful, otherwise an error message.
 */
export async function editDishInDb(formData: FormData) {
  // get id of dish
  const id = formData.get("id");

  // Convert FormData to Object
  const formDataObj: FormDataObj = Object.fromEntries(formData.entries());

  // Overwrite ingredients key with array of ingredients (before this, formData contains several entries with the same key 'ingredients')
  if (formDataObj.ingredients) {
    formDataObj.ingredients = formData.getAll("ingredients");
  }

  // add recipe to db
  try {
    await connectToDb();
    const editedDish = (await Recipe.findByIdAndUpdate(id, formDataObj, {
      returnDocument: "after",
    })) as DishDocumentInDb;
    const result = {
      // Server Actions can only return plain objects.Adding toString should not be necessary since _id is already a string. But Next complains otherwise ("not plain object sent from server to client component")
      _id: editedDish._id.toString(),
    };
    return result; // if editing is successful, send back the _id of editedDish as result
  } catch (error: any) {
    return { error: error.message.toString() };
  }
}
