"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { type SetlistWithItems } from "@/lib/setlists";
import {
	FaChevronLeft,
	FaChevronRight,
	FaListUl,
	FaXmark,
	FaSliders,
	FaMinus,
	FaPlus,
} from "react-icons/fa6";

export default function StageViewPage() {
	const params = useParams();
	const token = params?.token as string;

	const [setlist, setSetlist] = useState<SetlistWithItems | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [showSongList, setShowSongList] = useState(false);
	const [transposeValue, setTransposeValue] = useState(0);
	const [capoValue, setCapoValue] = useState(0);
	const [showControls, setShowControls] = useState(false);
	const [fontSize, setFontSize] = useState(16); // Default 16px for stage view

	// Fetch setlist by share token
	useEffect(() => {
		if (!token) return;

		const fetchSetlist = async () => {
			setLoading(true);
			try {
				const response = await fetch(
					`/api/setlist-by-token?token=${token}`,
				);
				if (response.ok) {
					const data = await response.json();
					console.log("Setlist data:", data);
					console.log(
						"First song tab content length:",
						data.items[0]?.tab?.tab?.length || 0,
					);
					setSetlist(data);
				} else {
					console.error("Failed to fetch setlist");
				}
			} catch (error) {
				console.error("Error fetching setlist:", error);
			}
			setLoading(false);
		};

		fetchSetlist();
	}, [token]);

	// Load saved transpose/capo settings when song changes
	useEffect(() => {
		if (setlist && setlist.items[currentIndex]) {
			const currentSong = setlist.items[currentIndex];
			setTransposeValue(currentSong.transpose || 0);
			setCapoValue(currentSong.capo || 0);
		}
	}, [currentIndex, setlist]);

	// Transpose functions
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

	// Navigation functions
	const goToNext = useCallback(() => {
		if (!setlist || currentIndex >= setlist.items.length - 1) return;
		setCurrentIndex((prev) => prev + 1);
	}, [setlist, currentIndex]);

	const goToPrevious = useCallback(() => {
		if (currentIndex <= 0) return;
		setCurrentIndex((prev) => prev - 1);
	}, [currentIndex]);

	const goToSong = useCallback((index: number) => {
		setCurrentIndex(index);
		setShowSongList(false);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				goToNext();
			} else if (e.key === "ArrowLeft") {
				goToPrevious();
			} else if (e.key === "Escape") {
				setShowSongList(false);
				setShowControls(false);
			} else if (e.key === "l" || e.key === "L") {
				setShowSongList((prev) => !prev);
			} else if (e.key === "c" || e.key === "C") {
				setShowControls((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToNext, goToPrevious]);

	// Touch/swipe gestures
	useEffect(() => {
		let touchStartX = 0;
		let touchEndX = 0;

		const handleTouchStart = (e: TouchEvent) => {
			touchStartX = e.changedTouches[0].screenX;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			touchEndX = e.changedTouches[0].screenX;
			handleSwipe();
		};

		const handleSwipe = () => {
			const swipeThreshold = 50;
			if (touchStartX - touchEndX > swipeThreshold) {
				// Swipe left - next song
				goToNext();
			} else if (touchEndX - touchStartX > swipeThreshold) {
				// Swipe right - previous song
				goToPrevious();
			}
		};

		window.addEventListener("touchstart", handleTouchStart);
		window.addEventListener("touchend", handleTouchEnd);

		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [goToNext, goToPrevious]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-base-200">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (!setlist || setlist.items.length === 0) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-base-200">
				<div className="card bg-base-100 shadow-lg max-w-md">
					<div className="card-body text-center">
						<h2 className="text-2xl font-bold">
							Setlist Not Found
						</h2>
						<p className="text-base-content/70">
							This setlist link is invalid or has been disabled.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const currentSong = setlist.items[currentIndex];

	return (
		<div className="min-h-screen bg-base-200 relative">
			{/* Header */}
			<div className="bg-base-100 shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-10">
				<div className="flex-1">
					<h1 className="text-xl font-bold truncate">
						{setlist.name}
					</h1>
					<p className="text-sm text-base-content/60">
						{currentIndex + 1} of {setlist.items.length}:{" "}
						{currentSong.tab.song_name} -{" "}
						{currentSong.tab.artist_name}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setShowControls((prev) => !prev)}
						className="btn btn-ghost btn-sm"
						title="Show controls (C)"
					>
						<FaSliders className="text-lg" />
					</button>
					<button
						onClick={() => setShowSongList(true)}
						className="btn btn-ghost btn-sm"
						title="Show song list (L)"
					>
						<FaListUl className="text-lg" />
					</button>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="container mx-auto px-4 py-6 max-w-5xl">
				{/* Tab Content */}
				<div className="card bg-base-100 shadow-lg">
					<div className="card-body">
						{/* Song Info */}
						<div className="mb-4">
							<h2 className="text-2xl font-bold">
								{currentSong.tab.song_name}
							</h2>
							<p className="text-lg text-base-content/70">
								{currentSong.tab.artist_name}
							</p>
							<div className="flex gap-3 mt-2 text-sm text-base-content/60">
								{currentSong.tab.capo && (
									<span>Capo: {currentSong.tab.capo}</span>
								)}
								{currentSong.tab.tuning && (
									<span>Tuning: {currentSong.tab.tuning}</span>
								)}
								{currentSong.tab.difficulty && (
									<span>
										Difficulty: {currentSong.tab.difficulty}
									</span>
								)}
							</div>
							{currentSong.notes && (
								<div className="alert alert-info mt-3">
									<div>
										<div className="font-semibold">
											Notes:
										</div>
										<div className="text-sm">
											{currentSong.notes}
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Transpose/Capo/Font Controls */}
						{showControls && (
							<div className="bg-base-200 rounded-lg p-4 mb-4">
								<h3 className="font-semibold mb-3">
									Playback Settings
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Transpose */}
									<div>
										<label className="label">
											<span className="label-text font-medium">
												Transpose
											</span>
											<span className="label-text-alt">
												{transposeValue > 0 ? "+" : ""}
												{transposeValue}
											</span>
										</label>
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													setTransposeValue((prev) =>
														Math.max(prev - 1, -12),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={transposeValue <= -12}
											>
												<FaMinus />
											</button>
											<input
												type="range"
												min="-12"
												max="12"
												value={transposeValue}
												onChange={(e) =>
													setTransposeValue(
														parseInt(e.target.value),
													)
												}
												className="range range-sm flex-1"
											/>
											<button
												onClick={() =>
													setTransposeValue((prev) =>
														Math.min(prev + 1, 12),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={transposeValue >= 12}
											>
												<FaPlus />
											</button>
										</div>
									</div>

									{/* Capo */}
									<div>
										<label className="label">
											<span className="label-text font-medium">
												Virtual Capo
											</span>
											<span className="label-text-alt">
												Fret {capoValue}
											</span>
										</label>
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													setCapoValue((prev) =>
														Math.max(prev - 1, 0),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={capoValue <= 0}
											>
												<FaMinus />
											</button>
											<input
												type="range"
												min="0"
												max="12"
												value={capoValue}
												onChange={(e) =>
													setCapoValue(
														parseInt(e.target.value),
													)
												}
												className="range range-sm flex-1"
											/>
											<button
												onClick={() =>
													setCapoValue((prev) =>
														Math.min(prev + 1, 12),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={capoValue >= 12}
											>
												<FaPlus />
											</button>
										</div>
									</div>

									{/* Font Size */}
									<div>
										<label className="label">
											<span className="label-text font-medium">
												Font Size
											</span>
											<span className="label-text-alt">
												{fontSize}px
											</span>
										</label>
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													setFontSize((prev) =>
														Math.max(prev - 2, 10),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={fontSize <= 10}
											>
												<FaMinus />
											</button>
											<input
												type="range"
												min="10"
												max="28"
												step="2"
												value={fontSize}
												onChange={(e) =>
													setFontSize(
														parseInt(e.target.value),
													)
												}
												className="range range-sm flex-1"
											/>
											<button
												onClick={() =>
													setFontSize((prev) =>
														Math.min(prev + 2, 28),
													)
												}
												className="btn btn-sm btn-circle"
												disabled={fontSize >= 28}
											>
												<FaPlus />
											</button>
										</div>
									</div>
								</div>

								{/* Original Tab Info */}
								{currentSong.tab.capo && (
									<div className="text-xs text-base-content/60 mt-3">
										Original tab capo: Fret{" "}
										{currentSong.tab.capo}
									</div>
								)}
							</div>
						)}

						{/* Tab Content */}
						{currentSong.tab.tab ? (
							<div
								className="whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto"
								style={{ fontSize: `${fontSize}px` }}
								dangerouslySetInnerHTML={{
									__html: getTransposedTab(
										currentSong.tab.tab,
										transposeValue - capoValue,
									),
								}}
							/>
						) : (
							<div className="alert alert-warning">
								<div>
									<div className="font-semibold">
										No tab content available
									</div>
									<div className="text-sm">
										This tab may have been added before the
										content was saved to the database.
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between items-center mt-6 gap-4">
					<button
						onClick={goToPrevious}
						disabled={currentIndex === 0}
						className="btn btn-lg btn-primary"
					>
						<FaChevronLeft /> Previous
					</button>

					<div className="text-center text-base-content/60">
						Song {currentIndex + 1} of {setlist.items.length}
					</div>

					<button
						onClick={goToNext}
						disabled={currentIndex === setlist.items.length - 1}
						className="btn btn-lg btn-primary"
					>
						Next <FaChevronRight />
					</button>
				</div>

				{/* Keyboard Shortcuts Help */}
				<div className="text-center text-sm text-base-content/50 mt-4">
					Use arrow keys or swipe to navigate • Press L for song list
					• Press C for controls
				</div>
			</div>

			{/* Song List Overlay */}
			{showSongList && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
						{/* Overlay Header */}
						<div className="flex items-center justify-between p-4 border-b border-base-300">
							<h3 className="text-xl font-bold">
								{setlist.name} - Songs
							</h3>
							<button
								onClick={() => setShowSongList(false)}
								className="btn btn-ghost btn-sm btn-circle"
							>
								<FaXmark className="text-lg" />
							</button>
						</div>

						{/* Song List */}
						<div className="overflow-y-auto flex-1 p-4">
							<div className="space-y-2">
								{setlist.items.map((item, index) => (
									<button
										key={item.id}
										onClick={() => goToSong(index)}
										className={`w-full text-left p-3 rounded-lg transition-colors ${
											index === currentIndex
												? "bg-primary text-primary-content"
												: "bg-base-200 hover:bg-base-300"
										}`}
									>
										<div className="flex items-start gap-3">
											<span className="font-bold text-lg">
												{index + 1}.
											</span>
											<div className="flex-1">
												<div className="font-semibold">
													{item.tab.song_name}
												</div>
												<div className="text-sm opacity-80">
													{item.tab.artist_name}
												</div>
												{item.notes && (
													<div className="text-xs mt-1 opacity-70">
														{item.notes}
													</div>
												)}
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
