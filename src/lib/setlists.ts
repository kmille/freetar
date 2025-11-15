import { supabase } from "./supabase";

export interface Setlist {
	id: string;
	user_id: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface SetlistItem {
	id: string;
	setlist_id: string;
	artist_name: string;
	song_name: string;
	type: string;
	rating: number;
	tab_url: string;
	position: number;
	notes: string | null;
	created_at: string;
}

export interface SetlistWithItems extends Setlist {
	items: SetlistItem[];
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

// Get a single setlist with its items
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
		.select("*")
		.eq("setlist_id", setlistId)
		.order("position", { ascending: true });

	if (itemsError) {
		console.error("Error fetching setlist items:", itemsError);
		return null;
	}

	return {
		...setlist,
		items: items || [],
	};
}

// Create a new setlist
export async function createSetlist(
	name: string,
	description?: string,
): Promise<{ data: Setlist | null; error: Error | null }> {
	if (!supabase) return { data: null, error: new Error("Supabase not configured") };

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

// Add a tab to a setlist
export async function addToSetlist(
	setlistId: string,
	tabData: {
		artist_name: string;
		song_name: string;
		type: string;
		rating: number;
		tab_url: string;
		notes?: string;
	},
): Promise<{ error: Error | null }> {
	if (!supabase) return { error: new Error("Supabase not configured") };

	// Get the highest position in the setlist
	const { data: items } = await supabase
		.from("setlist_items")
		.select("position")
		.eq("setlist_id", setlistId)
		.order("position", { ascending: false })
		.limit(1);

	const nextPosition = items && items.length > 0 ? items[0].position + 1 : 0;

	const { error } = await supabase.from("setlist_items").insert({
		setlist_id: setlistId,
		artist_name: tabData.artist_name,
		song_name: tabData.song_name,
		type: tabData.type,
		rating: tabData.rating,
		tab_url: tabData.tab_url,
		position: nextPosition,
		notes: tabData.notes || null,
	});

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
