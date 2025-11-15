"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
	getSupabaseFavorites,
	addSupabaseFavorite,
	removeSupabaseFavorite,
	getLocalFavorites,
	saveLocalFavorites,
	type FavoriteWithTab,
	type LegacyFavoriteTab,
} from "@/lib/favorites";
import type { SongDetail } from "@/types";

export function useFavorites() {
	const { user } = useAuth();
	const [favorites, setFavorites] = useState<FavoriteWithTab[]>([]);
	const [localFavorites, setLocalFavorites] = useState<
		Record<string, LegacyFavoriteTab>
	>({});
	const [loading, setLoading] = useState(true);

	const loadFavorites = useCallback(async () => {
		setLoading(true);

		if (user) {
			// Load from Supabase
			const favs = await getSupabaseFavorites();
			setFavorites(favs);
		} else {
			// Load from localStorage
			const localFavs = getLocalFavorites();
			setLocalFavorites(localFavs);
		}

		setLoading(false);
	}, [user]);

	// Load favorites on mount and when user changes
	useEffect(() => {
		loadFavorites();
	}, [loadFavorites]);

	const toggleFavorite = async (tab: SongDetail) => {
		if (user) {
			// Supabase favorites - check by tab_url since we don't have tab_id yet
			const existing = favorites.find(
				(f) => f.tab.tab_url === tab.tab_url,
			);

			if (existing) {
				// Remove from favorites
				const { error } = await removeSupabaseFavorite(existing.tab_id);
				if (!error) {
					setFavorites(favorites.filter((f) => f.id !== existing.id));
				}
			} else {
				// Add to favorites (this will save full tab content)
				const { error } = await addSupabaseFavorite(tab);
				if (!error) {
					// Reload to get the new favorite with its ID
					await loadFavorites();
				}
			}
		} else {
			// localStorage favorites (legacy)
			const currentPath = tab.tab_url;
			const newLocalFavorites = { ...localFavorites };

			if (currentPath in newLocalFavorites) {
				delete newLocalFavorites[currentPath];
			} else {
				newLocalFavorites[currentPath] = {
					artist_name: tab.artist_name,
					song: tab.song_name,
					type: tab.type,
					rating: tab.rating,
					tab_url: currentPath,
				};
			}

			setLocalFavorites(newLocalFavorites);
			saveLocalFavorites(newLocalFavorites);
		}
	};

	const isFavorite = (tabUrl: string) => {
		if (user) {
			return favorites.some((f) => f.tab.tab_url === tabUrl);
		} else {
			return tabUrl in localFavorites;
		}
	};

	const getTabId = (tabUrl: string): string | null => {
		if (user) {
			const fav = favorites.find((f) => f.tab.tab_url === tabUrl);
			return fav?.tab_id || null;
		}
		return null;
	};

	return {
		favorites,
		localFavorites,
		loading,
		toggleFavorite,
		isFavorite,
		getTabId,
		refreshFavorites: loadFavorites,
	};
}
