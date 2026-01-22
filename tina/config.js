import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
const mediaApiUrl = process.env.TINA_MEDIA_API_URL;

export default defineConfig({
  branch,
  clientId: "b029955e-b004-4164-94dc-6e9f09fb7387", // Get this from tina.io
  token: "13b494feaa2388f3d9b172ab60d24a22504d7cef", // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },

  media: {
    // Configure S3 media store with CloudFront CDN
    // Media will be served through your CloudFront distribution: https://d3aq6i4c4ifngz.cloudfront.net
    // Ensure your Tina Cloud project has S3 and CloudFront configured in the dashboard
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-s3");

      if (!mediaApiUrl) {
        return pack.TinaCloudS3MediaStore;
      }

      return class CustomS3Store extends pack.TinaCloudS3MediaStore {
        constructor(client) {
          super(client);
          const base = mediaApiUrl.endsWith("/")
            ? mediaApiUrl
            : `${mediaApiUrl}/`;

          this.fetchFunction = async (input, init) => {
            const requestedPath = input.toString();
            const url = new URL(requestedPath, base);
            const query = `${url.search ? "&" : "?"}clientID=${client.clientId}`;
            return client.authProvider.fetchWithToken(
              `${url.toString()}${query}`,
              init
            );
          };
        }
      };
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "_posts",
        ui: {
          filename: {
            slugify: (values) => {
              const postDate = values.time ? new Date(values.time) : new Date();
              return `${postDate.toISOString().split("T")[0]}-${"episode"}-${(
                values.episode || ""
              )
                .toLowerCase()
                .replace(/ /g, "-")}`.replace(/[^\w./-\s]/gi, "");
            },
          },
        },

        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "layout",
            label: "Layout",
            required: true,
          },
          {
            type: "string",
            name: "episode",
            label: "Episode",
          },
          {
            type: "string",
            name: "file",
            label: "Audio URL",
          },
          {
            label: "Date",
            name: "time",
            type: "datetime",
          },
          {
            type: "image",
            name: "cover",
            label: "Thumbnail",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },

  search: {
    tina: {
      indexerToken: "bcd44eb9832f26ab9d3d17b1c39e7c55159ccfa8",
      stopwordLanguages: ["eng"],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
  //.. Other config
});


