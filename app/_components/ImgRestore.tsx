"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import ReactCompareImage from "react-compare-image";
import {
	ArrowUpRightFromSquareIcon,
	Download,
	LoaderIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import Image from "next/image";

import { useState } from "react";
import useDownloader from "react-use-downloader";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ImgRestore = () => {
	const { download } = useDownloader();

	const [restoring, setRestoring] = useState<boolean>(false);
	const [showLabel, setShowLabel] = useState<boolean>(true);
	const [file, setFile] = useState<string | null>(null);
	const [base64, setBase64] = useState<string | null | undefined>(null);
	const [restoredImage, setRestoredImage] = useState<string | null>(null);
	const [restoredBase64, setRestoredBase64] = useState<
		string | null | undefined
	>(null);

	const [error, setError] = useState<string | null>(null);
	const [predictionResponse, setPredictionResponse] = useState<any>(null);

	const handleReset = () => {
		setRestoring(false);
		setFile(null);
		setBase64(null);
		setRestoredImage(null);
		setRestoredBase64(null);
		setPredictionResponse(null);
		setError(null);
	};
	const handleCancel = async () => {
		try {
			const response = await fetch("/api/restore/" + predictionResponse.id, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error(error);
		}
	};
	const handleSubmit = async (imageUrl: string) => {
		setRestoring(true);

		const response = await fetch("/api/restore", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input_image: imageUrl,
			}),
		});
		let prediction = await response.json();
		let base = null;

		if (response.status !== 201) {
			setError("Error: " + prediction.detail);
			// setBase64(null);
			setRestoring(false);
			return;
		}
		setError(null);

		prediction = prediction.prediction;

		setPredictionResponse(prediction);

		while (
			prediction.status !== "succeeded" &&
			prediction.status !== "failed"
		) {
			await sleep(1000);

			const response = await fetch("/api/restore/" + prediction.id);

			if (response.status !== 200) {
				setError(prediction.detail);
				return;
			}

			const data = await response.json();

			prediction = data.prediction;
			if (data.base64) {
				base = data.base64;
			}
			// console.log(prediction);
			// console.log(predictionResponse?.status);

			// console.log(base);

			setPredictionResponse(prediction);
		}
		// console.log(prediction);

		if (prediction.status === "failed") {
			setError(prediction.detail);
			return;
		}
		if (prediction.status === "succeeded") {
			setRestoredImage(prediction.output);
			setRestoredBase64(base);
			setRestoring(false);
		}
	};

	return (
		<div className="p-4 w-full">
			{/* Hero */}

			{/* Upload  */}
			<div
				id="upload"
				className="flex min-h-screen flex-col items-center space-y-4 p-2 pt-16"
			>
				{/* Conditional Logic */}
				<>
					{!file && !restoredImage && (
						<>
							<p className="text-muted-foreground">
								Upload your old photos to colorize them!
							</p>
							<UploadDropzone
								appearance={{
									container: "",
									uploadIcon: "",
									label: "",
									allowedContent: "",
									button:
										"bg-black text-sm font-medium text-white rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors duration-200 ease-in-out",
								}}
								content={{
									uploadIcon: <UploadIcon />,
									label: "Click or drag to select a file",
									allowedContent:
										"Only .jpeg, .jpg, and .png are allowed (4 MB)",
									button: "Restore Image",
								}}
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									// Do something with the response
									setFile(res[0]?.url);
									setBase64(res[0]?.serverData.base64);
									handleSubmit(res[0]?.url);
								}}
								onUploadError={(error: Error) => {
									// Do something with the error.
									alert(`ERROR! ${error.message}`);
								}}
							/>
						</>
					)}

					{file && base64 && !restoring && !restoredBase64 && (
						<div className="flex flex-col gap-2">
							<div className="flex flex-col max-w-sm">
								<div className="p-2 absolute self-end">
									<Button
										size={"icon"}
										variant={"outline"}
										className="rounded-full scale-80"
										onClick={handleReset}
									>
										<XIcon className="h-5 w-5" />
									</Button>
								</div>

								<Image
									alt="Uploaded image"
									src={file}
									width={512}
									height={512}
									placeholder="blur"
									blurDataURL={`${base64}`}
									className="rounded-xl border shadow-md "
								/>
							</div>

							<div className="self-center">
								<Button onClick={() => handleSubmit(file)}>
									Restore My File
								</Button>
							</div>
						</div>
					)}

					{restoring && (
						<>
							<LoaderIcon className="h-8 w-8 animate-spin" />
							<p className="font-medium text-2xl">Restoring your image</p>
							<p className="text-muted-foreground text-center">
								This usually takes 1 to 2 minutes
								<br />
							</p>
							<div className="text-sm text-muted-foreground capitalize">
								{predictionResponse?.status == "starting" && (
									<p>Status: In Queue</p>
								)}
								{predictionResponse?.status == "processing" && (
									<p>Status: Processing</p>
								)}
							</div>
							<span className="text-xs font-bold text-muted-foreground">
								Do not refresh the page
							</span>
							<Button
								onClick={() => {
									handleReset();
									// console.log(predictionResponse);
									handleCancel();

									toast.error("Restoration cancelled");
								}}
								variant={"outline"}
							>
								Cancel
							</Button>
						</>
					)}

					{error && (
						<div className="rounded-lg shadow-md p-2 flex flex-col gap-4 justify-center items-center">
							{error}
							<Button onClick={handleReset} variant={"outline"}>
								Upload a new photo
							</Button>
						</div>
					)}

					{restoredImage && restoredBase64 && (
						<Dialog defaultOpen>
							{/* Trigger */}
							<div className="flex flex-col gap-4">
								<DialogTrigger asChild>
									<Button>View Restored Image</Button>
								</DialogTrigger>
								<div className="flex font-medium text-sm items-center max-w-[6ch] mx-auto gap-4 justify-center">
									<Separator />
									OR
									<Separator />
								</div>
								<Button onClick={handleReset} variant={"outline"}>
									Upload a new photo
								</Button>
							</div>
							{/* Modal */}
							<DialogContent
								onMouseEnter={() => setShowLabel(false)}
								onMouseLeave={() => setShowLabel(true)}
							>
								<DialogHeader>
									<DialogTitle>We&apos;ve restored your image!</DialogTitle>
									<DialogDescription>
										Click the button below to download, or share the before &
										after!
									</DialogDescription>
								</DialogHeader>

								<ReactCompareImage
									leftImage={`${restoredImage}`}
									leftImageLabel={showLabel ? "Before" : ""}
									rightImage={`${restoredImage}`}
									rightImageLabel={showLabel ? "After" : ""}
								/>
								<DialogFooter>
									<Button
										onClick={() => {
											restoredImage &&
												window.open(
													restoredImage,
													"_blank",
													"noopener noreferrer"
												);
										}}
									>
										Open Image
										<ArrowUpRightFromSquareIcon className="ml-2 h-4 w-4" />
									</Button>
									<Button
										onClick={() => {
											restoredImage &&
												download(restoredImage, "restored-image.png");
										}}
									>
										Download
										<Download className="ml-2 h-4 w-4" />
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</>
			</div>
		</div>
	);
};

export default ImgRestore;
