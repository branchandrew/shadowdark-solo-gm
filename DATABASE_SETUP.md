# Database Setup Guide

The Shadowdark Solo GM uses a hybrid storage approach that works everywhere:

- **localStorage** (default): Works offline, in CodePen, and anywhere JavaScript runs
- **Supabase** (optional): Cloud sync for backing up and sharing data across devices

## Local Storage Only (Default)

No setup required! The app works immediately with localStorage as the primary storage. Your data is saved locally in your browser.

**Pros:**

- ✅ Works everywhere (CodePen, static hosting, etc.)
- ✅ No account needed
- ✅ Works offline
- ✅ Fast and reliable

**Cons:**

- ❌ Data only on current device/browser
- ❌ No sharing between devices
- ❌ Lost if browser data is cleared

## Cloud Sync with Supabase (Optional)

Enable cloud sync to backup and share your game sessions across devices.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up

### 2. Set Up the Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL to create the necessary tables

### 3. Get Your Credentials

1. Go to Project Settings → API
2. Copy your Project URL and anon public key

### 4. Configure Environment Variables

Create a `.env` file in your project root (use `.env.example` as a template):

```bash
# Copy .env.example to .env and fill in your values
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Restart the App

Restart your development server to load the new environment variables:

```bash
npm run dev
```

## How the Hybrid System Works

### Data Flow

1. **Primary storage**: localStorage (always used)
2. **Secondary sync**: Supabase (when enabled and available)
3. **Fallback**: If cloud fails, localStorage continues working

### Session Management

- Each browser session gets a unique ID
- Data is automatically synced between localStorage and cloud
- You can enable/disable cloud sync at any time

### Data Export/Import

- Export your game data as JSON for backup
- Import previously exported data
- Share game sessions with other players

## Deployment Options

### Static Hosting (Netlify, Vercel, GitHub Pages)

- Works with localStorage only
- Add environment variables in hosting platform settings for cloud sync

### CodePen/JSFiddle

- localStorage works automatically
- Cloud sync requires API keys to be embedded (not recommended for public demos)

### Self-Hosted Server

- Both localStorage and cloud sync work
- Set environment variables on your server

### Docker/Container Deployment

- Pass environment variables through container config
- Mount volumes for persistent storage if needed

## Security Notes

- The `VITE_SUPABASE_ANON_KEY` is safe to expose (it's designed for browser use)
- Row Level Security (RLS) is enabled on Supabase tables
- Each user can only access their own game sessions
- Never put secret keys in `VITE_` environment variables

## Troubleshooting

### Cloud Sync Not Working

1. Check that environment variables are set correctly
2. Verify Supabase project is active
3. Ensure SQL schema was run successfully
4. Check browser console for error messages

### Data Loss Prevention

1. Use the Export feature regularly for backups
2. Enable cloud sync for automatic backups
3. Test import/export before relying on it

### Performance

- localStorage is always faster than cloud
- Cloud sync happens in the background
- App works normally even if cloud sync fails

## Migration

### From Pure localStorage

1. Set up Supabase following the guide above
2. Enable cloud sync in the app
3. Your existing data will automatically sync to the cloud

### Between Environments

1. Export data from source environment
2. Import data in target environment
3. Or use cloud sync to automatically sync between devices

## Development

### Testing Cloud Sync

1. Use a test Supabase project for development
2. Test with environment variables in `.env.local`
3. Verify both localStorage and cloud sync paths work

### Adding New Data Types

1. Update the database schema
2. Add new fields to `GameSession` interface
3. Update the database service mapping functions
4. Create new hooks if needed
