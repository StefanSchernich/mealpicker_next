import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const client = new S3Client({
  region: "eu-central-1",
});
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fileName = searchParams.get("file-name");
  const putCmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName!,
    ACL: "public-read",
  });

  try {
    const signedRequest = await getSignedUrl(client, putCmd, {
      expiresIn: 3600,
    });
    const returnData = {
      signedRequest,
      uploadedImgUrlInAWS: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`,
    };

    return NextResponse.json(returnData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error while uploading image to AWS" },
      { status: 500 },
    );
  }
}
