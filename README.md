# Link Shortcuts Hub

A simple, elegant web application for managing your link shortcuts organized in bundles.

## Features

- 📦 **Bundles** - Organize your main shortcuts
- 🧩 **Addons** - Manage additional resources
- 📱 **DeviceC** - Device-specific links
- 🔍 **Search** - Filter by name or keywords
- 💾 **Local Storage** - Data saved in your browser
- 🎨 **Modern Design** - Clean, gradient UI
- 🚀 **No Server Required** - Pure client-side application

## Quick Start

**Just open `index.html` in your browser!**

That's it! No installation, no server needed.

## How It Works

Each record consists of:
- **Name** - Bundle/addon name
- **Keywords** - Searchable tags
- **Link** - URL to navigate to

Data is automatically saved to your browser's `localStorage` and persists between sessions.

## Requirements

- Any modern web browser (Chrome, Firefox, Edge, Safari)

## File Structure

```
├── index.html      - Main application (just open this!)
├── README.md       - This file
└── server-files/   - Optional server files (not needed)
```

## Tips

- Double-click `index.html` to open it
- Bookmark the local file path for quick access
- Data is stored locally in your browser
- Works completely offline

Enjoy organizing your shortcuts! 🚀

## Deploying to GitHub Pages and adding CRUD backend (fast)

Follow these steps to host the frontend on GitHub Pages and enable full CRUD using Supabase as a backend.

1. Create a free Supabase project at https://app.supabase.com/
2. In the Supabase project, open the SQL editor and run the SQL in `supabase-setup.sql` to create the `shortcuts` table.
3. In your Supabase project settings > API, copy the `anon` public key and the project URL.
4. Edit `assets/js/supabase-crud.js` and replace `REPLACE_WITH_SUPABASE_URL` and `REPLACE_WITH_SUPABASE_ANON_KEY` with your values.
5. Commit and push to the `main` branch. The repository includes a workflow `.github/workflows/gh-pages.yml` that will deploy the repository root to the `gh-pages` branch. Alternatively you can enable GitHub Pages from the repository settings (serve `main` or `gh-pages` branch).

Notes:
- `admin.html` is an example admin UI that performs CRUD against the `shortcuts` table. It is a minimal interface you can extend.
- The SQL provided enables a permissive policy; for production you should tighten RLS policies and require authenticated access.
- If you prefer no external backend, the repo contains `server-files/server.js` which provides a simple JSON-file-based API (not suitable for multi-user production).

Want me to: add authentication to the admin UI, or wire a deploy badge/README example? Reply which one and I'll implement it next.
