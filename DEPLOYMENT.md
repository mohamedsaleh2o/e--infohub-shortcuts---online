# Link Shortcuts Hub

A modern, responsive web application for managing link shortcuts, bundles, add-ons, SLA information, and navigation guides.

## 🚀 Features

- **Bundles & Add-ons**: Manage product bundles and add-ons with CPR information
- **SLA Tracking**: Track service level agreements with time durations
- **Navigation Guides**: Step-by-step navigation paths for system features
- **Cloud Sync**: Optional Supabase integration for cloud data storage
- **Offline Support**: Works with localStorage when cloud is unavailable
- **Mobile Responsive**: Optimized for all devices
- **Import/Export**: JSON data import/export functionality

## 📦 Deployment Options

### Option 1: GitHub Pages (Static Hosting)

1. **Fork/Clone this repository**
2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (root)
   - Save
3. **Access your site**: `https://yourusername.github.io/repository-name`

### Option 2: Supabase Integration (Cloud Database)

1. **Create a Supabase account**: https://supabase.com
2. **Create a new project**
3. **Create the database table**:

```sql
CREATE TABLE shortcuts (
    id BIGINT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT,
    link TEXT,
    time TEXT,
    path TEXT,
    cpr JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Enable all operations for everyone" ON shortcuts
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

4. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon/public` key

5. **Update index.html**:
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

6. **Commit and push changes**

## 🛠️ Local Development

Simply open `index.html` in a web browser. No build process required!

For a local server (optional):
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Then visit http://localhost:8000
```

## 📊 Data Structure

The application manages 5 types of data:
- **Bundles**: Product bundles with CPR information
- **Add-ons**: Additional services with CPR details
- **Device Care**: Device-related services
- **SLA**: Service Level Agreements with time commitments
- **Navigator**: Navigation guides with step-by-step paths

## 🔄 Data Sync

- **With Supabase**: Data is automatically synced to the cloud
- **Without Supabase**: Data is stored in browser localStorage
- **Backup**: localStorage is always used as a fallback

## 🎨 Customization

### Branding
- Update logo URL in `index.html` (search for `etisalat-Logo`)
- Modify colors in the CSS (search for `#e30613` for brand color)

### Navigation Items
- Icons can be changed in the sidebar navigation
- Add/remove sections by modifying the navigation menu

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

- Supabase anon key is safe to expose in client-side code
- Implement Row Level Security (RLS) in Supabase for production
- For sensitive data, add authentication (Supabase Auth)

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚡ Performance

- Lightweight: < 50KB total size
- Fast load: Static HTML/CSS/JS
- CDN-delivered: Via GitHub Pages or Supabase
- Offline-ready: Service worker can be added for PWA

## 📞 Support

For issues or questions, please open a GitHub issue.
