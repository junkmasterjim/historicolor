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
	ArrowUpRightFromSquareIcon,
	Download,
	LoaderIcon,
	Share,
	UploadIcon,
	X,
	XIcon,
} from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import useDownloader from "react-use-downloader";
import { Separator } from "@/components/ui/separator";

export default function Home() {
	const { size, elapsed, percentage, download, cancel, error, isInProgress } =
		useDownloader();

	const [restoring, setRestoring] = useState<boolean>(false);
	const [showLabel, setShowLabel] = useState<boolean>(true);
	const [file, setFile] = useState<string | null>(null);
	const [base64, setBase64] = useState<string | null | undefined>(null);
	const [restoredImage, setRestoredImage] = useState<string | null>(null);
	const [restoredBase64, setRestoredBase64] = useState<
		string | null | undefined
	>(null);

	const handleRestore = async (imageUrl: string) => {
		setRestoring(true);
		try {
			const res = await fetch("/api/restore", {
				method: "POST",
				body: JSON.stringify({
					input_image: file,
				}),
			});
			const { output, base } = await res.json();
			console.log(output, base);
			setRestoredImage(output);
			setRestoredBase64(base);

			toast.success("Restored image!");
			setRestoring(false);
		} catch (error) {
			console.log(error);

			toast.error("Something went wrong!");
			setRestoring(false);
		}
	};

	return (
		<main className="flex flex-col items-center justify-between space-y-8">
			<div className="p-2 h-12 w-full flex items-center justify-between shadow-sm">
				<p className="font-semibold text-xl">Historicolor</p>
				<p className="text-sm text-muted-foreground">
					made by noah pittman with ♥
				</p>
			</div>

			<div className="flex flex-col items-center justify-between space-y-4 p-2">
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
									button: "",
								}}
								content={{
									uploadIcon: <UploadIcon />,
									label: "Click or drag to upload",
									allowedContent: "Only images are allowed (4 MB)",
									button: "Upload",
								}}
								endpoint="imageUploader"
								onClientUploadComplete={(res) => {
									// Do something with the response
									setFile(res[0]?.url);
									setBase64(res[0]?.serverData.base64);
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
										onClick={() => {
											setFile(null);
											setBase64(null);
										}}
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
								<Button onClick={() => handleRestore(file)}>
									Restore My File
								</Button>
							</div>
						</div>
					)}

					{restoring && (
						<>
							<LoaderIcon className="h-8 w-8 animate-spin" />
							<p className="font-medium text-2xl">Restoring your image</p>
							<p className="text-muted-foreground">
								This usually takes 1 to 2 minutes
							</p>
						</>
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
								<Button
									onClick={() => {
										setBase64(null);
										setFile(null);
										setRestoredImage(null);
										setRestoredBase64(null);
									}}
									variant={"outline"}
								>
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
									leftImageCss={{
										filter: "grayscale(100%)",
									}}
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
		</main>
	);
}
