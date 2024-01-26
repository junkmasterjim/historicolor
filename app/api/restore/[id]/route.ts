import { generateBase64 } from "@/lib/generateBase64";
import Replicate from "replicate";

interface ExtendedResponse extends ResponseInit {
	base?: string;
}

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const prediction = await replicate.predictions.get(params.id);

	if (prediction?.error) {
		return new Response(JSON.stringify({ detail: prediction.error.detail }), {
			status: 500,
		});
	}

	// console.log("prediction:::", prediction);

	const base64 = await generateBase64(`${prediction?.output}`);

	const data = {
		prediction,
		base64,
	};

	return new Response(JSON.stringify(data), {
		status: 200,
	});
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const prediction = await replicate.predictions.cancel(params.id);

	if (prediction?.error) {
		return new Response(JSON.stringify({ detail: prediction.error.detail }), {
			status: 500,
		});
	}

	return new Response(JSON.stringify({ prediction }), {
		status: 200,
	});
}
