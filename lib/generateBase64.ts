import { getPlaiceholder } from "plaiceholder";

export const generateBase64 = async (imageUrl: string) => {
	try {
		const src = imageUrl;

		const buffer = await fetch(src).then(async (res) =>
			Buffer.from(await res.arrayBuffer())
		);

		const { base64 } = await getPlaiceholder(buffer);
		return base64;
	} catch (err) {
		console.log(err);
	}
};
