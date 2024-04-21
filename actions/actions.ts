"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
import axios from "axios";

/**
 * Add a new dish to the database based on the provided form data.
 *
 * @param {FormData} formData - The form data containing information about the new dish.
 * @return {object} The _id of the newly created dish if successful, otherwise an error message.
 */
export async function addDishToDb(
  formData: FormData,
): Promise<{ _id: string } | { error: any }> {
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

/**
 * Deletes a dish from the database based on the provided id.
 *
 * @param {string} id - The id of the dish to delete.
 * @return {Promise<void>} A Promise that resolves when the dish is successfully deleted.
 */
export async function deleteDishFromDb(id: string) {
  await connectToDb();
  try {
    await Recipe.findByIdAndDelete(id);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Deletes an image from AWS S3 given its URL.
 *
 * @param {string} imgUrl - The URL of the image to delete.
 * @return {Promise<void>} A Promise that resolves when the image is successfully deleted.
 */
export async function deleteImgFromAWS(imgUrl?: string) {
  if (!imgUrl) return;

  // For some reason, there are two different domains under which images are stored in AWS --> check both
  const matchResult =
    imgUrl.match(/https:\/\/mymealpicker.s3.amazonaws.com\/(.+)$/) ??
    imgUrl.match(/https:\/\/mymealpicker.s3.eu-central-1.amazonaws.com\/(.+)$/);
  const fileName = matchResult?.[1];
  if (!fileName) return;

  const client = new S3Client({
    region: "eu-central-1",
  });
  const deleteCmd = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  });

  const signedRequest = await getSignedUrl(client, deleteCmd, {
    expiresIn: 3600,
  });

  await axios.delete(signedRequest);
}

// TODO: add replace action (should only delete old img if name is different. If name is the same, aws will automatically replace the image w/o changing the name)
