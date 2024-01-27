"use client";

// TODO: remove watermark??? somehow

import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import ImgRestore from "./_components/ImgRestore";

export default function Home() {
	return (
		<main className="flex flex-col items-center justify-between space-y-8 bg-gradient-to-bl from-primary/20 to-secondary">
			<Navbar />
			<Hero />
			<ImgRestore />
		</main>
	);
}
