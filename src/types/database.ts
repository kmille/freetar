export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			tabs: {
				Row: {
					id: string;
					tab_url: string;
					artist_name: string;
					song_name: string;
					type: string;
					version: number;
					votes: number;
					rating: number;
					difficulty: string | null;
					tuning: string | null;
					capo: number | null;
					tab_content: string;
					chords: Json | null;
					fingers_for_strings: Json | null;
					alternatives: Json | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					tab_url: string;
					artist_name: string;
					song_name: string;
					type: string;
					version?: number;
					votes?: number;
					rating?: number;
					difficulty?: string | null;
					tuning?: string | null;
					capo?: number | null;
					tab_content: string;
					chords?: Json | null;
					fingers_for_strings?: Json | null;
					alternatives?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					tab_url?: string;
					artist_name?: string;
					song_name?: string;
					type?: string;
					version?: number;
					votes?: number;
					rating?: number;
					difficulty?: string | null;
					tuning?: string | null;
					capo?: number | null;
					tab_content?: string;
					chords?: Json | null;
					fingers_for_strings?: Json | null;
					alternatives?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			favorites: {
				Row: {
					id: string;
					user_id: string;
					tab_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					tab_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					tab_id?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			setlists: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					share_token: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					share_token?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					description?: string | null;
					share_token?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			setlist_items: {
				Row: {
					id: string;
					setlist_id: string;
					tab_id: string;
					position: number;
					notes: string | null;
					transpose: number;
					capo: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					setlist_id: string;
					tab_id: string;
					position: number;
					notes?: string | null;
					transpose?: number;
					capo?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					setlist_id?: string;
					tab_id?: string;
					position?: number;
					notes?: string | null;
					transpose?: number;
					capo?: number;
					created_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
