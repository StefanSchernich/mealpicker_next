"use server";

import { connectToDb, Recipe } from "@/db/db";
import { FormDataObj } from "@/types/types";

export async function addDishToDb(formData: FormData) {
  console.log("formData IN action / run on server: ", formData);

  // Convert FormData to Object
  const formDataObj: FormDataObj = Object.fromEntries(formData.entries());

  // Overwrite ingredients key with array of ingredients (before this, there are several entries with the same key 'ingredients')
  if (formDataObj.ingredients) {
    formDataObj.ingredients = formData.getAll("ingredients");
  }

  // add recipe to db
  await connectToDb();
  await Recipe.create(formDataObj);
}
