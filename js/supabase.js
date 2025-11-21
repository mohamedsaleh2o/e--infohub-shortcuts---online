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
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase library not loaded');
            return;
        }

        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            console.error('❌ Supabase credentials not configured');
            return;
        }

        try {
            this.supabase = window.supabase.createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_ANON_KEY
            );
            console.log('✅ Supabase initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
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
        if (!CONFIG.ENABLE_CACHE) return false;
        const cache = this.cache[type];
        return cache.data && (Date.now() - cache.timestamp < CONFIG.CACHE_DURATION);
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
            const cached = localStorage.getItem(`cache_${type}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < CONFIG.CACHE_DURATION) {
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

            if (error) throw error;

            // Update cache
            this.updateCache(table, data || []);
            return data || [];
        } catch (error) {
            console.error(`❌ Error fetching ${table}:`, error);
            // Return cached or localStorage data as fallback
            return this.loadFromLocalStorage(table) || [];
        }
    }

    // ===== CREATE Operations =====
    async create(table, item) {
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
            const { data, error } = await this.supabase
                .from(table)
                .insert([item])
                .select();

            if (error) throw error;

            // Update cache
            const cached = this.cache[table].data || [];
            this.updateCache(table, [data[0], ...cached]);

            return data[0];
        } catch (error) {
            console.error(`❌ Error creating ${table}:`, error);
            console.error('Error details:', error.message, error.details, error.hint);
            throw error;
        }
    }

    // ===== UPDATE Operations =====
    async update(table, id, updates) {
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
            const { data, error } = await this.supabase
                .from(table)
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;

            // Update cache
            const cached = this.cache[table].data || [];
            const updated = cached.map(item => 
                item.id === id ? data[0] : item
            );
            this.updateCache(table, updated);

            return data[0];
        } catch (error) {
            console.error(`❌ Error updating ${table}:`, error);
            throw error;
        }
    }

    // ===== DELETE Operations =====
    async delete(table, id) {
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

            if (error) throw error;

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
const db = new SupabaseManager();
