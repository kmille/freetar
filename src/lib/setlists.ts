import { supabase } from "./supabase";
import { saveTab } from "./tabs";
import type { SongDetail } from "@/types";

export interface Setlist {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface SetlistItemWithTab {
	id: string;
	setlist_id: string;
	tab_id: string;
	position: number;
	notes: string | null;
	created_at: string;
	tab: SongDetail;
}

export interface SetlistWithItems extends Setlist {
	items: SetlistItemWithTab[];
}

// Get all setlists for the current user
export async function getSetlists(): Promise<Setlist[]> {
	if (!supabase) return [];

	const { data, error } = await supabase
		.from("setlists")
		.select("*")
		.order("updated_at", { ascending: false });

	if (error) {
		console.error("Error fetching setlists:", error);
		return [];
	}

	return data || [];
}

// Get a single setlist with its items (including full tab content)
export async function getSetlist(
	setlistId: string,
): Promise<SetlistWithItems | null> {
	if (!supabase) return null;

	const { data: setlist, error: setlistError } = await supabase
		.from("setlists")
		.select("*")
		.eq("id", setlistId)
		.single();

	if (setlistError) {
		console.error("Error fetching setlist:", setlistError);
		return null;
	}

	const { data: items, error: itemsError } = await supabase
		.from("setlist_items")
		.select(`
			id,
			setlist_id,
			tab_id,
			position,
			notes,
			created_at,
			tabs (*)
		`)
		.eq("setlist_id", setlistId)
		.order("position", { ascending: true });

	if (itemsError) {
		console.error("Error fetching setlist items:", itemsError);
		return null;
	}

	// Transform the items
	const transformedItems: SetlistItemWithTab[] =
		items?.map((item: any) => ({
			id: item.id,
			setlist_id: item.setlist_id,
			tab_id: item.tab_id,
			position: item.position,
			notes: item.notes,
			created_at: item.created_at,
			tab: {
				artist_name: item.tabs.artist_name,
				song_name: item.tabs.song_name,
				tab_url: item.tabs.tab_url,
				type: item.tabs.type,
				version: item.tabs.version,
				votes: item.tabs.votes,
				rating: item.tabs.rating,
				difficulty: item.tabs.difficulty,
				tuning: item.tabs.tuning,
				capo: item.tabs.capo,
				tab: item.tabs.tab_content,
				chords: item.tabs.chords || {},
				fingers_for_strings: item.tabs.fingers_for_strings || {},
				alternatives: item.tabs.alternatives || [],
			},
		})) || [];

	return {
		...setlist,
		items: transformedItems,
	};
}

// Create a new setlist
export async function createSetlist(
	name: string,
	description?: string,
): Promise<{ data: Setlist | null; error: Error | null }> {
	if (!supabase)
		return { data: null, error: new Error("Supabase not configured") };

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user)
		return { data: null, error: new Error("User not authenticated") };

	const { data, error } = await supabase
		.from("setlists")
		.insert({
			user_id: user.id,
			name,
			description: description || null,
		})
		.select()
		.single();

	return { data, error };
}

// Update a setlist
export async function updateSetlist(
	setlistId: string,
	updates: { name?: string; description?: string },
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const { error } = await supabase
		.from("setlists")
		.update(updates)
		.eq("id", setlistId);

	return { error };
}

// Delete a setlist
export async function deleteSetlist(
	setlistId: string,
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const { error } = await supabase
		.from("setlists")
		.delete()
		.eq("id", setlistId);

	return { error };
}

// Add a tab to a setlist (stores full tab content)
export async function addToSetlist(
	setlistId: string,
	tab: SongDetail,
	notes?: string,
): Promise<{ error: Error | null }> {
	if (!supabase) {
		console.error("Supabase not configured");
		return { error: new Error("Supabase not configured") };
	}

	console.log("Adding to setlist:", setlistId);

	// First, save the tab (or get existing tab ID)
	const { id: tabId, error: tabError } = await saveTab(tab);
	if (tabError || !tabId) {
		console.error("Failed to save tab:", tabError);
		return { error: tabError || new Error("Failed to save tab") };
	}

	console.log("Tab saved with ID:", tabId, "- Adding to setlist");

	// Get the highest position in the setlist
	const { data: items } = await supabase
		.from("setlist_items")
		.select("position")
		.eq("setlist_id", setlistId)
		.order("position", { ascending: false })
		.limit(1);

	const nextPosition = items && items.length > 0 ? items[0].position + 1 : 0;
	console.log("Next position in setlist:", nextPosition);

	// Add to setlist
	const { error } = await supabase.from("setlist_items").insert({
		setlist_id: setlistId,
		tab_id: tabId,
		position: nextPosition,
		notes: notes || null,
	});

	if (error) {
		console.error("Error adding to setlist:", error);
	} else {
		console.log("Successfully added to setlist");
	}

	return { error };
}

// Remove a tab from a setlist
export async function removeFromSetlist(
	itemId: string,
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const { error } = await supabase
		.from("setlist_items")
		.delete()
		.eq("id", itemId);

	return { error };
}

// Reorder setlist items
export async function reorderSetlistItems(
	setlistId: string,
	itemIds: string[],
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	// Update each item's position
	const updates = itemIds.map((id, index) => ({
		id,
		setlist_id: setlistId,
		position: index,
	}));

	const { error } = await supabase.from("setlist_items").upsert(updates);

	return { error };
}

// Update setlist item notes
export async function updateSetlistItemNotes(
	itemId: string,
	notes: string,
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	const { error } = await supabase
		.from("setlist_items")
		.update({ notes })
		.eq("id", itemId);

	return { error };
}
