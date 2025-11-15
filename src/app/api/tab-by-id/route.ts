import { NextRequest, NextResponse } from "next/server";
import { getTabById } from "@/lib/tabs";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return NextResponse.json(
			{ error: "Tab ID is required" },
			{ status: 400 },
		);
	}

	try {
		const tab = await getTabById(id);

		if (!tab) {
			return NextResponse.json(
				{ error: "Tab not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(tab);
	} catch (error) {
		console.error("Error fetching tab:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tab" },
			{ status: 500 },
		);
	}
}
