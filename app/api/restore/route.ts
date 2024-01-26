import Replicate from "replicate";
import { generateBase64 } from "@/lib/generateBase64";

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
});

export const POST = async (req: Request) => {
	try {
		const { input_image } = await req.json();

		if (!process.env.REPLICATE_API_TOKEN) {
			throw new Error(
				"The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
			);
		}

		//
		//
		// 500 error HAPPENING here when I try to create a prediction
		// confirmed using console.log to see if it gets to the next line
		//
		console.log(
			"beginning prediction ::::::::::::::::::::::::::::::::::::::::::::::::"
		);

		const prediction = await replicate.predictions.create({
			version:
				"0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950",
			input: {
				input_image: input_image,
				model_name: "Stable",
				render_factor: 35,
			},
		});

		console.log("prediction:::", prediction);

		if (prediction?.error) {
			return new Response(JSON.stringify({ detail: prediction.error.detail }), {
				status: 500,
			});
		}

		const base64 = await generateBase64(`${prediction?.output}`);
		console.log("base64:::", base64);

		return new Response(JSON.stringify({ prediction, base64 }), {
			status: 201,
			statusText: "Created",
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error: any) {
		console.log("error:::::::::", error);

		return new Response(JSON.stringify({ error }), {
			status: 500,
			statusText: "Internal Server Error in api/restore/route.ts",
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
