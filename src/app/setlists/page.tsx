"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	getSetlists,
	createSetlist,
	deleteSetlist,
	type Setlist,
} from "@/lib/setlists";
import { FaPlus, FaTrash, FaMusic, FaArrowLeft } from "react-icons/fa6";

export default function SetlistsPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [setlists, setSetlists] = useState<Setlist[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newSetlistName, setNewSetlistName] = useState("");
	const [newSetlistDescription, setNewSetlistDescription] = useState("");
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/");
		} else if (user) {
			loadSetlists();
		}
	}, [user, authLoading, router]);

	const loadSetlists = async () => {
		setLoading(true);
		const data = await getSetlists();
		setSetlists(data);
		setLoading(false);
	};

	const handleCreateSetlist = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreating(true);

		const { data, error } = await createSetlist(
			newSetlistName,
			newSetlistDescription,
		);

		if (!error && data) {
			setSetlists([data, ...setlists]);
			setShowCreateModal(false);
			setNewSetlistName("");
			setNewSetlistDescription("");
		} else {
			alert("Failed to create setlist");
		}

		setCreating(false);
	};

	const handleDeleteSetlist = async (setlistId: string) => {
		if (
			!confirm("Are you sure you want to delete this setlist?")
		)
			return;

		const { error } = await deleteSetlist(setlistId);
		if (!error) {
			setSetlists(setlists.filter((s) => s.id !== setlistId));
		} else {
			alert("Failed to delete setlist");
		}
	};

	if (authLoading || (loading && !user)) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="card bg-base-200 shadow-lg">
				<div className="card-body">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/" className="btn btn-ghost btn-sm">
								<FaArrowLeft /> Back
							</Link>
							<h1 className="text-3xl font-bold">My Setlists</h1>
						</div>
						<button
							onClick={() => setShowCreateModal(true)}
							className="btn btn-primary gap-2"
						>
							<FaPlus /> New Setlist
						</button>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-12">
					<span className="loading loading-spinner loading-lg"></span>
				</div>
			) : setlists.length === 0 ? (
				<div className="card bg-base-100 shadow-lg">
					<div className="card-body text-center py-12">
						<FaMusic className="text-6xl mx-auto text-base-content/30 mb-4" />
						<h2 className="text-2xl font-bold mb-2">
							No Setlists Yet
						</h2>
						<p className="text-base-content/70 mb-4">
							Create your first setlist to organize tabs for your
							performances
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="btn btn-primary mx-auto gap-2"
						>
							<FaPlus /> Create Your First Setlist
						</button>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{setlists.map((setlist) => (
						<div key={setlist.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
							<div className="card-body">
								<h2 className="card-title">{setlist.name}</h2>
								{setlist.description && (
									<p className="text-sm text-base-content/70">
										{setlist.description}
									</p>
								)}
								<div className="text-xs text-base-content/50">
									Updated:{" "}
									{new Date(
										setlist.updated_at,
									).toLocaleDateString()}
								</div>
								<div className="card-actions justify-end mt-4">
									<button
										onClick={() =>
											handleDeleteSetlist(setlist.id)
										}
										className="btn btn-ghost btn-sm text-error"
									>
										<FaTrash />
									</button>
									<Link
										href={`/setlists/${setlist.id}`}
										className="btn btn-primary btn-sm"
									>
										View
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Setlist Modal */}
			{showCreateModal && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg mb-4">
							Create New Setlist
						</h3>
						<form onSubmit={handleCreateSetlist} className="space-y-4">
							<div className="form-control">
								<label className="label">
									<span className="label-text">
										Setlist Name
									</span>
								</label>
								<input
									type="text"
									value={newSetlistName}
									onChange={(e) =>
										setNewSetlistName(e.target.value)
									}
									className="input input-bordered w-full"
									placeholder="e.g., Sunday Gig, Wedding Set"
									required
									disabled={creating}
								/>
							</div>

							<div className="form-control">
								<label className="label">
									<span className="label-text">
										Description (optional)
									</span>
								</label>
								<textarea
									value={newSetlistDescription}
									onChange={(e) =>
										setNewSetlistDescription(e.target.value)
									}
									className="textarea textarea-bordered w-full"
									placeholder="Add notes about this setlist..."
									rows={3}
									disabled={creating}
								/>
							</div>

							<div className="modal-action">
								<button
									type="button"
									onClick={() => {
										setShowCreateModal(false);
										setNewSetlistName("");
										setNewSetlistDescription("");
									}}
									className="btn"
									disabled={creating}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={creating}
								>
									{creating ? (
										<>
											<span className="loading loading-spinner loading-sm"></span>
											Creating...
										</>
									) : (
										"Create"
									)}
								</button>
							</div>
						</form>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => {
							if (!creating) {
								setShowCreateModal(false);
								setNewSetlistName("");
								setNewSetlistDescription("");
							}
						}}
					></div>
				</div>
			)}
		</div>
	);
}
