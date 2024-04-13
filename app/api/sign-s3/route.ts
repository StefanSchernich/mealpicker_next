import aws from "aws-sdk";
aws.config.region = "eu-central-1";
import { NextResponse, type NextRequest } from "next/server";

// TODO: Switch to AWS SDK v3
export async function GET(req: NextRequest) {
  const s3 = new aws.S3();
  const searchParams = req.nextUrl.searchParams;
  const fileName = searchParams.get("file-name");
  const fileType = searchParams.get("file-type");
  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const signedRequest = await s3.getSignedUrlPromise("putObject", s3Params);
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
