import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, LucideImage } from "lucide-react";
import Link from "next/link";
import ReactCompareImage from "react-compare-image";

const Hero = () => {
	return (
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
					Upload your old black & white photos to breathe a new life into your
					history using AI. Available free of charge.
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
				<div className="shadow-md rounded-xl overflow-hidden ">
					<ReactCompareImage
						leftImage={"/albert-bw.jpeg"}
						rightImage={"/albert.png"}
					/>
				</div>
			</div>
		</section>
	);
};

export default Hero;
