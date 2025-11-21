// 🔌 Integration Helper - Connect UI to Supabase Database
// Add these functions to your index.html <script> section

// ===== REPLACE YOUR loadData() FUNCTION WITH THIS =====
async function loadData() {
    try {
        showLoading();
        updateProgress(0, 'Initializing...', 'Connecting to database');
        console.log('📦 Loading data...');

        // Check if Supabase is configured
        const useSupabase = typeof db !== 'undefined' && db && db.supabase;

        if (useSupabase) {
            // Load from Supabase with automatic caching
            updateProgress(20, 'Loading bundles...', 'Fetching from cloud/cache');
            data.bundles = await db.getAll('bundles');
            
            updateProgress(40, 'Loading addons...', 'Fetching from cloud/cache');
            data.addons = await db.getAll('addons');
            
            updateProgress(60, 'Loading SLAs...', 'Fetching from cloud/cache');
            data.sla = await db.getAll('slas');
            
            updateProgress(70, 'Loading navigators...', 'Fetching from cloud/cache');
            data.navigator = await db.getAll('navigators');
            
            updateProgress(80, 'Loading scenarios...', 'Fetching from cloud/cache');
            data.scenarios = await db.getAll('scenarios');

            console.log('✅ Data loaded from Supabase');
        } else {
            console.warn('⚠️ Supabase not configured - using localStorage only');
            
            // Fallback to localStorage
            updateProgress(20, 'Loading saved data...', 'Reading from local storage');
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const savedData = JSON.parse(saved);
                data.bundles = savedData.bundles || [];
                data.addons = savedData.addons || [];
                data.sla = savedData.sla || [];
                data.navigator = savedData.navigator || [];
                data.scenarios = savedData.scenarios || [];
                console.log('✅ Data loaded from localStorage');
            }
        }

        // If no bundles, fetch from API and save to Supabase
        if (data.bundles.length === 0) {
            updateProgress(85, 'Generating bundles...', 'Fetching from Etisalat API');
            console.log('🌐 No cached bundles - fetching from API...');
            const apiBundles = await generateBundlesFromAPI();
            
            // Save to Supabase if available
            if (useSupabase) {
                updateProgress(90, 'Saving bundles...', 'Syncing to cloud');
                for (const bundle of apiBundles) {
                    await db.create('bundles', bundle);
                }
                data.bundles = await db.getAll('bundles'); // Refresh from Supabase
                console.log('💾 Bundles saved to Supabase');
            } else {
                data.bundles = apiBundles;
                saveData(); // Fallback to localStorage
            }
        }

        updateProgress(100, 'Complete!', 'All data loaded');
        console.log(`📊 Total items - Bundles: ${data.bundles.length}, Scenarios: ${data.scenarios.length}`);
        
        // Small delay to show 100% before hiding
        await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('⚠️ Failed to load data. Check console for details.');
    } finally {
        hideLoading();
    }

    console.log('🚀 Rendering UI...');
    renderAll();
}

// ===== REPLACE YOUR saveItem() FUNCTION WITH THIS =====
async function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    const keywords = document.getElementById('itemKeywords').value.trim();
    
    let item;
    const useSupabase = typeof db !== 'undefined' && db && db.supabase;
    
    if (currentType === 'sla') {
        const time = document.getElementById('itemTime').value.trim();
        
        if (!name || !time) {
            alert('Please fill in name and time duration');
            return;
        }
        
        item = {
            name,
            keywords,
            time
        };
        
        if (useSupabase) {
            await db.create('slas', item);
            data.sla = await db.getAll('slas');
        } else {
            item.id = Date.now();
            data.sla.push(item);
            saveData();
        }
        
    } else if (currentType === 'navigator') {
        const path = document.getElementById('itemPath').value.trim();
        
        if (!name || !path) {
            alert('Please fill in name and navigation path');
            return;
        }
        
        item = {
            name,
            keywords,
            path
        };
        
        if (useSupabase) {
            await db.create('navigators', item);
            data.navigator = await db.getAll('navigators');
        } else {
            item.id = Date.now();
            data.navigator.push(item);
            saveData();
        }
        
    } else if (currentType === 'scenario') {
        const description = document.getElementById('itemDescription').value.trim();
        const tag = document.getElementById('itemTag').value;
        
        if (!name) {
            alert('Please fill in the scenario title');
            return;
        }
        
        item = {
            title: name,
            keywords,
            description,
            tag
        };
        
        if (useSupabase) {
            await db.create('scenarios', item);
            data.scenarios = await db.getAll('scenarios');
        } else {
            item.id = Date.now();
            item.timestamp = new Date().toISOString();
            data.scenarios.push(item);
            saveData();
        }
        
    } else {
        const link = document.getElementById('itemLink').value.trim();
        
        if (!name || !link) {
            alert('Please fill in name and link');
            return;
        }
        
        item = {
            name,
            keywords,
            link
        };
        
        // Add CPR data for bundles and addons
        if (currentType === 'bundle' || currentType === 'addon') {
            const cprDuration = document.getElementById('cprDuration').value.trim();
            const cprFees = document.getElementById('cprFees').value.trim();
            const cprDiscounts = document.getElementById('cprDiscounts').value.trim();
            const cprAllowance = document.getElementById('cprAllowance').value.trim();
            const cprRestrictions = document.getElementById('cprRestrictions').value.trim();
            const cprExitCharge = document.getElementById('cprExitCharge').value.trim();
            
            // Only add CPR if at least one field is filled
            if (cprDuration || cprFees || cprDiscounts || cprAllowance || cprRestrictions || cprExitCharge) {
                item.cpr = {
                    duration: cprDuration,
                    fees: cprFees,
                    discounts: cprDiscounts,
                    allowance: cprAllowance,
                    restrictions: cprRestrictions,
                    exitCharge: cprExitCharge
                };
            }
        }
        
        const table = currentType === 'bundle' ? 'bundles' : 'addons';
        
        if (useSupabase) {
            await db.create(table, item);
            data[currentType === 'bundle' ? 'bundles' : 'addons'] = await db.getAll(table);
        } else {
            item.id = Date.now();
            if (currentType === 'bundle') {
                data.bundles.push(item);
            } else {
                data.addons.push(item);
            }
            saveData();
        }
    }

    closeModal();
    renderAll();
    console.log('✅ Item saved successfully');
}

// ===== REPLACE YOUR deleteItem() FUNCTION WITH THIS =====
async function deleteItem(type, id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    const useSupabase = typeof db !== 'undefined' && db && db.supabase;
    
    try {
        if (useSupabase) {
            // Map type to table name
            const tableMap = {
                'bundle': 'bundles',
                'addon': 'addons',
                'sla': 'slas',
                'navigator': 'navigators',
                'scenario': 'scenarios'
            };
            
            const table = tableMap[type];
            await db.delete(table, id);
            
            // Refresh data
            const dataKey = type === 'scenario' ? 'scenarios' : (type === 'navigator' ? 'navigator' : (type === 'sla' ? 'sla' : type + 's'));
            data[dataKey] = await db.getAll(table);
        } else {
            // Fallback to localStorage
            if (type === 'bundle') {
                data.bundles = data.bundles.filter(item => item.id !== id);
            } else if (type === 'addon') {
                data.addons = data.addons.filter(item => item.id !== id);
            } else if (type === 'devicec') {
                data.devicec = data.devicec.filter(item => item.id !== id);
            } else if (type === 'sla') {
                data.sla = data.sla.filter(item => item.id !== id);
            } else if (type === 'navigator') {
                data.navigator = data.navigator.filter(item => item.id !== id);
            } else if (type === 'scenario') {
                data.scenarios = data.scenarios.filter(item => item.id !== id);
            }
            saveData();
        }

        renderAll();
        console.log('✅ Item deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
    }
}

// ===== ADD NEW FUNCTION: refreshCurrentTab() =====
async function refreshCurrentTab() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('spinning');
    
    try {
        const useSupabase = typeof db !== 'undefined' && db && db.supabase;
        
        if (!useSupabase) {
            alert('⚠️ Supabase not configured. Please set up config.js');
            return;
        }

        console.log('🔄 Refreshing current tab data...');
        
        // Map current type to table name
        const typeToTable = {
            'bundles': 'bundles',
            'addons': 'addons',
            'sla': 'slas',
            'navigator': 'navigators',
            'scenarios': 'scenarios'
        };
        
        const table = typeToTable[currentType];
        if (table) {
            // Force refresh from Supabase (clear cache)
            const refreshedData = await db.refresh(table);
            
            // Update local data
            if (currentType === 'bundles') {
                data.bundles = refreshedData;
            } else if (currentType === 'addons') {
                data.addons = refreshedData;
            } else if (currentType === 'sla') {
                data.sla = refreshedData;
            } else if (currentType === 'navigator') {
                data.navigator = refreshedData;
            } else if (currentType === 'scenarios') {
                data.scenarios = refreshedData;
            }
            
            renderAll();
            console.log(`✅ ${currentType} refreshed from Supabase`);
        }
    } catch (error) {
        console.error('❌ Error refreshing:', error);
        alert('Failed to refresh data');
    } finally {
        refreshBtn.classList.remove('spinning');
    }
}

// ===== INSTRUCTIONS =====
console.log(`
🚀 SUPABASE INTEGRATION READY!

To complete setup:
1. Copy js/config.template.js to js/config.js
2. Add your Supabase credentials to config.js
3. Run the SQL from supabase-setup.sql in Supabase SQL Editor
4. Refresh this page

Your app will now:
✅ Save all data to Supabase cloud database
✅ Cache data locally for 5 minutes (fast loading)
✅ Work offline (changes sync when back online)
✅ Support multi-device sync

See SUPABASE_SETUP.md for detailed instructions.
`);
