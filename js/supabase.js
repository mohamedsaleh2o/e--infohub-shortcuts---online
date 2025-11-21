// 🗄️ Supabase Database Manager
// High-performance CRUD operations with automatic caching

class SupabaseManager {
    constructor() {
        this.supabase = null;
        this.cache = {
            bundles: { data: null, timestamp: 0 },
            addons: { data: null, timestamp: 0 },
            slas: { data: null, timestamp: 0 },
            navigators: { data: null, timestamp: 0 },
            scenarios: { data: null, timestamp: 0 }
        };
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        
        this.init();
        this.setupOnlineListener();
    }

    init() {
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient === 'undefined') {
            console.error('❌ Supabase library not loaded. Make sure the CDN script is included before this file.');
            console.error('Add: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
            return;
        }

        // Check if CONFIG is defined (check both global and window scope)
        const config = (typeof CONFIG !== 'undefined') ? CONFIG : window.CONFIG;
        
        if (!config) {
            console.error('❌ CONFIG not defined. Make sure js/config.js is loaded before js/supabase.js');
            return;
        }

        // Check if credentials are configured
        if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
            console.error('❌ Supabase credentials not configured in js/config.js');
            return;
        }

        // Validate credentials format
        if (config.SUPABASE_URL.includes('your-project') || config.SUPABASE_ANON_KEY.includes('your-anon-key')) {
            console.error('❌ Supabase credentials are placeholder values. Please update js/config.js with real credentials.');
            return;
        }

        try {
            // Create Supabase client
            this.supabase = window.supabase.createClient(
                config.SUPABASE_URL,
                config.SUPABASE_ANON_KEY
            );
            
            console.log('✅ Supabase initialized successfully');
            console.log('   URL:', config.SUPABASE_URL);
            console.log('   Key:', config.SUPABASE_ANON_KEY.substring(0, 20) + '...');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            console.error('   Error details:', error.message);
        }
    }

    setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online - syncing pending changes...');
            this.syncPendingChanges();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Offline mode activated');
        });
    }

    // Check if cache is valid
    isCacheValid(type) {
        const config = (typeof CONFIG !== 'undefined') ? CONFIG : window.CONFIG;
        if (!config || !config.ENABLE_CACHE) return false;
        const cache = this.cache[type];
        return cache.data && (Date.now() - cache.timestamp < config.CACHE_DURATION);
    }

    // Update cache
    updateCache(type, data) {
        this.cache[type] = {
            data: data,
            timestamp: Date.now()
        };
        // Also save to localStorage as backup
        this.saveToLocalStorage(type, data);
    }

    // Save to localStorage
    saveToLocalStorage(type, data) {
        try {
            localStorage.setItem(`cache_${type}`, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('⚠️ Failed to save to localStorage:', error);
        }
    }

    // Load from localStorage
    loadFromLocalStorage(type) {
        try {
            const config = (typeof CONFIG !== 'undefined') ? CONFIG : window.CONFIG;
            const cached = localStorage.getItem(`cache_${type}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                const cacheDuration = (config && config.CACHE_DURATION) ? config.CACHE_DURATION : 300000; // 5 min default
                if (Date.now() - parsed.timestamp < cacheDuration) {
                    return parsed.data;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load from localStorage:', error);
        }
        return null;
    }

    // ===== READ Operations =====
    async getAll(table) {
        // Check if Supabase is initialized
        if (!this.supabase) {
            console.warn(`⚠️ Supabase not initialized - loading ${table} from localStorage`);
            return this.loadFromLocalStorage(table) || [];
        }

        // Check cache first
        if (this.isCacheValid(table)) {
            console.log(`📦 Loading ${table} from cache`);
            return this.cache[table].data;
        }

        // If offline, try localStorage
        if (!this.isOnline) {
            console.log(`📴 Offline - loading ${table} from localStorage`);
            return this.loadFromLocalStorage(table) || [];
        }

        // Fetch from Supabase
        try {
            console.log(`☁️ Fetching ${table} from Supabase...`);
            const { data, error } = await this.supabase
                .from(table)
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error(`❌ Supabase error fetching ${table}:`, error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                throw error;
            }

            console.log(`✅ Fetched ${data?.length || 0} items from ${table}`);
            
            // Extract data from JSONB column (NoSQL style)
            const extractedData = data.map(row => ({
                ...row.data,  // Spread the JSON data
                id: row.id,   // Keep the database ID
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
            
            // Update cache
            this.updateCache(table, extractedData || []);
            return extractedData || [];
        } catch (error) {
            console.error(`❌ Error fetching ${table}:`, error);
            // Return cached or localStorage data as fallback
            const fallback = this.loadFromLocalStorage(table) || [];
            console.log(`   Returning ${fallback.length} items from fallback storage`);
            return fallback;
        }
    }

    // ===== CREATE Operations =====
    async create(table, item) {
        // Check if Supabase is initialized
        if (!this.supabase) {
            console.error(`❌ Supabase not initialized - cannot create ${table} item`);
            throw new Error('Supabase not initialized');
        }

        // If offline, queue for later sync
        if (!this.isOnline) {
            console.log(`📴 Offline - queuing ${table} create for sync`);
            this.pendingSync.push({ action: 'create', table, item });
            
            // Add to cache immediately with temporary ID
            const tempId = Date.now();
            const tempItem = { ...item, id: tempId, _temp: true };
            const cached = this.cache[table].data || [];
            this.updateCache(table, [tempItem, ...cached]);
            
            return tempItem;
        }

        try {
            console.log(`☁️ Creating ${table} item...`);
            console.log('   Item data:', JSON.stringify(item, null, 2));
            
            // Remove id from item if it exists (database will generate it)
            const { id, created_at, updated_at, ...itemData } = item;
            
            // Wrap item in data field (NoSQL style)
            const payload = {
                data: itemData
            };
            
            const { data, error } = await this.supabase
                .from(table)
                .insert([payload])
                .select();

            if (error) {
                console.error(`❌ Supabase error creating ${table}:`, error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                console.error('   Hint:', error.hint);
                throw error;
            }

            console.log(`✅ ${table} saved to Supabase with ID:`, data[0]?.id);

            // Extract and return the saved item
            const savedItem = {
                ...data[0].data,
                id: data[0].id,
                created_at: data[0].created_at,
                updated_at: data[0].updated_at
            };

            // Update cache
            const cached = this.cache[table].data || [];
            this.updateCache(table, [savedItem, ...cached]);

            return savedItem;
        } catch (error) {
            console.error(`❌ Error creating ${table}:`, error);
            console.error('Error details:', error.message, error.details, error.hint);
            throw error;
        }
    }

    // ===== UPDATE Operations =====
    async update(table, id, updates) {
        // Check if Supabase is initialized
        if (!this.supabase) {
            console.error(`❌ Supabase not initialized - cannot update ${table} item`);
            throw new Error('Supabase not initialized');
        }

        if (!this.isOnline) {
            console.log(`📴 Offline - queuing ${table} update for sync`);
            this.pendingSync.push({ action: 'update', table, id, updates });
            
            // Update cache immediately
            const cached = this.cache[table].data || [];
            const updated = cached.map(item => 
                item.id === id ? { ...item, ...updates } : item
            );
            this.updateCache(table, updated);
            
            return { ...updates, id };
        }

        try {
            console.log(`☁️ Updating ${table} item ${id}...`);
            console.log('   Updates:', JSON.stringify(updates, null, 2));

            // Remove metadata fields from updates
            const { id: _, created_at, updated_at, ...updateData } = updates;
            
            // Wrap updates in data field (NoSQL style)
            const payload = {
                data: updateData
            };

            const { data, error } = await this.supabase
                .from(table)
                .update(payload)
                .eq('id', id)
                .select();

            if (error) {
                console.error(`❌ Supabase error updating ${table}:`, error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                throw error;
            }

            console.log(`✅ ${table} item ${id} updated in Supabase`);

            // Extract updated item
            const updatedItem = {
                ...data[0].data,
                id: data[0].id,
                created_at: data[0].created_at,
                updated_at: data[0].updated_at
            };

            // Update cache
            const cached = this.cache[table].data || [];
            const updated = cached.map(item => 
                item.id === id ? updatedItem : item
            );
            this.updateCache(table, updated);

            return updatedItem;
        } catch (error) {
            console.error(`❌ Error updating ${table}:`, error);
            throw error;
        }
    }

    // ===== DELETE Operations =====
    async delete(table, id) {
        // Check if Supabase is initialized
        if (!this.supabase) {
            console.error(`❌ Supabase not initialized - cannot delete ${table} item`);
            throw new Error('Supabase not initialized');
        }

        if (!this.isOnline) {
            console.log(`📴 Offline - queuing ${table} delete for sync`);
            this.pendingSync.push({ action: 'delete', table, id });
            
            // Remove from cache immediately
            const cached = this.cache[table].data || [];
            const filtered = cached.filter(item => item.id !== id);
            this.updateCache(table, filtered);
            
            return true;
        }

        try {
            console.log(`☁️ Deleting ${table} item ${id}...`);
            const { error } = await this.supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                console.error(`❌ Supabase error deleting ${table}:`, error);
                console.error('   Code:', error.code);
                console.error('   Message:', error.message);
                console.error('   Details:', error.details);
                throw error;
            }

            console.log(`✅ ${table} item ${id} deleted from Supabase`);

            // Remove from cache
            const cached = this.cache[table].data || [];
            const filtered = cached.filter(item => item.id !== id);
            this.updateCache(table, filtered);

            return true;
        } catch (error) {
            console.error(`❌ Error deleting ${table}:`, error);
            throw error;
        }
    }

    // ===== Sync pending changes when back online =====
    async syncPendingChanges() {
        if (this.pendingSync.length === 0) return;

        console.log(`🔄 Syncing ${this.pendingSync.length} pending changes...`);
        
        for (const change of this.pendingSync) {
            try {
                switch (change.action) {
                    case 'create':
                        await this.create(change.table, change.item);
                        break;
                    case 'update':
                        await this.update(change.table, change.id, change.updates);
                        break;
                    case 'delete':
                        await this.delete(change.table, change.id);
                        break;
                }
            } catch (error) {
                console.error('❌ Failed to sync change:', change, error);
            }
        }

        this.pendingSync = [];
        console.log('✅ All changes synced');
    }

    // ===== Clear cache =====
    clearCache(table = null) {
        if (table) {
            this.cache[table] = { data: null, timestamp: 0 };
            localStorage.removeItem(`cache_${table}`);
            console.log(`🗑️ Cleared ${table} cache`);
        } else {
            // Clear all caches
            Object.keys(this.cache).forEach(key => {
                this.cache[key] = { data: null, timestamp: 0 };
                localStorage.removeItem(`cache_${key}`);
            });
            console.log('🗑️ Cleared all caches');
        }
    }

    // ===== Refresh data =====
    async refresh(table) {
        console.log(`🔄 Force refreshing ${table}...`);
        this.clearCache(table);
        return await this.getAll(table);
    }
}

// Initialize global instance
// Only initialize if CONFIG is defined (loaded from config.js)
let db = null;

try {
    const config = (typeof CONFIG !== 'undefined') ? CONFIG : window.CONFIG;
    if (config) {
        db = new SupabaseManager();
        console.log('✅ Database manager initialized');
    } else {
        console.warn('⚠️ CONFIG not found yet. Database manager will initialize when CONFIG loads.');
    }
} catch (error) {
    console.error('❌ Failed to initialize database manager:', error);
}

// Make db globally accessible
window.db = db;
