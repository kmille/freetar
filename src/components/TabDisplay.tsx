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
	FaMinus,
	FaPlus,
	FaList,
} from "react-icons/fa6";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { getSetlists, addToSetlist, type Setlist } from "@/lib/setlists";

interface TabDisplayProps {
	tab: SongDetail;
}

export default function TabDisplay({ tab }: TabDisplayProps) {
	const { user } = useAuth();
	const { toggleFavorite, isFavorite } = useFavorites();
	const [transposeValue, setTransposeValue] = useState(0);
	const [capoValue, setCapoValue] = useState(0);
	const [showChords, setShowChords] = useState(false);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollTimeout, setScrollTimeout] = useState(500);
	const [viewMode, setViewMode] = useState<"html" | "chordpro">("html");
	const [fontSize, setFontSize] = useState(14); // Default 14px (text-sm)
	const [showSetlistModal, setShowSetlistModal] = useState(false);
	const [setlists, setSetlists] = useState<Setlist[]>([]);
	const [loadingSetlists, setLoadingSetlists] = useState(false);
	const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const pausedForUserInteraction = useRef(false);

	const SCROLL_STEP_SIZE = 3;
	const SCROLL_DELAY_AFTER_USER_ACTION = 500;

	const currentPath =
		typeof window !== "undefined" ? window.location.pathname : "";
	const isCurrentFavorite = isFavorite(currentPath);

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

	const handleToggleFavorite = () => {
		toggleFavorite(currentPath, {
			artist_name: tab.artist_name,
			song: tab.song_name,
			type: tab.type,
			rating: tab.rating,
			tab_url: currentPath,
		});
	};

	const handleOpenSetlistModal = async () => {
		if (!user) {
			alert("Please sign in to use setlists");
			return;
		}

		setLoadingSetlists(true);
		setShowSetlistModal(true);
		const data = await getSetlists();
		setSetlists(data);
		setLoadingSetlists(false);
	};

	const handleAddToSetlist = async (setlistId: string) => {
		const { error } = await addToSetlist(setlistId, {
			artist_name: tab.artist_name,
			song_name: tab.song_name,
			type: tab.type,
			rating: tab.rating,
			tab_url: currentPath,
		});

		if (error) {
			alert("Failed to add to setlist. It may already be in this setlist.");
		} else {
			alert("Added to setlist!");
			setShowSetlistModal(false);
		}
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
		// Capo transposes DOWN (negative), transpose can go either way
		const effectiveTranspose = transposeValue - capoValue;

		if (viewMode === "chordpro") {
			const chordProText = convertToChordPro(tab, effectiveTranspose);
			return chordProToHtml(chordProText);
		}
		return getTransposedTab(tab.tab, effectiveTranspose);
	};

	const handleExportChordPro = () => {
		const effectiveTranspose = transposeValue - capoValue;
		exportChordProFile(tab, effectiveTranspose);
	};

	const copyChordProToClipboard = async () => {
		const effectiveTranspose = transposeValue - capoValue;
		const chordProText = convertToChordPro(tab, effectiveTranspose);
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
									onClick={handleToggleFavorite}
									title="Add/remove from favorites"
									aria-label="Toggle favorite"
								>
									{isCurrentFavorite ? (
										<FaStar className="text-yellow-500 text-xl" />
									) : (
										<FaRegStar className="text-xl" />
									)}
								</button>
								{user && (
									<button
										className="btn btn-primary btn-sm no-print gap-2"
										onClick={handleOpenSetlistModal}
										title="Add to setlist"
										aria-label="Add to setlist"
									>
										<FaList /> Add to Setlist
									</button>
								)}
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
							<span className="font-semibold">Original Capo:</span>{" "}
							{tab.capo ? `${tab.capo}th fret` : "no capo"}
						</div>
						{capoValue > 0 && (
							<div className="badge badge-lg badge-primary gap-2">
								<span className="font-semibold">Virtual Capo:</span>{" "}
								{capoValue}th fret
							</div>
						)}
						{(transposeValue !== 0 || capoValue !== 0) && (
							<div className="badge badge-lg badge-accent gap-2">
								<span className="font-semibold">Effective Transpose:</span>{" "}
								{transposeValue - capoValue > 0 ? "+" : ""}
								{transposeValue - capoValue} semitones
							</div>
						)}
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

						{/* Capo controls */}
						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									Virtual Capo
								</span>
							</label>
							<div className="flex gap-2 items-center">
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setCapoValue((prev) =>
											Math.max(0, prev - 1),
										)
									}
									title="Decrease capo position"
									disabled={capoValue === 0}
								>
									<FaMinus />
								</button>
								<span className="text-sm font-mono min-w-[3rem] text-center">
									{capoValue === 0 ? "None" : capoValue}
								</span>
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setCapoValue((prev) =>
											Math.min(12, prev + 1),
										)
									}
									title="Increase capo position"
									disabled={capoValue === 12}
								>
									<FaPlus />
								</button>
								{capoValue !== 0 && (
									<button
										className="btn btn-sm"
										onClick={() => setCapoValue(0)}
										title="Reset capo"
									>
										Reset
									</button>
								)}
							</div>
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

						{/* Font size controls */}
						<div className="form-control">
							<label className="label">
								<span className="label-text font-semibold">
									Font Size
								</span>
							</label>
							<div className="flex gap-2 items-center">
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setFontSize((prev) =>
											Math.max(10, prev - 2),
										)
									}
									title="Decrease font size"
									disabled={fontSize <= 10}
								>
									<FaMinus />
								</button>
								<span className="text-sm font-mono min-w-[3rem] text-center">
									{fontSize}px
								</span>
								<button
									className="btn btn-sm btn-circle"
									onClick={() =>
										setFontSize((prev) =>
											Math.min(24, prev + 2),
										)
									}
									title="Increase font size"
									disabled={fontSize >= 24}
								>
									<FaPlus />
								</button>
								{fontSize !== 14 && (
									<button
										className="btn btn-sm"
										onClick={() => setFontSize(14)}
										title="Reset font size"
									>
										Reset
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
						className="block font-mono text-left"
						style={{ fontSize: `${fontSize}px` }}
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

			{/* Add to Setlist Modal */}
			{showSetlistModal && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg mb-4">
							Add to Setlist
						</h3>

						{loadingSetlists ? (
							<div className="flex justify-center py-8">
								<span className="loading loading-spinner loading-lg"></span>
							</div>
						) : setlists.length === 0 ? (
							<div className="text-center py-8">
								<p className="mb-4">
									You don&apos;t have any setlists yet.
								</p>
								<Link
									href="/setlists"
									className="btn btn-primary"
									onClick={() => setShowSetlistModal(false)}
								>
									Create a Setlist
								</Link>
							</div>
						) : (
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{setlists.map((setlist) => (
									<button
										key={setlist.id}
										onClick={() =>
											handleAddToSetlist(setlist.id)
										}
										className="btn btn-outline w-full justify-start"
									>
										<FaList />
										<div className="flex-1 text-left">
											<div className="font-semibold">
												{setlist.name}
											</div>
											{setlist.description && (
												<div className="text-xs text-base-content/60">
													{setlist.description}
												</div>
											)}
										</div>
									</button>
								))}
							</div>
						)}

						<div className="modal-action">
							<button
								onClick={() => setShowSetlistModal(false)}
								className="btn"
							>
								Cancel
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => setShowSetlistModal(false)}
					></div>
				</div>
			)}
		</div>
	);
}
