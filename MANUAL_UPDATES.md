# 📝 Manual HTML Updates Required

Since automated replacement had formatting issues, please manually update your `index.html` with these changes:

---

## 🔄 Step 1: Update refreshBundles() function

**Find this line (~line 1692):**
```html
<button class="refresh-btn" onclick="refreshBundles()">🔄</button>
```

**Replace with:**
```html
<button class="refresh-btn" onclick="refreshCurrentTab()" id="refreshBtn">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
</button>
```

---

## 📦 Step 2: Update loadData() function

**Find the loadData() function (around line 2220)**

**Replace entire function with:**
```javascript
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
        console.log(`📊 Total bundles: ${data.bundles.length}, scenarios: ${data.scenarios.length}`);
        
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
```

---

## 💾 Step 3: Update saveItem() function

**Find the saveItem() function (around line 2450)**

**Add this at the very beginning of the function (after the variable declarations):**
```javascript
const useSupabase = typeof db !== 'undefined' && db && db.supabase;
```

**Then update each section:**

### For SLA section:
```javascript
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
```

### For Navigator section:
```javascript
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
```

### For Scenario section:
```javascript
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
```

### For Bundle/Addon section:
**After creating the item with CPR, replace the save logic:**
```javascript
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
```

---

## 🗑️ Step 4: Update deleteItem() function

**Find the deleteItem() function**

**Replace entire function with:**
```javascript
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
            if (type === 'bundle') {
                data.bundles = await db.getAll('bundles');
            } else if (type === 'addon') {
                data.addons = await db.getAll('addons');
            } else if (type === 'sla') {
                data.sla = await db.getAll('slas');
            } else if (type === 'navigator') {
                data.navigator = await db.getAll('navigators');
            } else if (type === 'scenario') {
                data.scenarios = await db.getAll('scenarios');
            }
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
```

---

## ➕ Step 5: Add new refreshCurrentTab() function

**Add this new function anywhere after the loadData() function:**
```javascript
async function refreshCurrentTab() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('spinning');
    
    try {
        const useSupabase = typeof db !== 'undefined' && db && db.supabase;
        
        if (!useSupabase) {
            alert('⚠️ Supabase not configured. Using cached data.');
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
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 500);
    }
}
```

---

## ✅ Verification

After making all changes, check browser console for:
```
✅ Supabase initialized
📦 Loading data...
☁️ Fetching bundles from Supabase...
✅ Data loaded from Supabase
```

---

## 🎯 That's it!

Your app now has full Supabase integration with:
- ☁️ Cloud database
- ⚡ Smart caching
- 📴 Offline support
- 🔄 Refresh button

See `INTEGRATION_COMPLETE.md` for testing and next steps.
