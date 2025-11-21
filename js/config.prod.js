// 🔧 Production Configuration File for GitHub Pages
// This file is committed to Git and safe to expose (uses public anon key)

const CONFIG = {
    // ===========================================
    // SUPABASE CONFIGURATION
    // ===========================================
    SUPABASE_URL: 'https://ywsbhmpzmtqovgtltsfw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c2JobXB6bXRxb3ZndGx0c2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjczMzYsImV4cCI6MjA3OTI0MzMzNn0.qtiT-6LnahH0tPRaeOkuRI7bhAmo_qJy5vCvb2gkE0M',
    
    // ===========================================
    // EXTERNAL APIs
    // ===========================================
    ETISALAT_API: 'https://www.etisalat.ae/b2c/eshop/getPostPaidPlanProduct',
    
    // ===========================================
    // PERFORMANCE SETTINGS
    // ===========================================
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
    ENABLE_CACHE: true,
    ENABLE_OFFLINE_MODE: true,
    
    // ===========================================
    // DEBUGGING
    // ===========================================
    DEBUG: false  // Set to true to see detailed console logs
};

// Make CONFIG globally accessible
window.CONFIG = CONFIG;

console.log('✅ Production config loaded for GitHub Pages');
