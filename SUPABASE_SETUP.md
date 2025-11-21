# 🚀 Supabase Setup Instructions

## Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: `etisalat-infohub`
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to UAE (e.g., Singapore or Mumbai)
5. Wait ~2 minutes for project to be created

## Step 2: Create Database Tables (1 minute)

1. In your Supabase project, go to **SQL Editor**
2. Copy and paste the SQL from `supabase-setup.sql`
3. Click **Run**

You should see: "Success. No rows returned"

## Step 3: Get API Credentials (30 seconds)

1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public key** (starts with `eyJhbGc...`)

## Step 4: Configure Your App (1 minute)

1. Copy `js/config.template.js` → `js/config.js`
   ```bash
   cp js/config.template.js js/config.js
   ```

2. Edit `js/config.js` and replace:
   ```javascript
   SUPABASE_URL: 'https://xyzcompany.supabase.co',  // Your Project URL
   SUPABASE_ANON_KEY: 'eyJhbGc...',  // Your anon public key
   ```

3. Save the file

## Step 5: Test It! (30 seconds)

1. Open `index.html` in your browser
2. Open Developer Console (F12)
3. You should see: `✅ Supabase initialized`
4. Try adding a bundle - it will save to Supabase!

---

## 🔒 Security Notes

- **config.js is gitignored** - your API keys won't be committed
- The `anon` key is safe for client-side use (it's public)
- Supabase has Row Level Security enabled by default
- For production, add RLS policies to restrict access

---

## 🎯 Features

✅ **Automatic caching** - Fast loads, works offline  
✅ **Offline support** - Changes sync when back online  
✅ **5-minute cache** - Fresh data without constant API calls  
✅ **localStorage backup** - Data persists even after refresh  
✅ **Smart sync** - Only fetches when needed

---

## 🧪 Testing

### Test online mode:
1. Add a bundle
2. Refresh page
3. Bundle should still be there (loaded from cache or Supabase)

### Test offline mode:
1. Open DevTools → Network tab
2. Set to "Offline"
3. Add a bundle (it queues for sync)
4. Set back to "Online"
5. Changes automatically sync!

---

## 🐛 Troubleshooting

### "Supabase library not loaded"
→ Make sure you have internet connection on first load

### "Supabase credentials not configured"
→ Check that `js/config.js` exists and has real values

### Data not saving
→ Check browser console for errors
→ Verify your API credentials are correct
→ Check Supabase dashboard for any errors

### Cache not working
→ Clear browser cache and localStorage
→ Set `CONFIG.DEBUG = true` in config.js to see detailed logs

---

## 📊 Database Schema

See `supabase-setup.sql` for the complete schema with:
- **bundles** - Mobile bundles with CPR data
- **addons** - Additional services
- **slas** - Service level agreements
- **navigators** - UI navigation paths
- **scenarios** - Customer service scenarios

---

## 🎉 You're Done!

Your app now has:
- ☁️ Cloud database (Supabase)
- 📦 Smart caching (localStorage)
- 🔄 Auto-sync (online/offline)
- ⚡ Fast performance (5-min cache)

**Enjoy building!** 🚀
