"use client";

import { SongDetail } from "@/types";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ChordDiagram from "./ChordDiagram";
import {
	convertToChordPro,
	exportChordProFile,
	chordProToHtml,
} from "@/lib/chordpro";
import {
	FaStar,
	FaArrowUpRightFromSquare,
	FaChevronLeft,
	FaChevronRight,
	FaChevronDown,
	FaChevronUp,
	FaDownload,
	FaCopy,
	FaRegStar,
} from "react-icons/fa6";

interface TabDisplayProps {
	tab: SongDetail;
}

export default function TabDisplay({ tab }: TabDisplayProps) {
	const [isFavorite, setIsFavorite] = useState(false);
	const [transposeValue, setTransposeValue] = useState(0);
	const [showChords, setShowChords] = useState(false);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollTimeout, setScrollTimeout] = useState(500);
	const [viewMode, setViewMode] = useState<"html" | "chordpro">("html");
	const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pausedForUserInteraction = useRef(false);

	const SCROLL_STEP_SIZE = 3;
	const SCROLL_DELAY_AFTER_USER_ACTION = 500;

	useEffect(() => {
		const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
		const currentPath = window.location.pathname;
		setIsFavorite(currentPath in favorites);
	}, []);

	useEffect(() => {
		const handleUserInteraction = () => {
			pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
		};

		window.addEventListener("wheel", handleUserInteraction);
		window.addEventListener("touchmove", handleUserInteraction);

		return () => {
			window.removeEventListener("wheel", handleUserInteraction);
			window.removeEventListener("touchmove", handleUserInteraction);
			if (scrollIntervalRef.current) {
				clearInterval(scrollIntervalRef.current);
			}
			if (pauseTimeoutRef.current) {
				clearTimeout(pauseTimeoutRef.current);
			}
		};
	}, []);

	const toggleFavorite = () => {
		const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
		const currentPath = window.location.pathname;

		if (currentPath in favorites) {
			delete favorites[currentPath];
			setIsFavorite(false);
		} else {
			favorites[currentPath] = {
				artist_name: tab.artist_name,
				song: tab.song_name,
				type: tab.type,
				rating: tab.rating,
				tab_url: currentPath,
			};
			setIsFavorite(true);
		}

		localStorage.setItem("favorites", JSON.stringify(favorites));
	};

	const pageScroll = () => {
		if (pausedForUserInteraction.current) return;
		window.scrollBy(0, SCROLL_STEP_SIZE);
	};

	const startScrolling = () => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
		}
		scrollIntervalRef.current = setInterval(pageScroll, scrollTimeout);
	};

	const pauseScrolling = (delay: number) => {
		pausedForUserInteraction.current = true;
		if (pauseTimeoutRef.current) {
			clearTimeout(pauseTimeoutRef.current);
		}
		pauseTimeoutRef.current = setTimeout(() => {
			pausedForUserInteraction.current = false;
		}, delay);
	};

	const stopScrolling = () => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
		}
	};

	const toggleScroll = (checked: boolean) => {
		setIsScrolling(checked);
		if (checked) {
			startScrolling();
		} else {
			stopScrolling();
		}
	};

	const adjustScrollSpeed = (increase: boolean) => {
		if (increase) {
			setScrollTimeout((prev) => Math.max(50, prev - 50));
		} else {
			setScrollTimeout((prev) => prev + 50);
		}

		if (isScrolling) {
			stopScrolling();
			setTimeout(() => startScrolling(), 100);
		}
	};

	const noteNames = [
		["A"],
		["A#", "Bb"],
		["B", "Cb"],
		["C", "B#"],
		["C#", "Db"],
		["D"],
		["D#", "Eb"],
		["E", "Fb"],
		["F", "E#"],
		["F#", "Gb"],
		["G"],
		["G#", "Ab"],
	];

	const transposeNote = (note: string, value: number): string => {
		const noteIndex = noteNames.findIndex((tone) => tone.includes(note));
		if (noteIndex === -1) {
			return note;
		}

		let newIndex = (noteIndex + value) % 12;
		if (newIndex < 0) {
			newIndex += 12;
		}

		return noteNames[newIndex][0];
	};

	const getTransposedTab = (html: string, value: number): string => {
		if (value === 0) return html;

		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		const chordElements = tempDiv.querySelectorAll(
			".chord-root, .chord-bass",
		);
		chordElements.forEach((element) => {
			const originalText = element.textContent?.trim() || "";
			element.textContent = transposeNote(originalText, value);
		});

		return tempDiv.innerHTML;
	};

	const getDisplayContent = (): string => {
		if (viewMode === "chordpro") {
			const chordProText = convertToChordPro(tab, transposeValue);
			return chordProToHtml(chordProText);
		}
		return getTransposedTab(tab.tab, transposeValue);
	};

	const handleExportChordPro = () => {
		exportChordProFile(tab, transposeValue);
	};

	const copyChordProToClipboard = async () => {
		const chordProText = convertToChordPro(tab, transposeValue);
		try {
			await navigator.clipboard.writeText(chordProText);
			alert("ChordPro format copied to clipboard!");
		} catch (err) {
			console.error("Failed to copy:", err);
			alert("Failed to copy to clipboard");
		}
	};

	return (
		<div className="w-full space-y-6">
			{/* Header section */}
			<div className="card bg-base-200 shadow-lg">
				<div className="card-body">
					<div className="flex flex-wrap justify-between items-start gap-4">
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl font-bold flex items-center gap-3 flex-wrap">
								<Link
									href={`/search?search_term=${encodeURIComponent(tab.artist_name)}`}
									className="link link-hover"
								>
									{tab.artist_name}
								</Link>
								<span className="text-base-content/60">-</span>
								<span>{tab.song_name}</span>
								<span className="text-sm font-normal text-base-content/60">
									(ver {tab.version})
								</span>
								<button
									className="btn btn-ghost btn-sm no-print"
									onClick={toggleFavorite}
									title="Add/remove from favorites"
									aria-label="Toggle favorite"
								>
									{isFavorite ? (
										<FaStar className="text-yellow-500 text-xl" />
									) : (
										<FaRegStar className="text-xl" />
									)}
								</button>
							</h1>
						</div>
						<a
							className="btn btn-outline btn-sm no-print gap-2"
							href={`${tab.tab_url}?no_redirect`}
							target="_blank"
							rel="noopener noreferrer"
						>
							View on Ultimate Guitar <FaArrowUpRightFromSquare />
						</a>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						<div className="badge badge-lg gap-2">
							<span className="font-semibold">Difficulty:</span>{" "}
							{tab.difficulty}
						</div>
						<div className="badge badge-lg gap-2">
							<span className="font-semibold">Capo:</span>{" "}
							{tab.capo ? `${tab.capo}th fret` : "no capo"}
						</div>
						{tab.tuning && (
							<div className="badge badge-lg gap-2 md:col-span-2">
								<span className="font-semibold">Tuning:</span>{" "}
								{tab.tuning}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Controls */}
			<div className="card bg-base-200 shadow-lg no-print">
				<div className="card-body">
					<div className="flex flex-wrap gap-6">
						{/* Autoscroll controls */}
						<div className="form-control">
							<label className="label cursor-pointer gap-2">
								<span className="label-text font-semibold">
									Autoscroll
								</span>
								<input
									type="checkbox"
									className="toggle toggle-primary"
									checked={isScrolling}
									onChange={(e) =>
										toggleScroll(e.target.checked)
									}
								/>
							</label>
							{isScrolling && (
								<div className="flex gap-2 mt-2">
									<button
										className="btn btn-sm btn-circle"
										onClick={() => adjustScrollSpeed(false)}
										title="Decrease scroll speed"
									>
										<FaChevronLeft />
									</button>
									<button
										className="btn btn-sm btn-circle"
										onClick={() => adjustScrollSpeed(true)}
										title="Increase scroll speed"
									>
										<FaChevronRight />
									</button>
								</div>
							)}
						</div>

						{/* Show chords toggle */}
						<div className="form-control">
							<label className="label cursor-pointer gap-2">
								<span className="label-text font-semibold">
									Show Chords
								</span>
								<input
									type="checkbox"
									className="toggle toggle-primary"
									checked={showChords}
									onChange={(e) =>
										setShowChords(e.target.checked)
									}
								/>
							</label>
						</div>

						{/* Transpose controls */}
						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									Transpose
								</span>
							</label>
							<div className="flex gap-2 items-center">
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setTransposeValue((prev) =>
											Math.max(-11, prev - 1),
										)
									}
									title="Transpose down"
								>
									<FaChevronDown />
								</button>
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setTransposeValue((prev) =>
											Math.min(11, prev + 1),
										)
									}
									title="Transpose up"
								>
									<FaChevronUp />
								</button>
								{transposeValue !== 0 && (
									<button
										className="btn btn-sm"
										onClick={() => setTransposeValue(0)}
										title="Reset transpose"
									>
										{transposeValue > 0 ? "+" : ""}
										{transposeValue}
									</button>
								)}
							</div>
						</div>
					</div>

					{/* View mode and export buttons */}
					<div className="flex flex-wrap gap-3 mt-4">
						<div className="join">
							<button
								className={`join-item btn btn-sm ${viewMode === "html" ? "btn-active" : ""}`}
								onClick={() => setViewMode("html")}
							>
								HTML View
							</button>
							<button
								className={`join-item btn btn-sm ${viewMode === "chordpro" ? "btn-active" : ""}`}
								onClick={() => setViewMode("chordpro")}
							>
								ChordPro View
							</button>
						</div>

						<button
							className="btn btn-sm btn-success gap-2"
							onClick={handleExportChordPro}
							title="Export as ChordPro file (.cho)"
						>
							<FaDownload /> Export
						</button>

						<button
							className="btn btn-sm btn-info gap-2"
							onClick={copyChordProToClipboard}
							title="Copy ChordPro format to clipboard"
						>
							<FaCopy /> Copy
						</button>
					</div>
				</div>
			</div>

			{/* Chord diagrams */}
			{showChords && Object.keys(tab.chords).length > 0 && (
				<div className="card bg-base-100 shadow-lg">
					<div className="card-body">
						<h2 className="card-title">Chord Diagrams</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
							{Object.keys(tab.chords).map((chordName) => {
								const chordVariants = tab.chords[chordName];
								const fingering =
									tab.fingers_for_strings[chordName];
								if (chordVariants.length === 0) return null;

								return (
									<ChordDiagram
										key={chordName}
										chordName={chordName}
										chordMap={chordVariants[0]}
										fingering={fingering[0]}
									/>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Tab content */}
			<div className="card bg-base-100 shadow-lg">
				<div className="card-body">
					<div
						className="tab block font-mono text-sm"
						dangerouslySetInnerHTML={{
							__html: getDisplayContent(),
						}}
					/>
				</div>
			</div>

			{/* Alternative versions */}
			{tab.alternatives && tab.alternatives.length > 0 && (
				<div className="card bg-base-200 shadow-lg no-print">
					<div className="card-body">
						<h2 className="card-title">Alternative Versions</h2>
						<div className="flex flex-col gap-2">
							{tab.alternatives.map((alt, index) => (
								<Link
									key={index}
									href={`/tab?path=${alt.tab_url.replace("/tab/", "")}`}
									className="link link-hover"
								>
									<div className="flex items-center gap-2">
										<div className="badge badge-outline">
											Version {alt.version}
										</div>
										<span className="badge badge-ghost">
											{alt.type}
										</span>
										<span className="text-sm flex items-center gap-1">
											<FaStar className="text-yellow-500" />{" "}
											{alt.rating}/5 ({alt.votes} votes)
										</span>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
