import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createMediaHandler } from "next-tinacms-s3/dist/handlers";

dotenv.config();

const requiredEnv = ["S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const mediaHandler = createMediaHandler(
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
  {
    cdnUrl: process.env.S3_CDN_URL,
  }
);

const app = express();
app.use(cors());

app.use("/api/s3/media", (req, res) => {
  if (req.path && req.path !== "/") {
    const slug = req.path.replace(/^\/+/, "");
    if (slug.length) {
      req.query.media = ["media", decodeURIComponent(slug)];
    }
  }
  mediaHandler(req, res);
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Tina media API ready on http://localhost:${port}/api/s3/media`);
});


