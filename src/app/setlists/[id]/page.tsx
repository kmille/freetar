"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
	getSetlist,
	removeFromSetlist,
	enableSharing,
	disableSharing,
	type SetlistWithItems,
} from "@/lib/setlists";
import {
	FaArrowLeft,
	FaTrash,
	FaStar,
	FaMusic,
	FaShareNodes,
	FaEye,
	FaCopy,
	FaXmark,
} from "react-icons/fa6";

export default function SetlistDetailPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const setlistId = params?.id as string;

	const [setlist, setSetlist] = useState<SetlistWithItems | null>(null);
	const [loading, setLoading] = useState(true);
	const [sharingLoading, setSharingLoading] = useState(false);
	const [copiedLink, setCopiedLink] = useState(false);

	const loadSetlist = useCallback(async () => {
		setLoading(true);
		const data = await getSetlist(setlistId);
		setSetlist(data);
		setLoading(false);
	}, [setlistId]);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/");
		} else if (user && setlistId) {
			loadSetlist();
		}
	}, [user, authLoading, setlistId, router, loadSetlist]);

	const handleRemoveItem = async (itemId: string) => {
		if (!confirm("Remove this tab from the setlist?")) return;

		const { error } = await removeFromSetlist(itemId);
		if (!error && setlist) {
			setSetlist({
				...setlist,
				items: setlist.items.filter((item) => item.id !== itemId),
			});
		} else {
			alert("Failed to remove tab");
		}
	};

	const handleEnableSharing = async () => {
		setSharingLoading(true);
		const { token, error } = await enableSharing(setlistId);
		if (!error && token && setlist) {
			setSetlist({ ...setlist, share_token: token });
		} else {
			alert("Failed to enable sharing");
		}
		setSharingLoading(false);
	};

	const handleDisableSharing = async () => {
		if (!confirm("Disable sharing? The current link will stop working."))
			return;

		setSharingLoading(true);
		const { error } = await disableSharing(setlistId);
		if (!error && setlist) {
			setSetlist({ ...setlist, share_token: null });
		} else {
			alert("Failed to disable sharing");
		}
		setSharingLoading(false);
	};

	const handleCopyLink = async () => {
		if (!setlist?.share_token) return;

		const baseUrl =
			typeof window !== "undefined"
				? window.location.origin
				: "https://freetar.de";
		const shareUrl = `${baseUrl}/stage/${setlist.share_token}`;

		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2000);
		} catch (error) {
			console.error("Failed to copy link:", error);
			alert("Failed to copy link");
		}
	};

	if (authLoading || loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (!user || !setlist) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="card bg-base-200 shadow-lg">
					<div className="card-body text-center">
						<h2 className="text-2xl font-bold">
							Setlist Not Found
						</h2>
						<Link href="/setlists" className="btn btn-primary mx-auto">
							<FaArrowLeft /> Back to Setlists
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="card bg-base-200 shadow-lg">
				<div className="card-body">
					<div className="flex items-center gap-4 mb-2">
						<Link href="/setlists" className="btn btn-ghost btn-sm">
							<FaArrowLeft /> Back
						</Link>
						<h1 className="text-3xl font-bold">{setlist.name}</h1>
					</div>
					{setlist.description && (
						<p className="text-base-content/70">
							{setlist.description}
						</p>
					)}
					<div className="text-sm text-base-content/50">
						{setlist.items.length}{" "}
						{setlist.items.length === 1 ? "song" : "songs"}
					</div>

					{/* Sharing Controls */}
					<div className="divider"></div>
					{!setlist.share_token ? (
						<button
							onClick={handleEnableSharing}
							disabled={sharingLoading}
							className="btn btn-primary btn-sm"
						>
							{sharingLoading ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : (
								<>
									<FaShareNodes /> Enable Stage View Sharing
								</>
							)}
						</button>
					) : (
						<div className="space-y-3">
							<div className="alert alert-success">
								<div className="flex flex-col gap-2 w-full">
									<div className="flex items-center gap-2">
										<FaShareNodes className="text-lg" />
										<span className="font-semibold">
											Stage View Sharing Enabled
										</span>
									</div>
									<div className="text-sm opacity-80">
										Anyone with this link can view your
										setlist in stage view
									</div>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Link
									href={`/stage/${setlist.share_token}`}
									target="_blank"
									className="btn btn-primary btn-sm"
								>
									<FaEye /> Open Stage View
								</Link>
								<button
									onClick={handleCopyLink}
									className="btn btn-outline btn-sm"
								>
									{copiedLink ? (
										<>✓ Copied!</>
									) : (
										<>
											<FaCopy /> Copy Link
										</>
									)}
								</button>
								<button
									onClick={handleDisableSharing}
									disabled={sharingLoading}
									className="btn btn-error btn-outline btn-sm"
								>
									{sharingLoading ? (
										<span className="loading loading-spinner loading-sm"></span>
									) : (
										<>
											<FaXmark /> Disable Sharing
										</>
									)}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{setlist.items.length === 0 ? (
				<div className="card bg-base-100 shadow-lg">
					<div className="card-body text-center py-12">
						<FaMusic className="text-6xl mx-auto text-base-content/30 mb-4" />
						<h2 className="text-2xl font-bold mb-2">
							No Songs Yet
						</h2>
						<p className="text-base-content/70 mb-4">
							Browse tabs and add them to this setlist using the
							&quot;Add to Setlist&quot; button
						</p>
						<Link href="/" className="btn btn-primary mx-auto">
							Browse Tabs
						</Link>
					</div>
				</div>
			) : (
				<div className="card bg-base-100 shadow-lg">
					<div className="card-body">
						<div className="overflow-x-auto">
							<table className="table table-zebra">
								<thead>
									<tr>
										<th className="w-12">#</th>
										<th>Song</th>
										<th>Artist</th>
										<th>Type</th>
										<th>Rating</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{setlist.items.map((item, index) => (
										<tr key={item.id}>
											<td>{index + 1}</td>
											<td>
												<Link
													href={`/tab?id=${item.tab_id}`}
													className="link link-hover font-semibold"
												>
													{item.tab.song_name}
												</Link>
												{item.notes && (
													<div className="text-xs text-base-content/60 mt-1">
														{item.notes}
													</div>
												)}
											</td>
											<td>{item.tab.artist_name}</td>
											<td>
												<span className="badge badge-ghost badge-sm">
													{item.tab.type}
												</span>
											</td>
											<td>
												<div className="flex items-center gap-1">
													<FaStar className="text-yellow-500 text-sm" />
													<span className="text-sm">
														{item.tab.rating}/5
													</span>
												</div>
											</td>
											<td>
												<button
													onClick={() =>
														handleRemoveItem(item.id)
													}
													className="btn btn-ghost btn-sm text-error"
													title="Remove from setlist"
												>
													<FaTrash />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
