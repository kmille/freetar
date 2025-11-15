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
			favorites: {
				Row: {
					id: string;
					user_id: string;
					artist_name: string;
					song_name: string;
					type: string;
					rating: number;
					tab_url: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					artist_name: string;
					song_name: string;
					type: string;
					rating: number;
					tab_url: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					artist_name?: string;
					song_name?: string;
					type?: string;
					rating?: number;
					tab_url?: string;
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
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			setlist_items: {
				Row: {
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
				};
				Insert: {
					id?: string;
					setlist_id: string;
					artist_name: string;
					song_name: string;
					type: string;
					rating: number;
					tab_url: string;
					position: number;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					setlist_id?: string;
					artist_name?: string;
					song_name?: string;
					type?: string;
					rating?: number;
					tab_url?: string;
					position?: number;
					notes?: string | null;
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
