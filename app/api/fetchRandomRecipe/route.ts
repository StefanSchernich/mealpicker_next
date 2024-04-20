import { Recipe, connectToDb } from "@/db/db";

import type { FilterObj } from "@/types/types";
import { generateFilter } from "@/utils/dishProperties";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // extract body from request formData
  const formData = await request.formData();

  // convert FormData to Object
  const filterObj: FilterObj = Object.fromEntries(formData.entries());

  /* FormData cannot have arrays as values. Multiple values may be stored under the same key, however.
  There might be several ingredients under the key "ingredients" ("ingredients" : "Kartoffel", "ingredients": "Eier" ...)
  -> if there are ingredients, make sure that *all* ingredients from FormData are included in an array. Output: "ingredients": ["Kartoffel", "Eier"...]
  */
  if (filterObj.ingredients) {
    filterObj.ingredients = formData.getAll("ingredients");
  }

  // finalize filter by adding $all to "ingredients" key and turn every ingredient from string to RegExp
  const finalizedFilter = generateFilter(filterObj);

  // make DB call
  try {
    await connectToDb();
    // run filter on dishes and select one random dish (= what "sample" does)
    const sampleAggregate = await Recipe.aggregate([
      { $match: finalizedFilter },
      { $sample: { size: 1 } },
    ]);
    const randomDish = sampleAggregate[0]; // might be null if no dish matching filter is found
    return randomDish
      ? NextResponse.json(randomDish)
      : NextResponse.json({ message: "No dish found with given filter" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error);
  }
}
