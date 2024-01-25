import { createUploadthing, type FileRouter } from "uploadthing/next";

import { generateBase64 } from "@/lib/generateBase64";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	imageUploader: f({ image: { maxFileSize: "4MB" } })
		// Set permissions and file types for this FileRoute

		.middleware(async ({ req }) => {
			// This code runs on your server before upload
			const user = await auth(req);

			// If you throw, the user will not be able to upload
			if (!user) throw new Error("Unauthorized");

			// Whatever is returned here is accessible in onUploadComplete as `metadata`
			return { userId: user.id };
		})

		.onUploadComplete(async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
			// console.log("Upload complete for userId:", metadata.userId);
			// console.log("file url", file.url);
			// console.log("base64", base64);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			const base64 = await generateBase64(file.url);
			return { uploadedBy: metadata.userId, base64 };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
