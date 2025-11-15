import { supabase } from "./supabase";
import type { SearchResult } from "@/types";

export interface FavoriteTab {
	artist_name: string;
	song: string;
	type: string;
	rating: number;
	tab_url: string;
}

// Get favorites from localStorage
export function getLocalFavorites(): Record<string, FavoriteTab> {
	if (typeof window === "undefined") return {};
	const favorites = localStorage.getItem("favorites");
	return favorites ? JSON.parse(favorites) : {};
}

// Save favorites to localStorage
export function saveLocalFavorites(favorites: Record<string, FavoriteTab>) {
	if (typeof window === "undefined") return;
	localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Get favorites from Supabase
export async function getSupabaseFavorites(): Promise<
	Record<string, FavoriteTab>
> {
	if (!supabase) return {};

	const { data, error } = await supabase
		.from("favorites")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching favorites:", error);
		return {};
	}

	const favoritesMap: Record<string, FavoriteTab> = {};
	data?.forEach((fav) => {
		favoritesMap[fav.tab_url] = {
			artist_name: fav.artist_name,
			song: fav.song_name,
			type: fav.type,
			rating: fav.rating,
			tab_url: fav.tab_url,
		};
	});

	return favoritesMap;
}

// Add favorite to Supabase
export async function addSupabaseFavorite(
	tabUrl: string,
	tabData: FavoriteTab,
) {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: new Error("User not authenticated") };

	const { error } = await supabase.from("favorites").upsert({
		user_id: user.id,
		artist_name: tabData.artist_name,
		song_name: tabData.song,
		type: tabData.type,
		rating: tabData.rating,
		tab_url: tabUrl,
	});

	return { error };
}

// Remove favorite from Supabase
export async function removeSupabaseFavorite(tabUrl: string) {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: new Error("User not authenticated") };

	const { error } = await supabase
		.from("favorites")
		.delete()
		.eq("user_id", user.id)
		.eq("tab_url", tabUrl);

	return { error };
}

// Sync localStorage favorites to Supabase (called when user logs in)
export async function syncLocalFavoritesToSupabase() {
	const localFavorites = getLocalFavorites();
	const tabUrls = Object.keys(localFavorites);

	if (tabUrls.length === 0) return { success: true };

	for (const tabUrl of tabUrls) {
		const tabData = localFavorites[tabUrl];
		await addSupabaseFavorite(tabUrl, tabData);
	}

	return { success: true };
}

// Unified function to get favorites (Supabase if logged in, localStorage otherwise)
export async function getFavorites(
	isLoggedIn: boolean,
): Promise<Record<string, FavoriteTab>> {
	if (isLoggedIn) {
		return await getSupabaseFavorites();
	} else {
		return getLocalFavorites();
	}
}

// Unified function to add favorite
export async function addFavorite(
	tabUrl: string,
	tabData: FavoriteTab,
	isLoggedIn: boolean,
) {
	if (isLoggedIn) {
		return await addSupabaseFavorite(tabUrl, tabData);
	} else {
		const favorites = getLocalFavorites();
		favorites[tabUrl] = tabData;
		saveLocalFavorites(favorites);
		return { error: null };
	}
}

// Unified function to remove favorite
export async function removeFavorite(tabUrl: string, isLoggedIn: boolean) {
	if (isLoggedIn) {
		return await removeSupabaseFavorite(tabUrl);
	} else {
		const favorites = getLocalFavorites();
		delete favorites[tabUrl];
		saveLocalFavorites(favorites);
		return { error: null };
	}
}
