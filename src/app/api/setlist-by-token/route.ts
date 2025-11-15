import { NextRequest, NextResponse } from "next/server";
import { getSetlistByShareToken } from "@/lib/setlists";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json(
			{ error: "Share token is required" },
			{ status: 400 },
		);
	}

	try {
		const setlist = await getSetlistByShareToken(token);

		if (!setlist) {
			return NextResponse.json(
				{ error: "Setlist not found or not shared" },
				{ status: 404 },
			);
		}

		return NextResponse.json(setlist);
	} catch (error) {
		console.error("Error fetching shared setlist:", error);
		return NextResponse.json(
			{ error: "Failed to fetch setlist" },
			{ status: 500 },
		);
	}
}
