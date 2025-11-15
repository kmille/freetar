"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const { signInWithEmail } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		const { error } = await signInWithEmail(email);

		if (error) {
			setMessage({
				type: "error",
				text: error.message || "Failed to send magic link",
			});
			setLoading(false);
		} else {
			setMessage({
				type: "success",
				text: "Check your email for the magic link!",
			});
			setLoading(false);
			setEmail("");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<h3 className="font-bold text-lg mb-4">Sign In to Freetar</h3>
				<p className="text-sm text-base-content/70 mb-4">
					Enter your email to receive a magic link for passwordless
					sign-in. Your favorites and setlists will be synced across
					devices.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">Email address</span>
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="input input-bordered w-full"
							placeholder="you@example.com"
							required
							disabled={loading}
						/>
					</div>

					{message && (
						<div
							className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
						>
							<span>{message.text}</span>
						</div>
					)}

					<div className="modal-action">
						<button
							type="button"
							onClick={onClose}
							className="btn"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Sending...
								</>
							) : (
								"Send Magic Link"
							)}
						</button>
					</div>
				</form>

				<div className="mt-4 text-xs text-base-content/50">
					<p>
						No password required. We&apos;ll send you a secure link
						to sign in instantly.
					</p>
				</div>
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</div>
	);
}
