// tina/handlers/s3.js
import { createMediaHandler, mediaHandlerConfig } from "next-tinacms-s3/dist/handlers";

console.log("Loading Tina S3 media handler");

export const config = mediaHandlerConfig;

const handler = createMediaHandler(
  {
    config: {
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    },
    bucket: process.env.S3_BUCKET,
    mediaRoot: "",
    authorized: async () => true,
  },
  { cdnUrl: process.env.S3_CDN_URL }
);

export default handler;


