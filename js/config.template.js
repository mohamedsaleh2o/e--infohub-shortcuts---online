// ⚠️ Configuration Template File
// 
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to: config.js
// 2. Replace the placeholder values with your actual Supabase credentials
// 3. Get your credentials from: https://supabase.com/dashboard/project/_/settings/api
// 4. NEVER commit config.js to Git (it's in .gitignore)

const CONFIG = {
    // Supabase Configuration
    // Example: 'https://xyzcompany.supabase.co'
    SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL_HERE',
    
    // This is the "anon" public key - safe for client-side use
    // Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',
    
    // External APIs
    ETISALAT_API: 'https://www.etisalat.ae/b2c/eshop/getPostPaidPlanProduct',
    
    // Cache Configuration (in milliseconds)
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Performance settings
    ENABLE_CACHE: true,
    ENABLE_OFFLINE_MODE: true,
    
    // Debug mode (set to false in production)
    DEBUG: false
};

// Validation check
if (CONFIG.SUPABASE_URL.includes('YOUR_') || CONFIG.SUPABASE_ANON_KEY.includes('YOUR_')) {
    console.error('⚠️ CONFIG NOT CONFIGURED! Please copy config.template.js to config.js and add your Supabase credentials.');
}
