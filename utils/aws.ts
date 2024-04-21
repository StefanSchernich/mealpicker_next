// Thise file contains helpers to deal with AWS S3 for uploading / deleting files
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

/**
 * Retrieves a signed request from the server for uploading a file to AWS S3.
 *
 * @param {globalThis.File | null} file - The file to be uploaded
 * @return {AxiosResponse} The response containing a "data" object, which contains the signedRequest (= URL with embedded credentials) for the file upload and the URL of the uploaded file in AWS S3
 */
export async function getSignedRequest(file: globalThis.File | null) {
  if (!file) throw new Error("Keine Datei ausgewählt");
  // if no fileName is provided, generate a random file name
  const fileName = file.name || uuidv4();
  const response = await axios.get(`api/sign-s3?file-name=${fileName}`);
  return response;
}

/**
 * Uploads the image file to the URL signed by AWS.
 *
 * @param {globalThis.File} file - image file to be uploaded
 * @param {string} signedRequest - the signed URL for the file upload
 * @param {string} url - the URL of the uploaded file
 */
export async function uploadFile(
  file: globalThis.File,
  signedRequest: string,
): Promise<void> {
  await axios.put(signedRequest, file); // signedRequest is an AWS S3 URL with embedded credentials
}
