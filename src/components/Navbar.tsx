"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaGuitar, FaMagnifyingGlass, FaMoon } from "react-icons/fa6";

export default function Navbar() {
	const [searchTerm, setSearchTerm] = useState("");
	const router = useRouter();

	const handleSearch = (e: FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			router.push(
				`/search?search_term=${encodeURIComponent(searchTerm)}`,
			);
		}
	};

	const toggleDarkMode = () => {
		const html = document.documentElement;
		const currentTheme = html.getAttribute("data-theme");
		const newTheme = currentTheme === "dark" ? "light" : "dark";
		html.setAttribute("data-theme", newTheme);
		localStorage.setItem("dark_mode", JSON.stringify(newTheme === "dark"));
	};

	return (
		<div className="navbar bg-base-200 shadow-lg no-print">
			<div className="navbar-start">
				<Link href="/" className="btn btn-ghost text-xl font-bold">
					<FaGuitar className="text-2xl" /> Freetar NextJS
				</Link>
			</div>

			<div className="navbar-center flex-1 px-4">
				<form onSubmit={handleSearch} className="w-full max-w-xl">
					<div className="join w-full">
						<input
							required
							className="input input-bordered join-item w-full md:w-[300px] lg:w-[500px]"
							name="search_term"
							type="search"
							placeholder="Search for chords and tabs..."
							aria-label="Search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<button
							className="btn btn-primary join-item"
							type="submit"
						>
							<FaMagnifyingGlass className="text-lg" />
						</button>
					</div>
				</form>
			</div>

			<div className="navbar-end gap-2">
				<Link href="/about" className="btn btn-ghost">
					About
				</Link>
				<button
					className="btn btn-ghost btn-circle"
					onClick={toggleDarkMode}
					title="Toggle dark mode"
					aria-label="Toggle dark mode"
				>
					<FaMoon className="text-xl" />
				</button>
			</div>
		</div>
	);
}
