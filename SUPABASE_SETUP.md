# Supabase Setup Guide for Freetar

This guide will help you set up Supabase authentication and data storage for Freetar.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js ≥22.0.0 installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - **Name**: freetar (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for the setup to complete (1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the sidebar
2. Navigate to **API** under "Project Settings"
3. You'll need two values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see a success message confirming that tables and policies were created

### What This Creates

The schema creates three tables:

- **favorites**: Stores user's favorite tabs
- **setlists**: Stores user's setlist collections
- **setlist_items**: Stores tabs within setlists

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Step 5: Configure Email Authentication

Supabase uses magic link authentication (passwordless email login).

### Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** > **Email Templates** in your Supabase dashboard
2. Customize the "Confirm signup" template if desired
3. Customize the "Magic Link" template for login emails

### Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/auth/callback`
     - Your production URL when deployed (e.g., `https://yourdomain.com/auth/callback`)

### Configure Email Provider (Production)

For production, you'll want to use a custom SMTP provider:

1. Go to **Settings** > **Auth** > **SMTP Settings**
2. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)
3. For development, Supabase's default email works fine (limited to 3 emails per hour)

## Step 6: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. Click **Sign In** in the navigation bar

5. Enter your email address

6. Check your email for the magic link

7. Click the link to sign in

8. You should now be logged in! Try:
   - Adding a tab to favorites (search for a song first)
   - Creating a setlist
   - Adding tabs to your setlist

## Features Enabled by Supabase

### For Anonymous Users (No Login)
- **Favorites**: Stored in browser localStorage
- **Search and view tabs**: Full access

### For Logged-In Users
- **Synced Favorites**: Automatically synced across devices
- **Setlists**: Create named collections of tabs for performances
- **Cloud Storage**: All data backed up in Supabase

### Auto-Migration
When a user signs in for the first time, their localStorage favorites are automatically migrated to Supabase!

## Deployment Considerations

### Environment Variables

When deploying to production (Vercel, etc.), make sure to set these environment variables:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Redirect URLs

Don't forget to add your production URLs to:
- **Authentication** > **URL Configuration** > **Redirect URLs**
- Add: `https://yourdomain.com/auth/callback`

### Email Provider

For production, configure a custom SMTP provider to avoid rate limits.

## Troubleshooting

### "Invalid API key" or similar errors
- Double-check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Restart your development server after changing `.env.local`

### Magic link not working
- Check your Supabase email quota (3/hour on free tier with default provider)
- Verify the redirect URL is configured correctly
- Check your spam folder

### RLS Policy errors
- Make sure you ran the entire `supabase-schema.sql` script
- Check the SQL editor for any error messages
- Verify that RLS is enabled on all tables

### Data not syncing
- Open browser dev tools and check the Network tab for errors
- Verify you're logged in (check the user icon in the navbar)
- Check Supabase logs: **Logs** > **API** in the dashboard

## Database Management

### View Data

You can view and manage your data in the Supabase dashboard:
1. Click **Table Editor** in the sidebar
2. Select a table (favorites, setlists, or setlist_items)
3. View, edit, or delete records

### Backup

Supabase automatically backs up your database. For manual backups:
1. Go to **Database** > **Backups**
2. Download backups as needed

### Monitor Usage

Free tier limits:
- **Storage**: 500 MB
- **Database**: 500 MB
- **Bandwidth**: 5 GB/month
- **Email**: 3 emails/hour (with default provider)

Monitor usage in **Settings** > **Usage**.

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose client-side
- Row Level Security (RLS) ensures users can only access their own data
- Magic links expire after a short period for security

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Freetar Issues: https://github.com/your-repo/issues
- Supabase Discord: https://discord.supabase.com

## Optional: Database Types

If you modify the database schema, you can regenerate TypeScript types:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-id

# Generate types
supabase gen types typescript --linked > src/types/database.ts
```

This keeps your TypeScript types in sync with your database schema!
