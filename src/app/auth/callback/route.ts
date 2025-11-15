import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code && supabase) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	// Redirect to home page after authentication
	return NextResponse.redirect(new URL("/", requestUrl.origin));
}
