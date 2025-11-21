// Supabase CRUD helper for admin.html
// IMPORTANT: Replace these placeholders with your Supabase project values
const SUPABASE_URL = "REPLACE_WITH_SUPABASE_URL";
const SUPABASE_ANON_KEY = "REPLACE_WITH_SUPABASE_ANON_KEY";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let editingId = null;

async function loadList(){
  const type = document.getElementById('filterType').value || 'bundle';
  document.getElementById('itemsTbody').innerHTML = '<tr><td colspan="3">Loading…</td></tr>';
  try{
    const { data, error } = await sb.from('shortcuts').select('*').eq('type', type).order('id', {ascending:true});
    if(error) throw error;
    renderList(data || []);
  }catch(e){
    console.error(e);
    document.getElementById('itemsTbody').innerHTML = `<tr><td colspan="3">Error loading: ${e.message}</td></tr>`;
  }
}

function renderList(items){
  const tbody = document.getElementById('itemsTbody');
  if(!items.length) { tbody.innerHTML = '<tr><td colspan="3">No items</td></tr>'; return }
  tbody.innerHTML = '';
  items.forEach(it => {
    const tr = document.createElement('tr');
    const keywords = it.keywords || '';
    tr.innerHTML = `
      <td>${escapeHtml(it.name || '')}</td>
      <td class="muted">${escapeHtml(keywords)}</td>
      <td class="actions">
        <button class="small" onclick='editItem(${it.id})'>Edit</button>
        <button class="small" style="background:#6c757d" onclick='deleteItem(${it.id})'>Delete</button>
        <a class="small" href="${escapeAttr(it.link||'#')}" target="_blank" style="background:#0d6efd">Open</a>
      </td>`;
    tbody.appendChild(tr);
  });
}

function resetForm(){
  editingId = null;
  document.getElementById('nameField').value = '';
  document.getElementById('keywordsField').value = '';
  document.getElementById('linkField').value = '';
  document.getElementById('cprField').value = '';
}

async function saveItem(){
  const type = document.getElementById('typeField').value;
  const name = document.getElementById('nameField').value.trim();
  const keywords = document.getElementById('keywordsField').value.trim();
  const link = document.getElementById('linkField').value.trim();
  const cprRaw = document.getElementById('cprField').value.trim();
  let cpr = null;
  if(cprRaw) {
    try{ cpr = JSON.parse(cprRaw); }catch(e){ alert('CPR must be valid JSON'); return }
  }

  if(!name){ alert('Name is required'); return }

  try{
    if(editingId){
      const { error } = await sb.from('shortcuts').update({ name, keywords, link, type, cpr }).eq('id', editingId);
      if(error) throw error;
      editingId = null;
    }else{
      // create id: use timestamp-based big int if not provided
      const id = Date.now();
      const { error } = await sb.from('shortcuts').insert([{ id, name, keywords, link, type, cpr }]);
      if(error) throw error;
    }
    resetForm();
    loadList();
  }catch(e){
    console.error(e);
    alert('Save failed: ' + (e.message||e));
  }
}

async function editItem(id){
  try{
    const { data, error } = await sb.from('shortcuts').select('*').eq('id', id).single();
    if(error) throw error;
    editingId = id;
    document.getElementById('typeField').value = data.type || 'bundle';
    document.getElementById('nameField').value = data.name || '';
    document.getElementById('keywordsField').value = data.keywords || '';
    document.getElementById('linkField').value = data.link || '';
    document.getElementById('cprField').value = data.cpr ? JSON.stringify(data.cpr, null, 2) : '';
  }catch(e){ console.error(e); alert('Failed to load item: '+(e.message||e)) }
}

async function deleteItem(id){
  if(!confirm('Delete item?')) return;
  try{
    const { error } = await sb.from('shortcuts').delete().eq('id', id);
    if(error) throw error;
    loadList();
  }catch(e){ console.error(e); alert('Delete failed: '+(e.message||e)) }
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]) }
function escapeAttr(s){ if(!s) return '#'; return String(s).replace(/"/g,'&quot;') }

// Initialize
document.addEventListener('DOMContentLoaded', ()=>{
  // Small validation to ensure user updated keys
  if(SUPABASE_URL.includes('REPLACE') || SUPABASE_ANON_KEY.includes('REPLACE')){
    console.warn('Please set SUPABASE_URL and SUPABASE_ANON_KEY in assets/js/supabase-crud.js');
  }
  // default filter
  loadList();
});
