import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { generateBase64 } from "@/lib/generateBase64";

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
});

export const POST = async (req: NextRequest, res: NextResponse) => {
	try {
		const { input_image } = await req.json();
		const output = await replicate.run(
			"arielreplicate/deoldify_image:0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950",
			{
				input: {
					input_image: input_image,
					model_name: "Stable",
					render_factor: 30,
				},
			}
		);
		const base64 = await generateBase64(`${output}`);
		return NextResponse.json({ output: output, base: base64 });
	} catch (error) {
		return NextResponse.json({ error: error });
	}
};
