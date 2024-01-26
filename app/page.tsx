"use client";

// TODO: remove watermark??? somehow

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
	ArrowUpRight,
	ArrowUpRightFromSquareIcon,
	Download,
	LoaderIcon,
	LucideImage,
	UploadIcon,
	XIcon,
} from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";

import useDownloader from "react-use-downloader";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
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
		<main className="flex flex-col items-center justify-between space-y-8 bg-gradient-to-bl from-primary/20 to-secondary">
			<div className="p-2 h-12 w-full flex items-center justify-between shadow-sm backdrop-blur-xl bg-background/25 fixed z-50">
				<p className="font-semibold text-xl">Historicolor</p>
				<p className="text-sm text-muted-foreground">
					made by noah pittman with ♥
				</p>
			</div>

			{/* Hero */}
			<div className="p-4 w-full">
				<section className=" grid gap-2 lg:grid-flow-col min-h-[calc(100svh-3rem)] grid-flow-row lg:grid-cols-7 max-w-screen-xl mx-auto ">
					<div className="p-2 self-center space-y-4 lg:col-span-4">
						<div className="flex-col space-y-2">
							<Badge
								variant={"secondary"}
								className="rounded-xl tracking-tight font-medium"
							>
								V.1 Available Now
							</Badge>

							<p className="text-5xl lg:text-5xl font-bold ">
								Restore your history to full color
							</p>
						</div>
						<p className="max-w-prose">
							Upload your old black & white photos to breathe a new life into
							your history using AI. Available free of charge.
						</p>
						<div className="flex gap-2">
							<Button asChild>
								<Link scroll href="#upload">
									<LucideImage className="mr-2 h-4 w-4" />
									Color My Photo
								</Link>
							</Button>
							<Button variant={"ghost"} asChild>
								<Link scroll href="#upload">
									<ArrowUpRight className="mr-2 h-4 w-4" />
									Get Started
								</Link>
							</Button>
						</div>
					</div>

					<div className="p-2 place-self-center lg:col-span-3 w-full max-w-screen-sm">
						<div className="shadow-md rounded-xl overflow-hidden">
							<ReactCompareImage
								leftImage={"/albert-bw.jpeg"}
								leftImageLabel={showLabel ? "Before" : ""}
								rightImage={"/albert.png"}
								rightImageLabel={showLabel ? "After" : ""}
							/>
						</div>
					</div>
				</section>

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
		</main>
	);
}
