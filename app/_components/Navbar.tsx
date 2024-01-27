import Image from "next/image";

const Navbar = () => {
	return (
		<div className="p-2 px-6 h-12 w-full flex items-center justify-between shadow-sm backdrop-blur-xl bg-background/25 fixed z-50">
			<div className="flex items-center gap-2">
				<Image
					width={32}
					height={32}
					className="object-cover"
					alt="logo"
					src={"/logo512.png"}
				/>
				<p className="font-semibold text-xl">Historicolor</p>
			</div>
			<p className="text-sm text-muted-foreground">
				made by noah pittman with ♥
			</p>
		</div>
	);
};

export default Navbar;
