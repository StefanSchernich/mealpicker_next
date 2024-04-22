// Thise file contains helpers to deal with AWS S3 for uploading / deleting files
import axios from "axios";

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
