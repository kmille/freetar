import { supabase } from "./supabase";
import { saveTab, getTabById } from "./tabs";
import type { SongDetail } from "@/types";

export interface FavoriteWithTab {
	id: string;
	tab_id: string;
	created_at: string;
	tab: SongDetail;
}

// Legacy format for localStorage
export interface LegacyFavoriteTab {
	artist_name: string;
	song: string;
	type: string;
	rating: number;
	tab_url: string;
}

// Get favorites from localStorage (legacy)
export function getLocalFavorites(): Record<string, LegacyFavoriteTab> {
	if (typeof window === "undefined") return {};
	const favorites = localStorage.getItem("favorites");
	return favorites ? JSON.parse(favorites) : {};
}

// Save favorites to localStorage (legacy)
export function saveLocalFavorites(favorites: Record<string, LegacyFavoriteTab>) {
	if (typeof window === "undefined") return;
	localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Get favorites from Supabase (with full tab content)
export async function getSupabaseFavorites(): Promise<FavoriteWithTab[]> {
	if (!supabase) return [];

	const { data, error } = await supabase
		.from("favorites")
		.select(`
			id,
			tab_id,
			created_at,
			tabs (*)
		`)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching favorites:", error);
		return [];
	}

	// Transform the data
	return (
		data?.map((fav: any) => ({
			id: fav.id,
			tab_id: fav.tab_id,
			created_at: fav.created_at,
			tab: {
				artist_name: fav.tabs.artist_name,
				song_name: fav.tabs.song_name,
				tab_url: fav.tabs.tab_url,
				type: fav.tabs.type,
				version: fav.tabs.version,
				votes: fav.tabs.votes,
				rating: fav.tabs.rating,
				difficulty: fav.tabs.difficulty,
				tuning: fav.tabs.tuning,
				capo: fav.tabs.capo,
				tab: fav.tabs.tab_content,
				chords: fav.tabs.chords || {},
				fingers_for_strings: fav.tabs.fingers_for_strings || {},
				alternatives: fav.tabs.alternatives || [],
			},
		})) || []
	);
}

// Add favorite to Supabase (stores full tab content)
export async function addSupabaseFavorite(tab: SongDetail) {
	if (!supabase) {
		console.error("Supabase not configured");
		return { error: new Error("Supabase not configured") };
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		console.error("User not authenticated");
		return { error: new Error("User not authenticated") };
	}

	console.log("Adding favorite for user:", user.id);

	// First, save the tab (or get existing tab ID)
	const { id: tabId, error: tabError } = await saveTab(tab);
	if (tabError || !tabId) {
		console.error("Failed to save tab:", tabError);
		return { error: tabError || new Error("Failed to save tab") };
	}

	console.log("Tab saved with ID:", tabId, "- Adding to favorites");

	// Then, add to favorites
	const { error } = await supabase.from("favorites").upsert({
		user_id: user.id,
		tab_id: tabId,
	});

	if (error) {
		console.error("Error adding to favorites:", error);
	} else {
		console.log("Successfully added to favorites");
	}

	return { error };
}

// Remove favorite from Supabase
export async function removeSupabaseFavorite(tabId: string) {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: new Error("User not authenticated") };

	const { error } = await supabase
		.from("favorites")
		.delete()
		.eq("user_id", user.id)
		.eq("tab_id", tabId);

	return { error };
}

// Check if tab is favorited
export async function isFavorited(tabId: string): Promise<boolean> {
	if (!supabase) return false;

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return false;

	const { data } = await supabase
		.from("favorites")
		.select("id")
		.eq("user_id", user.id)
		.eq("tab_id", tabId)
		.single();

	return !!data;
}

// Sync localStorage favorites to Supabase (called when user logs in)
// This is complex because we need to fetch full tab content for each favorite
export async function syncLocalFavoritesToSupabase() {
	const localFavorites = getLocalFavorites();
	const tabUrls = Object.keys(localFavorites);

	if (tabUrls.length === 0) return { success: true };

	// Note: This will need to fetch tabs from Ultimate Guitar
	// We'll just clear local storage for now and let the user re-favorite
	// In a real implementation, you'd want to fetch each tab and save it
	console.log("Legacy favorites found. Please re-add your favorites to sync them.");

	return { success: true };
}
