# Troubleshooting Guide - Songs Not Saving

## Issue: Songs/Tabs Not Being Saved to Database

If you're seeing setlists but no songs inside them, follow these steps:

### Step 1: Check Browser Console

1. Open your browser DevTools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try adding a tab to favorites or setlist
4. Look for console.log messages showing the save process
5. Look for any **red error messages**

**What to look for:**
```
✅ "Adding favorite for user: <uuid>"
✅ "Inserting new tab: { tab_url: ..., artist: ..., song: ... }"
✅ "Tab inserted successfully with ID: <uuid>"
✅ "Tab saved with ID: <uuid> - Adding to favorites"
✅ "Successfully added to favorites"

❌ "Error inserting tab: <error details>"
❌ "Failed to save tab: <error>"
```

### Step 2: Check Supabase Configuration

Make sure your `.env.local` file has the correct credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Verify:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy the **Project URL** and **anon/public** key
5. Make sure they match your `.env.local`

### Step 3: Verify Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query to check if tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**You should see:**
- `favorites`
- `setlist_items`
- `setlists`
- `tabs` ← **MOST IMPORTANT**

If `tabs` table is missing, you need to run the schema!

### Step 4: Re-run the Database Schema

If you had old tables, you MUST drop them first:

```sql
-- Drop old tables (this will delete all data!)
DROP TABLE IF EXISTS setlist_items CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS setlists CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;
```

Then run the complete schema from `supabase-schema.sql`.

### Step 5: Check Row Level Security (RLS) Policies

Run this query to check RLS policies:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**For `tabs` table, you should see:**
- `Anyone can view tabs` (SELECT)
- `Authenticated users can insert tabs` (INSERT)
- `Authenticated users can update tabs` (UPDATE)

If policies are missing, re-run the schema.

### Step 6: Test Manual Insert

Try inserting a test tab manually to verify permissions:

```sql
-- Test insert (should work if you're logged into Supabase)
INSERT INTO tabs (
    tab_url,
    artist_name,
    song_name,
    type,
    version,
    votes,
    rating,
    tab_content
) VALUES (
    '/tab/test/test/tab-123',
    'Test Artist',
    'Test Song',
    'Chords',
    1,
    100,
    4.5,
    '<div>Test tab content</div>'
);
```

If this fails, there's a permissions issue.

### Step 7: Check Authentication

Make sure you're actually logged in:

1. In the app, check if you see your email in the navbar dropdown
2. In browser console, run:
   ```javascript
   localStorage.getItem('supabase.auth.token')
   ```
3. You should see a JWT token

If no token, you're not logged in!

### Step 8: Common Errors and Solutions

#### Error: "new row violates row-level security policy"
**Solution:** The RLS policy is too restrictive. Update the policy:

```sql
DROP POLICY IF EXISTS "Authenticated users can insert tabs" ON tabs;

CREATE POLICY "Authenticated users can insert tabs"
    ON tabs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
```

#### Error: "null value in column 'tab_content' violates not-null constraint"
**Solution:** The tab object doesn't have content. Check that `tab.tab` exists in the SongDetail object.

#### Error: "duplicate key value violates unique constraint"
**Solution:** Tab already exists. This is normal - the app should return the existing tab ID.

#### Error: "permission denied for table tabs"
**Solution:** RLS is enabled but no policies allow your operation.

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'tabs';

-- If rowsecurity is true, policies must allow the operation
```

### Step 9: Verify the Full Flow

1. **Search for a tab** → Should work (scrapes Ultimate Guitar)
2. **View the tab** → Should display correctly
3. **Check browser console** → Should NOT show any Supabase errors
4. **Click ⭐ to favorite**:
   - Console should show: "Adding favorite for user..."
   - Console should show: "Inserting new tab..." or "Tab already exists..."
   - Console should show: "Successfully added to favorites"
5. **Refresh the home page** → Your favorite should appear
6. **Click the favorite** → URL should be `/tab?id=<uuid>`
7. **Tab should load from database** (instant, no scraping)

### Step 10: Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **API**
2. Look for recent requests to your tables
3. Check for any error responses

### Step 11: Nuclear Option - Fresh Start

If nothing works, completely reset:

```sql
-- Delete all tables
DROP TABLE IF EXISTS setlist_items CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS setlists CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;

-- Re-run the complete schema from supabase-schema.sql
```

Then:
1. Restart your dev server: `npm run dev`
2. Clear browser cache and localStorage
3. Sign out and sign back in
4. Try adding a favorite again

### Debug Checklist

- [ ] `.env.local` has correct Supabase credentials
- [ ] Restarted dev server after adding `.env.local`
- [ ] All 4 tables exist (`tabs`, `favorites`, `setlists`, `setlist_items`)
- [ ] RLS policies are set up correctly
- [ ] User is authenticated (see email in navbar)
- [ ] Browser console shows no errors
- [ ] `tabs` table has INSERT policy for authenticated users
- [ ] Schema was run completely (not partially)

### Still Not Working?

Share the error from browser console. Look for:
1. Red error messages
2. Failed network requests (Network tab)
3. Specific error codes from Supabase

The console logs I added will show exactly where the process is failing!
