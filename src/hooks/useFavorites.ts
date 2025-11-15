"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
	getFavorites,
	addFavorite,
	removeFavorite,
	syncLocalFavoritesToSupabase,
	type FavoriteTab,
} from "@/lib/favorites";

export function useFavorites() {
	const { user } = useAuth();
	const [favorites, setFavorites] = useState<Record<string, FavoriteTab>>(
		{},
	);
	const [loading, setLoading] = useState(true);
	const [hasSynced, setHasSynced] = useState(false);

	const loadFavorites = useCallback(async () => {
		setLoading(true);
		const favs = await getFavorites(Boolean(user));
		setFavorites(favs);
		setLoading(false);
	}, [user]);

	// Load favorites on mount and when user changes
	useEffect(() => {
		loadFavorites();
	}, [loadFavorites]);

	// Sync localStorage to Supabase when user logs in
	useEffect(() => {
		if (user && !hasSynced) {
			syncLocalFavoritesToSupabase().then(() => {
				setHasSynced(true);
				loadFavorites(); // Reload to get synced data
			});
		}
	}, [user, hasSynced, loadFavorites]);

	const toggleFavorite = async (tabUrl: string, tabData: FavoriteTab) => {
		const isFavorited = tabUrl in favorites;

		if (isFavorited) {
			// Remove from favorites
			const { error } = await removeFavorite(tabUrl, Boolean(user));
			if (!error) {
				const newFavorites = { ...favorites };
				delete newFavorites[tabUrl];
				setFavorites(newFavorites);
			}
		} else {
			// Add to favorites
			const { error } = await addFavorite(tabUrl, tabData, Boolean(user));
			if (!error) {
				setFavorites({ ...favorites, [tabUrl]: tabData });
			}
		}
	};

	const isFavorite = (tabUrl: string) => {
		return tabUrl in favorites;
	};

	return {
		favorites,
		loading,
		toggleFavorite,
		isFavorite,
		refreshFavorites: loadFavorites,
	};
}
