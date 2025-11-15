import { supabase } from "./supabase";
import type { SongDetail } from "@/types";

// Convert SongDetail to database format
export function songDetailToDbFormat(tab: SongDetail) {
	return {
		tab_url: tab.tab_url,
		artist_name: tab.artist_name,
		song_name: tab.song_name,
		type: tab.type,
		version: tab.version || 1,
		votes: tab.votes || 0,
		rating: tab.rating || 0,
		difficulty: tab.difficulty || null,
		tuning: tab.tuning || null,
		capo: tab.capo || null,
		tab_content: tab.tab,
		chords: tab.chords || null,
		fingers_for_strings: tab.fingers_for_strings || null,
		alternatives: tab.alternatives || null,
	};
}

// Convert database row to SongDetail
export function dbFormatToSongDetail(row: any): SongDetail {
	return {
		artist_name: row.artist_name,
		song_name: row.song_name,
		tab_url: row.tab_url,
		type: row.type,
		version: row.version,
		votes: row.votes,
		rating: row.rating,
		difficulty: row.difficulty,
		tuning: row.tuning,
		capo: row.capo,
		tab: row.tab_content,
		chords: row.chords || {},
		fingers_for_strings: row.fingers_for_strings || {},
		alternatives: row.alternatives || [],
	};
}

// Save or update a tab in the database
export async function saveTab(
	tab: SongDetail,
): Promise<{ id: string | null; error: Error | null }> {
	if (!supabase) {
		console.error("Supabase not configured");
		return { id: null, error: new Error("Supabase not configured") };
	}

	try {
		// Check if tab already exists
		const { data: existing, error: existingError } = await supabase
			.from("tabs")
			.select("id")
			.eq("tab_url", tab.tab_url)
			.maybeSingle();

		if (existingError) {
			console.error("Error checking existing tab:", existingError);
		}

		if (existing) {
			// Tab already exists, return its ID
			console.log("Tab already exists with ID:", existing.id);
			return { id: existing.id, error: null };
		}

		// Insert new tab
		const tabData = songDetailToDbFormat(tab);
		console.log("Inserting new tab:", {
			tab_url: tabData.tab_url,
			artist: tabData.artist_name,
			song: tabData.song_name,
		});

		const { data, error } = await supabase
			.from("tabs")
			.insert(tabData)
			.select("id")
			.single();

		if (error) {
			console.error("Error inserting tab:", error);
			return { id: null, error };
		}

		console.log("Tab inserted successfully with ID:", data.id);
		return { id: data.id, error: null };
	} catch (err) {
		console.error("Unexpected error in saveTab:", err);
		return {
			id: null,
			error: err instanceof Error ? err : new Error(String(err)),
		};
	}
}

// Get a tab by ID from the database
export async function getTabById(
	tabId: string,
): Promise<SongDetail | null> {
	if (!supabase) return null;

	const { data, error } = await supabase
		.from("tabs")
		.select("*")
		.eq("id", tabId)
		.single();

	if (error || !data) {
		console.error("Error fetching tab:", error);
		return null;
	}

	return dbFormatToSongDetail(data);
}

// Get a tab by URL from the database
export async function getTabByUrl(
	tabUrl: string,
): Promise<{ id: string; tab: SongDetail } | null> {
	if (!supabase) return null;

	const { data, error } = await supabase
		.from("tabs")
		.select("*")
		.eq("tab_url", tabUrl)
		.single();

	if (error || !data) {
		return null;
	}

	return {
		id: data.id,
		tab: dbFormatToSongDetail(data),
	};
}
