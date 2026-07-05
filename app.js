// SPA mode — all views on one page, portal switching via state.activePortal
const IS_SPA = true;
const PAGE_ROLE = null;
const IS_LOGIN_PAGE = false;

const statuses = [
  "New Request Received",         // 0
  "Under Review",                 // 1
  "Pre-Quote Sent",               // 2
  "Pre-Quote Approved",           // 3
  "Device Received at Desk",      // 4
  "Diagnosis Completed",          // 5
  "Diagnosed Quote Sent",         // 6
  "Diagnosed Quote Approved",     // 7
  "Device Under Repair",          // 8
  "Quality Check in Progress",    // 9
  "Repair Completed",             // 10
  "Coordinator Reviewing",        // 11
  "Final Invoice Sent",           // 12
  "Payment Method Selection",     // 13
  "Payment Confirmed",            // 14
  "Delivery Assignment",          // 15
  "Device Out for Delivery",      // 16
  "Device Delivered",             // 17
  "Payment Completed",            // 18
  "Request Closed",               // 19
  "Repair Declined by Customer",  // 20
  "Device Returned to Customer"   // 21
];

const orderStatuses = [
  "Pending Pickup",
  "Pickup Assigned",
  "Picked Up",
  "Out for Delivery",
  "Delivered"
];

const storageKey = "repairingmaster-state";
const ownerCommissionRate = 0.10;

const portalAccess = {
  customer: ["customer", "marketplace"],
  marketplace: ["marketplace"],
  technician: ["technician"],
  repairmaster: ["repairmaster", "marketplace"],
  coordinator: ["coordinator", "customer", "technician"],
  admin: ["customer", "coordinator", "technician", "repairmaster", "admin", "marketplace"]
};

const portalLanding = {
  customer: "customer",
  marketplace: "marketplace",
  technician: "technician",
  repairmaster: "repairmaster",
  coordinator: "coordinator",
  admin: "admin"
};

const portalNames = {
  service: "Customer Access",
  marketplace: "Device on sell",
  technician: "Technician Portal",
  repairmaster: "RepairingMaster Portal",
  coordinator: "Coordinator Portal",
  admin: "Admin Portal"
};

const defaultDeviceIcon = "image/device-repair.png";

let state = {};

function displayPrice(basePrice) {
  return Math.round(Number(basePrice || 0) * (1 + ownerCommissionRate));
}

const initialMarketplace = [
  { model: "iPhone 13 Pro", grade: "A+", basePrice: 41817, warranty: "12 months", owner: "FixHub Andheri", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Galaxy S23 Ultra", grade: "A", basePrice: 38181, warranty: "9 months", owner: "TechCare Koramangala", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Pixel 8", grade: "B", basePrice: 26363, warranty: "6 months", owner: "Prime Mobile Lab Noida", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "OnePlus 12", grade: "A", basePrice: 34545, warranty: "9 months", owner: "FixHub Andheri", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "iPhone 12", grade: "C", basePrice: 20000, warranty: "3 months", owner: "TechCare Koramangala", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Galaxy Z Flip 5", grade: "B", basePrice: 36363, warranty: "6 months", owner: "Prime Mobile Lab Noida", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Xiaomi 14", grade: "A+", basePrice: 31817, warranty: "12 months", owner: "FixHub Andheri", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "iPad Mini", grade: "A", basePrice: 30000, warranty: "9 months", owner: "TechCare Koramangala", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "iPod Touch 7", grade: "A", basePrice: 13636, warranty: "6 months", owner: "Prime Mobile Lab Noida", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Fast Charger 45W", grade: "A+", basePrice: 1364, warranty: "12 months", owner: "FixHub Andheri", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Wireless Earphone", grade: "A", basePrice: 2273, warranty: "6 months", owner: "TechCare Koramangala", sold: false, images: [defaultDeviceIcon], currentSlide: 0 },
  { model: "Necklace Earphone", grade: "B", basePrice: 1818, warranty: "3 months", owner: "Prime Mobile Lab Noida", sold: false, images: [defaultDeviceIcon], currentSlide: 0 }
];

const defaultState = {
  activeView: "customer",
  activePortal: null,
  activeUser: null,
  activeRequestId: null,
  coordDetailMode: false,
  techDetailMode: false,
  rmDetailMode: false,
  custDetailMode: false,
  adminDetailMode: false,
  applications: [
    { name: "Admin Team", email: "admin@repairingmaster.in", phone: "+91-9999999999", role: "Admin", location: "All India", details: { "Qualifications & reason": "Platform operations manager" }, status: "Approved" },
    { name: "Testing Technician", email: "tech@test.repairmaster", phone: "+91-98765-01111", role: "Technician", location: "Test Lab", details: { "Qualifications & reason": "Demo technician account" }, status: "Approved" },
    { name: "Testing RepairMaster", email: "rm@test.repairmaster", phone: "+91-98765-02222", role: "RepairingMaster", location: "Test Lab", details: { "Qualifications & reason": "Demo repairmaster account" }, status: "Approved" }
  ],
  minServiceFee: 150,
  taxPercent: 18,
  serviceChargePercent: 10,
  baseInspectionFee: 100,
  repairParts: [
    { name: "Screen Replacement", cost: 2000, stock: 10 },
    { name: "Technician Charge", cost: 250, stock: 999 },
    { name: "Battery Replacement", cost: 2299, stock: 8 },
    { name: "Charging Port", cost: 1799, stock: 12 },
    { name: "Motherboard / IC Repair", cost: 3999, stock: 5 },
    { name: "Glass Replacement", cost: 1799, stock: 7 },
    { name: "Back Cover", cost: 999, stock: 15 }
  ],
  marketplace: initialMarketplace,
  marketOrders: [],
  requests: [],
  activeRequestId: null
};

const inventory = [
  { part: "iPhone 14 Pro OLED", stock: 8, health: "Available" },
  { part: "Samsung S24 Battery", stock: 3, health: "Low stock" },
  { part: "USB-C Charging Flex", stock: 19, health: "Available" },
  { part: "Water Damage Kit", stock: 6, health: "Available" }
];

const vendors = [
  { name: "FixHub Andheri", score: "96%", jobs: 42 },
  { name: "TechCare Koramangala", score: "91%", jobs: 35 },
  { name: "Prime Mobile Lab Noida", score: "89%", jobs: 29 }
];

let marketFilter = "All";

// ── Relational table helpers ──────────────────────
function rowToRequest(row) {
  const meta = row.metadata || {};
  const quote = row.quotation || {};
  return {
    id: row.code || `RM-${row.id}`,
    customer: row.customer_name || '',
    phone: row.phone || '',
    deviceType: row.device_type || 'Smartphone',
    brand: row.brand || '',
    model: row.model || '',
    issue: row.issue_description || '',
    address: row.address || '',
    statusIndex: row.status_index || 0,
    pickupTech: meta.pickupTech || '',
    repairPartner: meta.repairPartner || '',
    quoteAmount: quote.quoteAmount || 0,
    quoteApproved: meta.quoteApproved || false,
    paymentStatus: row.payment_status || 'Pending',
    paymentMethod: row.payment_method || '',
    invoiceSent: meta.invoiceSent || false,
    otpVerified: meta.otpVerified || false,
    pickupOtp: row.pickup_otp || '',
    rmOtp: meta.rmOtp || '',
    deliveryOtp: meta.deliveryOtp || '',
    deliveryOtpVerified: meta.deliveryOtpVerified || false,
    checks: meta.checks || { accepted: false, otp: false, photos: false, handover: false, delivery: false, payment_collected: false },
    conditionImages: row.condition_photos || [],
    requestImages: meta.requestImages || [],
    requirements: meta.requirements || { backCover: '', glassType: '' },
    quoteItems: quote.quoteItems || [],
    taxPercent: quote.taxPercent || 0,
    taxAmount: quote.taxAmount || 0,
    serviceChargePercent: quote.serviceChargePercent || 0,
    serviceChargeAmount: quote.serviceChargeAmount || 0,
    crmNotes: meta.crmNotes || [],
    customer_id: row.customer_id || null
  };
}

function requestToRow(r) {
  return {
    code: r.id,
    customer_name: r.customer || '',
    phone: r.phone || '',
    device_type: r.deviceType || 'Smartphone',
    brand: r.brand || '',
    model: r.model || '',
    issue_description: r.issue || '',
    address: r.address || '',
    status_index: r.statusIndex || 0,
    pickup_otp: r.pickupOtp || '',
    payment_method: r.paymentMethod || '',
    payment_status: r.paymentStatus || 'Pending',
    condition_photos: r.conditionImages || [],
    quotation: {
      quoteAmount: r.quoteAmount || 0,
      quoteItems: r.quoteItems || [],
      taxPercent: r.taxPercent || 0,
      taxAmount: r.taxAmount || 0,
      serviceChargePercent: r.serviceChargePercent || 0,
      serviceChargeAmount: r.serviceChargeAmount || 0
    },
    metadata: {
      pickupTech: r.pickupTech || '',
      repairPartner: r.repairPartner || '',
      quoteApproved: r.quoteApproved || false,
      invoiceSent: r.invoiceSent || false,
      otpVerified: r.otpVerified || false,
      rmOtp: r.rmOtp || '',
      deliveryOtp: r.deliveryOtp || '',
      deliveryOtpVerified: r.deliveryOtpVerified || false,
      checks: r.checks || { accepted: false, otp: false, photos: false, handover: false, delivery: false, payment_collected: false },
      requestImages: r.requestImages || [],
      requirements: r.requirements || { backCover: '', glassType: '' },
      crmNotes: r.crmNotes || []
    }
  };
}

function rowToMarketOrder(row) {
  const meta = row.metadata || {};
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerName: row.buyer_name || meta.buyerName || '',
    buyerEmail: row.buyer_email || meta.buyerEmail || '',
    buyerPhone: row.buyer_phone || meta.buyerPhone || '',
    address: row.address || meta.address || '',
    city: row.city || meta.city || '',
    itemModel: row.item_model || meta.itemModel || '',
    itemGrade: row.item_grade || meta.itemGrade || '',
    itemPrice: row.item_price || meta.itemPrice || 0,
    repairMaster: row.repair_master || meta.repairMaster || '',
    assignedTech: row.assigned_tech || meta.assignedTech || '',
    statusIndex: row.status_index || 0,
    created_at: row.created_at
  };
}

function marketOrderToRow(o) {
  return {
    id: o.id || undefined,
    listing_id: o.listingId || null,
    buyer_name: o.buyerName || '',
    buyer_email: o.buyerEmail || '',
    buyer_phone: o.buyerPhone || '',
    address: o.address || '',
    city: o.city || '',
    item_model: o.itemModel || '',
    item_grade: o.itemGrade || '',
    item_price: o.itemPrice || 0,
    repair_master: o.repairMaster || '',
    assigned_tech: o.assignedTech || '',
    status_index: o.statusIndex || 0,
    metadata: {
      buyerName: o.buyerName || '',
      buyerEmail: o.buyerEmail || '',
      buyerPhone: o.buyerPhone || '',
      address: o.address || '',
      city: o.city || '',
      itemModel: o.itemModel || '',
      itemGrade: o.itemGrade || '',
      itemPrice: o.itemPrice || 0,
      repairMaster: o.repairMaster || '',
      assignedTech: o.assignedTech || ''
    }
  };
}

function rowToListing(row) {
  const meta = row.metadata || {};
  return {
    id: row.id,
    title: row.title || meta.title || '',
    description: row.description || meta.description || '',
    basePrice: row.base_price || meta.basePrice || 0,
    images: row.images || meta.images || [defaultDeviceIcon],
    sold: row.sold || false,
    city: row.city || meta.city || '',
    model: meta.model || '',
    grade: meta.grade || '',
    warranty: meta.warranty || '',
    owner: meta.owner || '',
    repairMaster: meta.repairMaster || '',
    currentSlide: 0
  };
}

function listingToRow(item) {
  return {
    id: item.id || undefined,
    title: item.title || item.model || '',
    description: item.description || '',
    base_price: item.basePrice || 0,
    images: item.images || [defaultDeviceIcon],
    sold: item.sold || false,
    city: item.city || '',
    metadata: {
      model: item.model || '',
      grade: item.grade || '',
      warranty: item.warranty || '',
      owner: item.owner || '',
      repairMaster: item.repairMaster || '',
      title: item.title || '',
      description: item.description || '',
      basePrice: item.basePrice || 0,
      images: item.images || [defaultDeviceIcon],
      city: item.city || ''
    }
  };
}

let _stateLoadFailed = false;
const LOCAL_BACKUP_KEY = 'repairmaster_local_backup';
const LEGACY_STORAGE_KEY = 'repairingmaster-state-v5';

function saveLocalState(data) {
  try { localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(data)); } catch {}
}

function loadLocalState(key) {
  try { return JSON.parse(localStorage.getItem(key || LOCAL_BACKUP_KEY)); } catch { return null; }
}

function loadState() {
  // Fast path: return localStorage backup immediately (synchronous)
  let localBackup = loadLocalState(LOCAL_BACKUP_KEY);
  // Fallback to legacy storage key (v5 from old app.js) — migrate if found
  if (!localBackup || !localBackup.requests) {
    const legacy = loadLocalState(LEGACY_STORAGE_KEY);
    if (legacy && legacy.requests) {
      localBackup = legacy;
      saveLocalState(legacy);
    }
  }
  if (localBackup && localBackup.requests) {
    _stateLoadFailed = false;
    return localBackup;
  }
  return structuredClone(defaultState);
}

async function loadStateFromSupabase() {
  try {
    const [rrRes, appsRes, blobRes, ordersRes, listingsRes] = await Promise.all([
      supabase.from('repair_requests').select('*').order('id'),
      supabase.from('applications').select('*').order('id'),
      supabase.from('app_state').select('data').eq('id', 1).single(),
      supabase.from('market_orders').select('*').order('id'),
      supabase.from('marketplace_listings').select('*').order('id')
    ]);

    const blob = (blobRes.data && blobRes.data.data) ? blobRes.data.data : {};

    let requests = (rrRes.data || []).map(rowToRequest);
    const oldRequests = blob.requests || [];
    if (!requests.length && oldRequests.length) {
      const rows = oldRequests.map(requestToRow);
      const { error } = await supabase.from('repair_requests').insert(rows);
      if (!error) requests = oldRequests.map(r => ({ ...r, conditionImages: r.conditionImages || [], requestImages: r.requestImages || [], phone: r.phone || '', deviceType: r.deviceType || 'Smartphone', invoiceSent: r.invoiceSent || false, paymentMethod: r.paymentMethod || '', requirements: r.requirements || { backCover: '', glassType: '' }, quoteItems: r.quoteItems || [], taxPercent: r.taxPercent || 0, taxAmount: r.taxAmount || 0, serviceChargePercent: r.serviceChargePercent || 0, serviceChargeAmount: r.serviceChargeAmount || 0, crmNotes: r.crmNotes || [] }));
      else requests = oldRequests.map(r => ({ ...r, conditionImages: r.conditionImages || [], requestImages: r.requestImages || [] }));
    }

    let applications = (appsRes.data || []).map(a => ({
      id: a.id, name: a.name, email: a.email || '', phone: a.phone || '',
      role: a.role, location: a.location || '', details: a.details || {}, status: a.status
    }));
    const oldApps = blob.applications || [];
    if (!applications.length && oldApps.length) {
      const { data: insertedApps, error } = await supabase.from('applications').insert(oldApps).select();
      if (!error && insertedApps) {
        applications = insertedApps.map(a => ({
          id: a.id, name: a.name, email: a.email || '', phone: a.phone || '',
          role: a.role, location: a.location || '', details: a.details || {}, status: a.status
        }));
      } else {
        applications = oldApps.map((a, i) => ({ ...a, id: -(i + 1) }));
      }
    }
    const defaultApps = structuredClone(defaultState.applications);
    defaultApps.forEach(a => { if (!applications.some(x => x.name === a.name && x.role && x.role.toLowerCase() === a.role.toLowerCase())) applications.push(a); });

    let marketOrders = (ordersRes.data || []).map(rowToMarketOrder);
    if (!marketOrders.length && (blob.marketOrders || []).length) {
      marketOrders = blob.marketOrders;
    }

    let marketplace = (listingsRes.data || []).map(rowToListing);
    if (!marketplace.length && (blob.marketplace || []).length) {
      marketplace = (blob.marketplace || structuredClone(defaultState.marketplace)).map(item => {
        if (item.price && !item.basePrice) return { ...item, basePrice: Math.round(item.price / (1 + ownerCommissionRate)), price: undefined };
        if (!item.images) return { ...item, images: item.image ? [item.image] : [defaultDeviceIcon], currentSlide: 0 };
        return { ...item, currentSlide: item.currentSlide || 0 };
      });
    }

    const repairParts = blob.repairParts || structuredClone(defaultState.repairParts);
    const baseInspectionFee = blob.baseInspectionFee !== undefined ? blob.baseInspectionFee : 100;
    const taxPercent = blob.taxPercent !== undefined ? blob.taxPercent : 18;
    const serviceChargePercent = blob.serviceChargePercent !== undefined ? blob.serviceChargePercent : 10;
    const minServiceFee = blob.minServiceFee !== undefined ? blob.minServiceFee : 150;

    const result = {
      ...structuredClone(defaultState),
      applications, requests, marketplace, marketOrders,
      repairParts, baseInspectionFee, taxPercent, serviceChargePercent, minServiceFee
    };
    // Save to localStorage for future offline loads
    saveLocalState(result);
    return result;
  } catch (e) {
    console.error('Supabase load failed:', e);
    return null;
  }
}

function saveState() {
  saveLocalState(state);
  try { localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(state)); } catch {}
  syncToSupabase().catch(() => {});
}

async function syncToSupabase() {
  if (_stateLoadFailed) return;
  try {
    const reqRows = (state.requests || []).map(requestToRow);
    if (reqRows.length) await supabase.from('repair_requests').upsert(reqRows, { onConflict: 'code' });

    const appRows = (state.applications || []).map(a => ({
      id: a.id || undefined,
      name: a.name, email: a.email || '', phone: a.phone || '',
      role: a.role, location: a.location || '', details: a.details || {}, status: a.status
    }));
    if (appRows.length) await supabase.from('applications').upsert(appRows, { onConflict: 'name,role', ignoreDuplicates: false });

    const orderRows = (state.marketOrders || []).map(marketOrderToRow);
    if (orderRows.length) await supabase.from('market_orders').upsert(orderRows, { onConflict: 'id', ignoreDuplicates: false });

    const listingRows = (state.marketplace || []).map(listingToRow);
    if (listingRows.length) await supabase.from('marketplace_listings').upsert(listingRows, { onConflict: 'id', ignoreDuplicates: false });

    const { data: existingBlob } = await supabase.from('app_state').select('data').eq('id', 1).single();
    const mergedData = { ...(existingBlob?.data || {}), repairParts: state.repairParts || [], serviceChargePercent: state.serviceChargePercent || 10, baseInspectionFee: state.baseInspectionFee || 100, taxPercent: state.taxPercent || 18, minServiceFee: state.minServiceFee || 150 };
    await supabase.from('app_state').upsert({ id: 1, data: mergedData });
  } catch (e) {
    console.error('Supabase sync failed:', e);
  }
}

function formatCurrency(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function commissionFor(price) {
  return Math.round(Number(price || 0) * ownerCommissionRate);
}

function activeRequest() {
  const allRequests = state.requests || [];
  const matched = allRequests.find((request) => request.id === state.activeRequestId);
  if (matched) return matched;
  // Role-specific: find first assigned request
  const user = state.activeUser;
  if (user && user.role === 'technician') {
    return state.requests.find(r => (r.pickupTech === user.name || r.pickupTech.startsWith(user.name + ' \u2014') || r.pickupTech.startsWith(user.name + ' -')) && r.statusIndex < 19) || null;
  }
  if (user && user.role === 'repairmaster') {
    return state.requests.find(r => (r.repairPartner === user.name || r.repairPartner.startsWith(user.name + ' \u2014') || r.repairPartner.startsWith(user.name + ' -')) && r.statusIndex < 19) || null;
  }
  if (user && user.role === 'customer') {
    const cleanName = (user.name || '').trim();
    return state.requests.find(r => (r.customer || '').trim() === cleanName) || null;
  }
  return null;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function allowedViews() {
  return portalAccess[state.activePortal] || [];
}

function switchView(view) {
  const allowed = allowedViews();
  const nextView = allowed.length && !allowed.includes(view) ? allowed[0] : view;
  state.activeView = nextView;

  document.querySelectorAll(".view").forEach((panel) => {
    panel.classList.toggle("active", panel.id === nextView);
  });

  const titles = {
    customer: "Customer App",
    coordinator: "Coordinator Dashboard",
    technician: "Technician App",
    repairmaster: "RepairingMaster Portal",
    admin: "Admin Console",
    marketplace: "Device on sell"
  };

  document.getElementById("operationSelect").value = nextView;
  document.getElementById("pageTitle").textContent = titles[nextView];
  document.getElementById("advanceStatus").classList.toggle("hidden", ["marketplace", "admin", "coordinator"].includes(nextView));
  document.querySelector(".status-strip").classList.toggle("hidden", ["marketplace", "admin"].includes(nextView));
  saveState();
  saveSession();
}

// ─── Hash-based routing for per-request URLs ─────
const ROLE_DETAIL_MODES = {
  coordinator: 'coordDetailMode',
  technician: 'techDetailMode',
  repairmaster: 'rmDetailMode',
  customer: 'custDetailMode',
  admin: 'adminDetailMode'
};

function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || '';
  const parts = hash.split('/').filter(Boolean);
  if (!hash) {
    return;
  }
  let matched = false;
  // Support #request/ID and #role/request/ID
  if (parts[0] === 'request' && parts[1]) {
    const rid = parts[1];
    if (state.requests.find(r => r.id === rid)) {
      state.activeRequestId = rid;
      const modeKey = ROLE_DETAIL_MODES[state.activePortal];
      if (modeKey) {
        Object.values(ROLE_DETAIL_MODES).forEach(k => state[k] = false);
        state[modeKey] = true;
        renderAll();
        saveSession();
      }
      matched = true;
    }
  }
  // Cross-page format: #role/request/ID — only process if role matches active portal
  const role = parts[0];
  if (!matched && parts[1] === 'request' && parts[2]) {
    const modeKey = ROLE_DETAIL_MODES[role];
    if (modeKey && state.requests.find(r => r.id === parts[2]) && (!state.activePortal || role === state.activePortal)) {
      state.activeRequestId = parts[2];
      Object.values(ROLE_DETAIL_MODES).forEach(k => state[k] = false);
      state[modeKey] = true;
      if (state.activePortal) { renderAll(); saveSession(); }
      matched = true;
    }
  }
  if (!matched) {
    if (state.activePortal) history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

window.addEventListener('hashchange', handleRoute);
// Handle initial hash on page load (runs after loadState in initApp)

function switchPortal(role, requestId) {
  state.activePortal = role;
  state.activeView = portalLanding[role] || role;
  if (requestId) {
    state.activeRequestId = requestId;
    const modeKey = ROLE_DETAIL_MODES[role];
    if (modeKey) {
      Object.values(ROLE_DETAIL_MODES).forEach(k => state[k] = false);
      state[modeKey] = true;
    }
  }
  renderAll();
  saveSession();
  showToast(`${portalNames[role]} opened`);
}

function closeRoleDetail(role) {
  const modeKey = ROLE_DETAIL_MODES[role];
  if (modeKey) state[modeKey] = false;
  window.location.hash = '#' + role;
  renderAll();
}

function applyPortalAccess() {
  const allowed = allowedViews();
  const select = document.getElementById("operationSelect");
  Array.from(select.options).forEach((option) => {
    option.hidden = allowed.length > 0 && !allowed.includes(option.value);
    option.disabled = option.hidden;
  });
  document.getElementById("portalEyebrow").textContent = `${portalNames[state.activePortal] || "Portal"} - India operations`;
}

function saveSession() {
  try { localStorage.setItem('repairmaster_session', JSON.stringify({ activePortal: state.activePortal, activeUser: state.activeUser, activeRequestId: state.activeRequestId })); } catch {}
}
function clearSession() {
  try { localStorage.removeItem('repairmaster_session'); } catch {}
}

function loginPortal(portal) {
  state.activePortal = portal;
  state.activeView = portalLanding[portal] || 'customer';
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = '';
  renderAll();
  saveSession();
  showToast(`${portalNames[portal]} opened`);
}

function updateUserBadge() {
  const user = state.activeUser || { name: "User", email: "", role: state.activePortal };
  document.getElementById("userName").textContent = user.name;
  const roleLabel = ({ customer:"Customer", marketplace:"Marketplace Buyer", technician:"Technician", repairmaster:"RepairingMaster", coordinator:"Coordinator", admin:"Admin" })[user.role || state.activePortal] || user.role || state.activePortal || "";
  document.getElementById("userRoleBadge").textContent = roleLabel;
  document.getElementById("userAvatar").textContent = (user.name || "U").charAt(0).toUpperCase();
}

function logoutPortal() {
  state.activePortal = null;
  state.activeUser = null;
  state.activeRequestId = null;
  clearSession();
  saveState();
  signOutUser().catch(() => {});
  document.getElementById('loginScreen').style.display = '';
  document.getElementById('appShell').style.display = 'none';
  window.location.hash = '';
}

function renderProgress() {
  const request = activeRequest();
  if (!request) {
    document.getElementById("statusText").textContent = "No active request";
    document.getElementById("progressTrack").style.display = "none";
    return;
  }
  const si = request.statusIndex;
  document.getElementById("statusText").textContent = statuses[si];
  const next = si < statuses.length - 1 ? statuses[si + 1] : '—';
  document.getElementById("nextStatusText").textContent = next;
  document.getElementById("progressTrack").style.display = "flex";
}

function renderCustomer() {
  // Detail mode
  if (state.custDetailMode) {
    document.getElementById("custDashboard").style.display = 'none';
    document.getElementById("custRequestView").style.display = '';
    renderCustDetail(activeRequest());
    return;
  }
  document.getElementById("custDashboard").style.display = '';
  document.getElementById("custRequestView").style.display = 'none';

  const request = activeRequest();
  document.getElementById("activeRequestLabel").textContent = request ? request.id : "—";
  document.getElementById("activeRequestMeta").textContent = request ? `${request.model} - ${request.issue}` : "";
  document.getElementById("deviceTitle").textContent = request ? request.model : "—";
  document.getElementById("deviceIssue").textContent = request ? `${request.issue}, pickup from ${request.address}` : "";
  // Show first uploaded image in device hero
  const heroImg = document.getElementById("deviceHeroImage");
  if (heroImg && request) {
    const allImgs = [...(request.requestImages || []), ...(request.conditionImages || [])].filter(Boolean);
    if (allImgs.length) {
      heroImg.innerHTML = `<img src="${allImgs[0]}" alt="Device" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      heroImg.textContent = '📱';
    }
  }
  const nameInput = document.getElementById("nameInput");
  if (nameInput && state.activeUser && state.activeUser.name) {
    nameInput.value = state.activeUser.name;
  }

  // Hide customer panel if no active request
  let panel = document.getElementById("customerPanel");
  if (!request) {
    if (panel) panel.style.display = 'none';
    return;
  }
  if (panel) panel.style.display = '';

  // Status guidance — role-specific message per status
  const guidance = document.getElementById("statusGuidance");
  if (guidance) {
    const customerMsgs = {
      0: "Your request has been submitted. A coordinator will review and accept it shortly.",
      1: "Your request is under review. Please provide your back cover and glass preferences below to help us prepare an accurate quotation.",
      2: "Your pre-quote is ready. Review the details and approve to proceed.",
      3: "Pre-quote approved! We'll schedule a pickup for your device.",
      4: "A technician has been assigned for pickup. Keep your device ready.",
      5: "Your device has been delivered to the repair center. Diagnosis in progress.",
      6: "Diagnosis complete. The repairmaster has sent a diagnosed quote. Review and approve, or decline.",
      7: "Diagnosed quote approved. The repairmaster will begin repairs shortly.",
      8: "Your device is under repair.",
      9: "Quality check in progress.",
      10: "Repair completed! Coordinator will send the final invoice shortly.",
      11: "Coordinator is reviewing the completed repair.",
      12: "Final invoice sent! Add any items you need (back cover, charger, etc.), then select payment method.",
      13: "Select your payment method.",
      14: "Payment received. Delivery will be arranged.",
      15: "Delivery technician assigned. Your device is on the way!",
      16: "Your device is out for delivery!",
      17: "Device delivered. Thank you for choosing RepairingMaster!",
       18: "Payment completed. Thank you!",
       19: "Request closed. Thank you!",
       20: `You have declined the diagnosed quote. A return technician will contact you for device delivery. Diagnosis fee (₹${state.baseInspectionFee || 100}) and service fee (₹${state.minServiceFee || 150}) apply.`,
       21: "Your device has been returned. Thank you for your time."
     };
     guidance.textContent = request.statusIndex === 2 && request.preQuoteSentToRm && !request.preQuoteConfirmedByRm
       ? "Your pre-quote is being reviewed by our repair team. We'll notify you once it's ready for approval."
       : (customerMsgs[request.statusIndex] || '');
  }

  // Requirements section - show at status 1 (under review) before quote sent
  const reqSection = document.getElementById("requirementsSection");
  if (reqSection) {
    reqSection.style.display = request.statusIndex === 1 ? "block" : "none";
    if (request.requirements) {
      document.getElementById("backCoverInput").value = request.requirements.backCover || "";
      document.getElementById("glassInput").value = request.requirements.glassType || "";
    }
  }

  // Quote section
  const quoteBox = document.querySelector(".quote-box");
  if (quoteBox) {
    const hideFromCust = request.statusIndex === 2 && request.preQuoteSentToRm && !request.preQuoteConfirmedByRm;
    const showQuote = !hideFromCust && (request.quoteAmount > 0 || request.statusIndex >= 2);
    quoteBox.style.display = showQuote ? "" : "none";
  }
  document.getElementById("quoteAmount").textContent = formatCurrency(request.quoteAmount);
  const hideFromCust2 = request.statusIndex === 2 && request.preQuoteSentToRm && !request.preQuoteConfirmedByRm;
  if (hideFromCust2) {
    document.getElementById("quoteStatus").textContent = "Pre-quote under RM review";
  } else if (request.statusIndex >= 3) {
    document.getElementById("quoteStatus").textContent = "Quotation approved, repair can proceed";
  } else if (request.statusIndex >= 2) {
    document.getElementById("quoteStatus").textContent = "Waiting for customer approval";
  } else {
    document.getElementById("quoteStatus").textContent = "Waiting for quotation";
  }
  const hideApprove = request.statusIndex === 2 && request.preQuoteSentToRm && !request.preQuoteConfirmedByRm;
  document.getElementById("approveQuote").disabled = hideApprove || request.quoteApproved || request.statusIndex < 2 || request.statusIndex > 3;
  document.getElementById("approveQuote").textContent = hideApprove ? "Waiting for RM" : (request.quoteApproved ? "Approved" : "Approve");

  const itemsContainer = document.getElementById("quoteItemsList");
  if (itemsContainer) {
    if (request.quoteItems && request.quoteItems.length) {
      const base = request.quoteItems.reduce((s, i) => s + i.cost, 0);
      const scAmt = request.serviceChargeAmount || 0;
      const taxAmt = request.taxAmount || 0;
      const subtotalAmt = request.quoteAmount - taxAmt - scAmt;
      itemsContainer.innerHTML = request.quoteItems.map((item) => `
        <div class="quote-item-row">
          <span>${item.name}</span>
          <span>${formatCurrency(item.cost)}</span>
        </div>
      `).join("") + `
        <div class="quote-item-row quote-item-base">
          <span>Diagnosis fee</span>
          <span>${formatCurrency(state.baseInspectionFee || 100)}</span>
        </div>
        <div class="quote-item-row quote-item-subtotal">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotalAmt)}</span>
        </div>
        ${scAmt ? `
        <div class="quote-item-row">
          <span>Service charge (${request.serviceChargePercent || 0}%)</span>
          <span>${formatCurrency(scAmt)}</span>
        </div>
        ` : ""}
        ${taxAmt ? `
        <div class="quote-item-row">
          <span>GST (${request.taxPercent || 0}%)</span>
          <span>${formatCurrency(taxAmt)}</span>
        </div>
        ` : ""}
        <div class="quote-item-row quote-item-total">
          <span>Total</span>
          <span>${formatCurrency(request.quoteAmount)}</span>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = "";
    }
  }

  // Repair quote approval
  const repairQuoteDiv = document.getElementById("repairQuoteSection") || (() => {
    const d = document.createElement('div'); d.id = 'repairQuoteSection'; d.className = 'quote-box';
    const customerPanel2 = document.querySelector('#customerPanel .device-hero')?.parentNode;
    if (customerPanel2) customerPanel2.appendChild(d);
    return d;
  })();
  if (repairQuoteDiv) {
    const showRepairQuote = request.statusIndex === 6;
    const hasItems = request.repairQuoteItems && request.repairQuoteItems.length;
    repairQuoteDiv.style.display = showRepairQuote ? '' : 'none';
    if (showRepairQuote) {
      repairQuoteDiv.innerHTML = hasItems ? `
        <div><p class="eyebrow">Repair Quote</p><h3>Repairmaster has sent a repair quotation</h3>
        <div class="quote-items">${request.repairQuoteItems.map(i => `
          <div class="quote-item-row"><span>${i.name}</span><span>${formatCurrency(i.cost)}</span></div>
        `).join('')}</div></div>
        <div class="rd-info-card" style="margin-top:8px;background:#fefaf0;border:1px solid #f39c12;font-size:12px;color:#856404">
          <strong>ℹ Note:</strong> If you decline this repair quote, a <strong>diagnosis fee (₹${state.baseInspectionFee || 100})</strong> and a <strong>service fee (₹${state.minServiceFee || 150})</strong> will apply. The device will be returned to you.
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="primary-action" id="approveRepairQuote" style="flex:1">✓ Approve Repair Quote</button>
          <button class="secondary-action" id="rejectRepairQuote" style="flex:1;background:#fde8e8;color:#c0392b;border:1px solid #e74c3c">✗ Decline</button>
        </div>`
        : `<p style="font-size:13px;color:var(--muted)">No extra parts needed. Proceeding with repair.</p>`;
    }
  }

  // Final invoice with payment - show at status 12 (invoice sent, customer can add items & pay)
  const addonSection = document.getElementById("addonSection") || (() => {
    const d = document.createElement('div'); d.id = 'addonSection'; d.style.cssText = 'margin:10px 0;padding:12px;background:#f8f9fa;border-radius:8px';
    const customerPanel2 = document.querySelector('#customerPanel .device-hero')?.parentNode;
    if (customerPanel2) customerPanel2.appendChild(d);
    return d;
  })();
  if (addonSection) {
    const showAddon = request.statusIndex === 12;
    addonSection.style.display = showAddon ? '' : 'none';
    if (showAddon) {
      const addonItems = request.addonItems || [];
      const totalWithAddons = (request.quoteAmount || 0) + addonItems.reduce((s, i) => s + i.cost, 0);
      addonSection.innerHTML = `
        <p class="eyebrow">Final Invoice</p>
        <h3 style="margin:0 0 6px;font-size:14px">Base amount: ${formatCurrency(request.quoteAmount || 0)}</h3>
        <div id="addonItemsList">${addonItems.length ? '<p style="font-size:12px;color:var(--muted);margin:4px 0">Additional items:</p>' + addonItems.map(i => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span>${i.name}</span><span>${formatCurrency(i.cost)}</span></div>`).join('') : '<p style="color:var(--muted);font-size:13px">No additional items added yet</p>'}</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <input id="addonNameInput" placeholder="Item name" style="flex:1">
          <input id="addonCostInput" type="number" placeholder="Price" style="width:80px">
          <button class="secondary-action" id="addAddonBtn">Add</button>
        </div>
        <p style="font-size:14px;font-weight:600;margin:8px 0">Total: ${formatCurrency(totalWithAddons)}</p>
        <div style="display:flex;gap:8px">
          <button class="primary-action" id="payOnlineBtn" style="flex:1">Pay Online</button>
          <button class="secondary-action" id="payCodBtn" style="flex:1">Cash on Delivery</button>
        </div>
      `;
    }
  }

  // Condition upload - show before pickup (status 3-5)
  const condSection = document.getElementById("conditionSection");
  if (condSection) {
    condSection.style.display = (request.statusIndex >= 3 && request.statusIndex <= 5) ? "" : "none";
  }

  const cv = document.getElementById("conditionPreviews");
  if (cv) {
    cv.innerHTML = request.conditionImages.map((img) => `<img src="${img}" alt="Device condition" loading="lazy">`).join("");
  }

  // Invoice & payment section - show from Invoice Sent through Delivery
  const invSection = document.getElementById("invoiceSection");
  if (invSection) {
    const showInvoice = request.statusIndex >= 12 && request.statusIndex <= 18;
    invSection.style.display = showInvoice ? "block" : "none";
    document.getElementById("invoiceAmount").textContent = formatCurrency((request.quoteAmount || 0) + ((request.addonItems || []).reduce((s, i) => s + i.cost, 0)));
    const payOnlineBtn = document.getElementById("payOnlineBtn");
    const payCodBtn = document.getElementById("payCodBtn");
    const confirmEl = document.getElementById("paymentConfirmation");
    if (request.paymentMethod === "Online") {
      confirmEl.textContent = request.statusIndex >= 18 ? "Payment received. Thank you!" : "Online payment selected. Awaiting confirmation.";
      confirmEl.style.display = "block";
      if (payOnlineBtn) payOnlineBtn.style.display = "none";
      if (payCodBtn) payCodBtn.style.display = "none";
    } else if (request.paymentMethod === "Cash on Delivery") {
      confirmEl.textContent = request.statusIndex >= 17 ? "COD payment collected. Thank you!" : "Cash on Delivery selected. Pay when delivered.";
      confirmEl.style.display = "block";
      if (payOnlineBtn) payOnlineBtn.style.display = "none";
      if (payCodBtn) payCodBtn.style.display = "none";
    } else if (request.statusIndex === 12) {
      confirmEl.style.display = "none";
      if (payOnlineBtn) payOnlineBtn.style.display = "";
      if (payCodBtn) payCodBtn.style.display = "";
    } else if (request.statusIndex === 13) {
      confirmEl.style.display = "block";
      confirmEl.textContent = "Payment method selected. Awaiting confirmation.";
      if (payOnlineBtn) payOnlineBtn.style.display = "none";
      if (payCodBtn) payCodBtn.style.display = "none";
    } else {
      confirmEl.style.display = "none";
      if (payOnlineBtn) payOnlineBtn.style.display = "none";
      if (payCodBtn) payCodBtn.style.display = "none";
    }
  }

  // Show customer panel when there's an active request for this customer
  panel = document.getElementById("customerPanel");
  if (panel) {
    const myName = state.activeUser ? state.activeUser.name : "";
    const myRequests = state.requests.filter(r => r.customer === myName);
    panel.style.display = myRequests.length ? "block" : "none";
  }

  // Customer request list (if multiple requests)
  const custName = state.activeUser?.name || '';
  const myReqs = state.requests.filter(r => r.customer === custName);
  const reqListEl = document.getElementById("custRequestsList");
  if (reqListEl) {
    if (myReqs.length <= 1) {
      reqListEl.style.display = 'none';
    } else {
      reqListEl.style.display = '';
      reqListEl.innerHTML = myReqs.map(r => `
        <button class="request-row" onclick="navigateTo('#customer/request/${r.id}')" style="text-align:left;width:100%">
          <div><h3>${r.id} — ${r.model}</h3><p>${r.issue}</p></div>
          <span class="status-pill">${statuses[r.statusIndex]}</span>
        </button>
      `).join('');
    }
  }

  renderLocalDeals();

  document.getElementById("customerTimeline").innerHTML = statuses.map((status, index) => {
    const stateClass = index < request.statusIndex ? "done" : index === request.statusIndex ? "current" : "";
    const note = index < request.statusIndex ? "Completed" : index === request.statusIndex ? "Current step" : "Upcoming";
    return `
      <div class="timeline-item ${stateClass}">
        <span class="timeline-dot"></span>
        <div><strong>${status}</strong><br><span>${note}</span></div>
      </div>
    `;
  }).join("");
}

function renderCustDetail(req) {
  if (!req) { document.getElementById("custRequestContent").innerHTML = '<div class="empty-state">Request not found</div>'; return; }
  document.getElementById("custDetailTitle").textContent = `${req.id} — ${req.model}`;
  document.getElementById("custDetailStatus").textContent = statuses[req.statusIndex];
  const content = document.getElementById("custRequestContent");
  const imgs = [...(req.requestImages || []), ...(req.conditionImages || [])].filter(Boolean);
  const customerMsgs = {
    0: "Your request has been submitted. A coordinator will review and accept it shortly.",
    1: "Your request is under review. Please provide your back cover and glass preferences below to help us prepare an accurate quotation.",
    2: "Your pre-quote is ready. Review the details and approve to proceed.",
    3: "Pre-quote approved! We'll schedule a pickup for your device.",
    4: "A technician has been assigned for pickup. Keep your device ready. Pickup OTP: " + (req.pickupOtp || '4821'),
    5: "Your device has been delivered to the repair center. Diagnosis in progress.",
    6: "Diagnosis complete. The repairmaster has sent a diagnosed quote. Review, approve, or decline.",
    7: "Diagnosed quote approved. The repairmaster will begin repairs shortly.",
    8: "Your device is under repair.",
    9: "Quality check in progress.",
    10: "Repair completed! Coordinator will send the final invoice shortly.",
    11: "Coordinator is reviewing the completed repair.",
    12: "Final invoice sent! Add items if needed, then select payment.",
    13: "Select your payment method.",
    14: "Payment confirmed. Delivery will be arranged.",
    15: "Delivery technician assigned. Your device is on the way!",
    16: "Your device is out for delivery! Share OTP with technician: " + (req.deliveryOtp || '3847'),
    17: "Device delivered. Thank you for choosing RepairingMaster!",
    18: "Payment completed. Thank you!",
    19: "Request closed. Thank you!",
    20: "You have declined the diagnosed quote. A return technician will contact you for device delivery. Diagnosis fee (₹100) and service fee (₹150) apply.",
    21: "Your device has been returned. Thank you for your time."
  };
  const timeStr = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—';
  content.innerHTML = `
    <div class="rd-action-card" style="border-left:4px solid var(--teal)">
      <div class="rd-action-header"><span class="rd-action-step">Status</span></div>
      <p class="rd-action-msg">${customerMsgs[req.statusIndex] || ''}</p>
    </div>
    <div class="rd-grid">
      <div class="rd-info-card">
        <p class="eyebrow">Request</p>
        <table class="coord-info-table">
          <tr><td>ID</td><td>${escHtml(req.id)}</td></tr>
          <tr><td>Created</td><td>${timeStr}</td></tr>
          <tr><td>Status</td><td>${statuses[req.statusIndex]}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Device</p>
        <table class="coord-info-table">
          <tr><td>Type</td><td>${escHtml(req.deviceType || 'Smartphone')}</td></tr>
          <tr><td>Brand</td><td>${req.brand || '—'}</td></tr>
          <tr><td>Model</td><td>${escHtml(req.model)}</td></tr>
          <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Quotation</p>
        ${req.quoteAmount ? '<p style="font-size:24px;font-weight:700;color:var(--teal)">' + formatCurrency(req.quoteAmount) + '</p>' : '<p style="color:var(--muted)">Awaiting quotation</p>'}
        ${req.quoteItems && req.quoteItems.length ? '<div style="font-size:12px">' + req.quoteItems.map(i => '<div style="display:flex;justify-content:space-between;padding:2px 0"><span>' + escHtml(i.name) + '</span><span>' + formatCurrency(i.cost) + '</span></div>').join('') + '</div>' : ''}
      </div>
      ${req.statusIndex === 4 ? '<div class="rd-info-card" style="background:#fefaf0;border:1px solid #f39c12"><p class="eyebrow">Pickup OTP</p><h2 style="font-size:28px;letter-spacing:6px;text-align:center;margin:8px 0">' + (req.pickupOtp || '4821') + '</h2><p style="font-size:12px;color:var(--muted);text-align:center">Share this OTP with the technician for pickup</p></div>' : ''}
      ${(req.statusIndex >= 15 && req.statusIndex <= 17) ? '<div class="rd-info-card" style="background:#e8f8f5;border:1px solid #27ae60"><p class="eyebrow">Delivery OTP</p><h2 style="font-size:28px;letter-spacing:6px;text-align:center;margin:8px 0">' + (req.deliveryOtp || '3847') + '</h2><p style="font-size:12px;color:var(--muted);text-align:center">Share this OTP with the delivery technician</p></div>' : ''}
    </div>
    <div class="rd-info-card" style="margin-top:14px">
      <p class="eyebrow">Notes from team</p>
      <div id="custCrmNotesList">${(req.crmNotes || []).length ? (req.crmNotes || []).map(n => '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--line)"><strong>' + escHtml(n.author || '—') + '</strong> <span style="color:var(--muted)">' + (n.date || '') + '</span><br>' + escHtml(n.text) + '</div>').join('') : '<span style="color:var(--muted);font-size:12px">No notes from the team yet</span>'}</div>
    </div>
    ${imgs.length ? '<div class="rd-info-card" style="margin-top:14px"><p class="eyebrow">Photos</p><div class="rd-photos">' + imgs.map(u => '<img src="' + u + '" loading="lazy">').join('') + '</div></div>' : ''}
    <div style="margin-top:16px" id="custDetailTimeline"></div>
  `;
  const tl = document.getElementById("custDetailTimeline");
  if (tl) {
    const si = req.statusIndex;
    const current = statuses[si] || 'Unknown';
    const next = si < statuses.length - 1 ? statuses[si + 1] : '—';
    tl.innerHTML = `
      <div class="rd-progress-compact" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border)">
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Current</div>
          <div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${current}</div>
        </div>
        <div style="width:24px;text-align:center;color:var(--muted)">→</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Next</div>
          <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${next}</div>
        </div>
      </div>`;
  }
}

document.getElementById("custDetailBackBtn")?.addEventListener("click", () => closeRoleDetail('customer'));

// Coordinator action needed per status
const COORD_ACTIONS = {
  0:  { urgency: 'critical', label: 'Accept & review',    msg: 'New request — accept and review customer requirements' },
  1:  { urgency: 'high',     label: 'Prepare quotation',  msg: 'Under review — evaluate device issue & send quotation to RM' },
   2:  { urgency: 'waiting',  label: 'RM reviewing',       msg: 'Pre-quote sent to RM for review — awaiting confirmation' },
   3:  { urgency: 'critical', label: 'Assign team',        msg: 'Customer approved — assign technician & repairmaster' },
  4:  { urgency: 'info',     label: 'Monitor pickup',     msg: 'Technician assigned — pickup in progress' },
  5:  { urgency: 'info',     label: 'Monitor diagnosis',  msg: 'Device at repair desk — repairmaster diagnosing' },
  6:  { urgency: 'info',     label: 'Review diagnosed quote', msg: 'Diagnosis completed — review RM diagnosed quote' },
  7:  { urgency: 'info',     label: 'Ready for repair',   msg: 'Diagnosed quote approved — waiting for RM to start' },
  8:  { urgency: 'info',     label: 'Monitor repair',     msg: 'Device under repair — monitor progress' },
  9:  { urgency: 'info',     label: 'Monitor QC',         msg: 'Repair in progress — quality check pending' },
  10: { urgency: 'info',     label: 'Repair completed',   msg: 'Quality check passed — repair done' },
  11: { urgency: 'critical', label: 'Send invoice',       msg: 'Repair completed — review and send final invoice' },
  12: { urgency: 'info',     label: 'Invoice sent',       msg: 'Final invoice sent — customer selects payment' },
  13: { urgency: 'waiting',  label: 'Payment selection',  msg: 'Customer selecting payment method' },
  14: { urgency: 'critical', label: 'Confirm payment',    msg: 'Payment method selected — confirm payment' },
  15: { urgency: 'high',     label: 'Assign delivery',    msg: 'Payment confirmed — assign technician for delivery' },
  16: { urgency: 'info',     label: 'Out for delivery',   msg: 'Device out for delivery' },
  17: { urgency: 'info',     label: 'Device delivered',   msg: 'Device delivered' },
  18: { urgency: 'done',     label: 'Payment completed',  msg: 'Payment completed — request closed' },
  19: { urgency: 'done',     label: 'Closed',             msg: 'Request closed' },
  20: { urgency: 'high',     label: 'Arrange return',     msg: 'Customer declined repair — assign return technician. Diagnosis fee + service charge apply.' },
  21: { urgency: 'done',     label: 'Device returned',    msg: 'Device returned to customer — request completed.' }
};

function getCoordActionsForRequest(r) {
  if (r.statusIndex === 2 && r.preQuoteConfirmedByRm) {
    return { urgency: 'info', label: 'Ready for customer', msg: 'RM confirmed pre-quote — customer has been notified for approval' };
  }
  const action = COORD_ACTIONS[r.statusIndex] || { urgency: 'info', label: 'Review', msg: '' };
  return action;
}

function escHtml(s) { return String(s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

function renderCoordinator() {
  if (state.coordDetailMode) {
    document.getElementById("coordinatorDashboard").style.display = 'none';
    document.getElementById("coordinatorRequestView").style.display = '';
    const req = activeRequest();
    renderCoordinatorRequestDetail(req);
    return;
  }
  document.getElementById("coordinatorDashboard").style.display = '';
  document.getElementById("coordinatorRequestView").style.display = 'none';

  const requests = state.requests || [];
  const open = requests.filter((r) => r.statusIndex < statuses.length - 1).length;
  const closed = requests.filter((r) => r.statusIndex === statuses.length - 1).length;
  const revenue = requests.reduce((sum, r) => sum + r.quoteAmount, 0);
  const uniqueCities = [...new Set(requests.map(r => r.address).filter(Boolean))];
  document.getElementById("openTickets").textContent = open;
  document.getElementById("revenueMetric").textContent = formatCurrency(revenue);
  document.getElementById("cityCount").textContent = uniqueCities.length;

  // Status group buckets
  const groups = [
    { key: 'new', label: 'New', icon: '🆕', siRange: [0,1] },
    { key: 'active', label: 'Active', icon: '⚡', siRange: [2,5] },
    { key: 'repair', label: 'Repair', icon: '🔧', siRange: [6,11] },
    { key: 'delivery', label: 'Delivery', icon: '🚚', siRange: [12,17] },
    { key: 'closed', label: 'Closed', icon: '✅', siRange: [18,21] }
  ];
  const activeFilter = state._coordFilter || 'all';

  // Build pending lists
  const critical = []; const high = []; const info = [];
  requests.forEach(r => {
    if (r.statusIndex >= statuses.length - 1) return;
    const a = getCoordActionsForRequest(r);
    if (a.urgency === 'critical') critical.push(r);
    else if (a.urgency === 'high') high.push(r);
    else if (a.urgency === 'info' || a.urgency === 'waiting') info.push(r);
  });
  const pendingCount = critical.length + high.length;
  document.getElementById("pendingActionCount").textContent = pendingCount;
  document.getElementById("pendingCountBadge").textContent = pendingCount;
  if (critical.length && state._lastCriticalCount !== critical.length) {
    showToast(`${critical.length} urgent action${critical.length > 1 ? 's' : ''} need attention`);
    state._lastCriticalCount = critical.length;
  } else if (!critical.length) state._lastCriticalCount = 0;

  const pendingEl = document.getElementById("pendingActionsList");
  const allPending = [...critical, ...high, ...info];
  pendingEl.innerHTML = allPending.length
    ? allPending.map(r => {
        const a = getCoordActionsForRequest(r);
        return `<div class="pending-action-item ${a.urgency === 'critical' ? 'urgent-critical' : a.urgency === 'high' ? 'urgent-high' : ''}" data-rid="${r.id}" onclick="navigateTo('#coordinator/request/${r.id}')">
          <span class="pending-action-icon">${a.urgency === 'critical' ? '🔴' : a.urgency === 'high' ? '🟠' : '🔵'}</span>
          <div class="pending-action-body">
            <strong>${r.id} — ${r.model}</strong>
            <span>${a.label}: ${a.msg}</span>
            <span class="pending-action-meta">${r.customer} · ${r.address || ''}</span>
          </div>
        </div>`;
      }).join('')
    : '<div class="empty-state" style="padding:10px;font-size:13px">All caught up</div>';

  // Filter tabs
  document.querySelectorAll('#coordFilterBar .segmented-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#coordFilterBar .segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state._coordFilter = btn.dataset.cf;
      renderCoordinator();
    };
  });

  // Grouped request list
  const listEl = document.getElementById("requestList");
  if (!requests.length) {
    listEl.innerHTML = '<div class="empty-state" style="padding:30px;text-align:center">No service requests yet. Create one from the Customer portal.</div>';
  } else {
    listEl.innerHTML = groups.map(g => {
      const filtered = requests.filter(r => r.statusIndex >= g.siRange[0] && r.statusIndex <= g.siRange[1]);
      if (filtered.length === 0) return '';
      if (activeFilter !== 'all' && activeFilter !== g.key) return '';
      const groupId = 'cg-' + g.key;
      const collapsed = state['_cg_collapsed_' + g.key] ? 'collapsed' : '';
      const bgHue = g.siRange[0] < 2 ? 10 : g.siRange[0] < 6 ? 200 : g.siRange[0] < 12 ? 280 : g.siRange[0] < 18 ? 120 : 0;
      return `<div class="coord-group">
        <div class="coord-group-header" data-cg="${g.key}" style="border-left:3px solid hsl(${bgHue},50%,45%)">
          <h3>${g.icon} ${g.label} <span class="coord-group-count">${filtered.length}</span></h3>
          <span style="font-size:11px;color:var(--muted)">${collapsed ? '▸ show' : '▾ hide'}</span>
        </div>
        <div class="coord-group-body ${collapsed}" id="${groupId}">
          ${filtered.map(r => {
            const si = r.statusIndex;
            const hue = Math.round(120 * (si / (statuses.length - 1)));
            const borderColor = `hsl(${hue}, 55%, 40%)`;
            return `<div class="request-row" data-request="${r.id}" style="border-left:3px solid ${borderColor}">
              <div style="min-width:0">
                <div style="display:flex;align-items:center;gap:4px;margin-bottom:1px">
                  <strong style="font-size:13px">${r.id}</strong>
                  <span style="font-size:11px;color:var(--muted)">${r.model}</span>
                </div>
                <p style="font-size:12px;margin:0;color:var(--muted)">${escHtml(r.customer)}${r.address ? ' · ' + escHtml(r.address) : ''}</p>
              </div>
              <span class="status-pill" style="font-size:10px;background:${borderColor};color:#fff;padding:2px 8px">${statuses[si]}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).filter(Boolean).join('') || '<div class="empty-state" style="padding:20px;text-align:center">No requests match this filter</div>';

    // Bind group header click (collapse)
    document.querySelectorAll('[data-cg]').forEach(h => {
      h.addEventListener('click', () => {
        const key = h.dataset.cg;
        state['_cg_collapsed_' + key] = !state['_cg_collapsed_' + key];
        renderCoordinator();
      });
    });
    // Bind request row click
    document.querySelectorAll('.coord-group-body .request-row[data-request]').forEach(row => {
      row.addEventListener('click', () => {
        navigateTo('#coordinator/request/' + row.dataset.request);
      });
    });
  }

  // Side panel
  const req = activeRequest();
  const detailEl = document.getElementById("coordinatorDetailContent");
  document.getElementById("detailPanelTitle").textContent = req ? `${req.id}` : 'Control desk';
  if (!req) {
    detailEl.innerHTML = '<div class="empty-state" style="padding:20px;font-size:13px">Select a request</div>';
  } else {
    const a = getCoordActionsForRequest(req);
    detailEl.innerHTML = `
      <p class="eyebrow" style="margin:0 0 4px">${statuses[req.statusIndex]}</p>
      <div style="background:${a.urgency === 'critical' ? '#fef5f5' : a.urgency === 'high' ? '#fefaf0' : '#f8fafb'};border-left:3px solid ${a.urgency === 'critical' ? '#e74c3c' : a.urgency === 'high' ? '#f39c12' : 'var(--line)'};padding:8px 10px;border-radius:4px;font-size:13px;margin-bottom:8px">
        <strong>${a.label}</strong>: ${a.msg}
      </div>
      <table class="coord-info-table">
        <tr><td>Customer</td><td>${escHtml(req.customer)}</td></tr>
        <tr><td>Phone</td><td>${escHtml(req.phone || '—')}</td></tr>
        <tr><td>Device</td><td>${req.brand || ''} ${escHtml(req.model)}</td></tr>
        <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
        <tr><td>Address</td><td>${escHtml(req.address)}</td></tr>
      </table>
      <button class="primary-action full" onclick="navigateTo('#coordinator/request/${req.id}')" style="margin-top:8px">Open full detail →</button>`;
  }

  const badge = document.getElementById("notifBadge");
  if (badge && state.activePortal === 'coordinator') {
    const bc = pendingActionCount();
    badge.textContent = bc || '';
    badge.style.display = bc ? 'flex' : 'none';
    badge.style.background = critical.length ? '#e74c3c' : '#f39c12';
  }
}

// ─── Full request detail wizard (step-by-step) ─────
function renderCoordinatorRequestDetail(req) {
  if (!req) { document.getElementById("coordinatorRequestContent").innerHTML = '<div class="empty-state">Request not found</div>'; return; }

  const a = getCoordActionsForRequest(req);
  const imgs = [...(req.requestImages || []), ...(req.conditionImages || [])].filter(Boolean);
  const isClosed = req.statusIndex >= statuses.length - 1;

  // Step progress — show only current and next status
  const si = req.statusIndex;
  const currentStatus = statuses[si] || 'Unknown';
  const nextStatus = si < statuses.length - 1 ? statuses[si + 1] : '—';

  document.getElementById("detailViewTitle").textContent = `${req.id} — ${req.model}`;
  document.getElementById("detailViewStatus").textContent = currentStatus;
  document.getElementById("detailViewStatus").className = `status-pill ${a.urgency === 'critical' ? 'pill-critical' : a.urgency === 'high' ? 'pill-high' : ''}`;

  const content = document.getElementById("coordinatorRequestContent");
  content.innerHTML = `
    <div class="rd-progress-compact" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border);margin-bottom:10px">
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Current</div>
        <div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${currentStatus}</div>
      </div>
      <div style="width:24px;text-align:center;color:var(--muted)">→</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Next</div>
        <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">${nextStatus}</div>
      </div>
    </div>

    ${!isClosed ? `
    <div class="rd-action-card" style="border-left:4px solid ${a.urgency === 'critical' ? '#e74c3c' : a.urgency === 'high' ? '#f39c12' : '#0b7f7a'}">
      <div class="rd-action-header">
        <span class="rd-action-step">Step ${req.statusIndex + 1}:</span>
        <span class="rd-action-label" style="font-weight:700;font-size:18px">${a.label}</span>
      </div>
      <p class="rd-action-msg">${a.msg}</p>
      ${req.rmOtp ? `<p style="font-size:12px;color:#8e44ad;margin:2px 0 6px">RM OTP: <strong>${req.rmOtp}</strong> — share with technician for device handover to RepairingMaster</p>` : ''}
      <div class="rd-action-buttons">${renderDetailActions(req)}</div>
    </div>` : '<div class="rd-action-card" style="background:#e8f4f3;text-align:center;padding:30px"><strong>✓ Request completed</strong></div>'}

    <div class="rd-grid">
      <div class="rd-info-card">
        <p class="eyebrow">Customer details</p>
        <table class="coord-info-table">
          <tr><td>Name</td><td>${escHtml(req.customer)}</td></tr>
          <tr><td>Phone</td><td>${escHtml(req.phone || '—')}</td></tr>
          <tr><td>Address</td><td>${escHtml(req.address)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Device details</p>
        <table class="coord-info-table">
          <tr><td>Type</td><td>${req.deviceType || 'Smartphone'}</td></tr>
          <tr><td>Brand</td><td>${req.brand || '—'}</td></tr>
          <tr><td>Model</td><td>${escHtml(req.model)}</td></tr>
          <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
        </table>
      </div>
      ${req.requirements && req.requirements.backCover ? `
      <div class="rd-info-card">
        <p class="eyebrow">Customer requirements</p>
        <table class="coord-info-table">
          <tr><td>Back cover</td><td>${escHtml(req.requirements.backCover)}</td></tr>
          <tr><td>Glass type</td><td>${escHtml(req.requirements.glassType)}</td></tr>
        </table>
      </div>` : ''}
      ${req.quoteAmount > 0 ? `
      <div class="rd-info-card">
        <p class="eyebrow">Quotation</p>
        <div style="font-size:24px;font-weight:700;color:var(--green)">${formatCurrency(req.quoteAmount)}</div>
        ${req.quoteItems?.length ? req.quoteItems.map(i => `<div class="quote-item-row"><span>${escHtml(i.name)}</span><span>${formatCurrency(i.cost)}</span></div>`).join('') : ''}
      </div>` : ''}
    </div>

    ${imgs.length ? `
    <div class="rd-info-card" style="margin-top:14px">
      <p class="eyebrow">Device photos</p>
      <div class="rd-photos">${imgs.map(url => `<img src="${url}" alt="Device photo" loading="lazy">`).join('')}</div>
    </div>` : ''}
    <div class="rd-info-card" style="margin-top:14px">
      <p class="eyebrow">CRM Notes</p>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="crmNoteInput" placeholder="Add a note..." style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:13px">
        <button id="crmNoteAddBtn" class="primary-action" style="white-space:nowrap">Add Note</button>
      </div>
      <div id="crmNotesList">${(req.crmNotes || []).map(n => '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--line)"><strong>' + escHtml(n.author || '—') + '</strong> <span style="color:var(--muted)">' + (n.date || '') + '</span><br>' + escHtml(n.text) + '</div>').join('') || '<span style="color:var(--muted);font-size:12px">No notes yet</span>'}</div>
    </div>
  `;
  document.getElementById("crmNoteAddBtn")?.addEventListener("click", () => {
    const input = document.getElementById("crmNoteInput");
    if (!input || !input.value.trim()) return;
    const req2 = activeRequest();
    if (!req2) return;
    if (!req2.crmNotes) req2.crmNotes = [];
    req2.crmNotes.push({ text: input.value.trim(), author: state.activeUser?.name || 'Unknown', date: new Date().toLocaleString() });
    input.value = '';
    saveState();
    renderCoordinatorRequestDetail(req2);
    showToast('Note added');
  });
}


function renderDetailActions(req) {
  const si = req.statusIndex;
  const rid = req.id;
  const approvedTechs = (state.applications || []).filter(a => a.role && a.status === "Approved" && (a.role.toLowerCase() === "technician"));
  const approvedRMs = (state.applications || []).filter(a => a.role && a.status === "Approved" && (a.role.toLowerCase() === "repairmaster" || a.role.toLowerCase() === "repairingmaster"));
  const rmOpts = approvedRMs.map(a =>
    `<option value="${a.name}${a.location ? ' \u2014 ' + a.location : ''}">${a.name}${a.location ? ' \u2014 ' + a.location : ''}</option>`
  ).join('');
  const techOpts = approvedTechs.map(a =>
    `<option value="${a.name}${a.location ? ' \u2014 ' + a.location : ''}">${a.name}${a.location ? ' \u2014 ' + a.location : ''}</option>`
  ).join('');
  let html = '';

  if (si === 0) {
    html += `<button class="primary-action rd-btn rd-btn-accept" data-rid="${rid}">✓ Accept Request</button>
             <button class="secondary-action rd-btn rd-btn-reject" data-rid="${rid}" style="color:#e74c3c">✗ Reject</button>`;
  } else if (si === 1) {
    const parts = state.repairParts || [];
    html += `<div class="quote-builder">
      <p class="eyebrow" style="margin-bottom:6px">Prepare quotation — select parts</p>
      <div class="parts-grid" id="coordPartsGrid">${parts.map((part, i) => `
        <div class="part-row" data-pi="${i}">
          <label class="part-check-label">
            <input type="checkbox" ${part.stock > 0 ? "" : "disabled"} data-pi="${i}" class="coord-part-cb">
            <span class="part-name">${part.name}</span>
          </label>
          <div class="part-fields">
            <input class="part-cost-input" type="number" min="0" value="${part.cost}" data-pi="${i}" data-coord-part-cost="${i}">
          </div>
        </div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0">
        <label style="font-size:12px">Diagnosis fee (INR)
          <input id="coordBaseFee" type="number" min="0" value="${state.baseInspectionFee || 100}" style="width:100%">
        </label>
        <label style="font-size:12px">Tax / GST (%)
          <input id="coordTaxPct" type="number" min="0" max="100" value="${state.taxPercent || 18}" style="width:100%">
        </label>
        <label style="font-size:12px">Service charge (%)
          <input id="coordSCPct" type="number" min="0" max="100" value="${state.serviceChargePercent || 10}" style="width:100%">
        </label>
        <label style="font-size:12px">Min service fee (INR)
          <input id="coordMinFee" type="number" min="0" value="${state.minServiceFee || 150}" style="width:100%">
        </label>
      </div>
      <div style="margin-top:8px">
        <label style="font-size:12px;font-weight:600">Send pre-quote to RepairingMaster for review:
          <select id="coordPreQuoteRm" style="width:100%;margin-top:2px">${rmOpts || '<option value="">No approved RMs</option>'}</select>
        </label>
      </div>
      <button class="primary-action rd-btn rd-btn-send-quote" data-rid="${rid}" style="margin-top:4px">Send Pre-Quote to RM</button>
    </div>`;
  } else if (si === 3) {
    html += `<p style="font-size:13px;color:var(--muted);margin:0 0 6px">Customer approved! Assign technician and repair partner:</p>
             <select class="rd-pickup-tech" data-rid="${rid}">${techOpts || '<option value="">No approved technicians</option>'}</select>
             <select class="rd-repair-partner" data-rid="${rid}" style="margin-top:4px">${rmOpts || '<option value="">No approved repair partners</option>'}</select>
             <button class="primary-action rd-btn rd-btn-assign" data-rid="${rid}" style="margin-top:8px">✓ Assign & Schedule Pickup</button>`;
  } else if (si === 6) {
    const rqItems2 = req.repairQuoteItems || [];
    html += rqItems2.length ? rqItems2.map(i => '<div style="font-size:13px">' + escHtml(i.name) + ' — ' + formatCurrency(i.cost) + '</div>').join('') +
      `<button class="primary-action rd-btn rd-btn-approve-repair-quote" data-rid="${rid}" style="margin-top:6px">✓ Approve Repair Quote</button>` : '';
  } else if (si === 11) {
    html += `<p style="font-size:13px;color:var(--muted);margin:0 0 8px">Repair completed. Send final invoice to customer:</p>
      <div style="display:grid;gap:6px;margin-bottom:8px">
        <label style="font-size:12px">Additional items (comma-separated, e.g. Back Cover-499, Screen Guard-199)
          <input class="rd-addon-items" data-rid="${rid}" placeholder="Item-amount, Item-amount" style="width:100%">
        </label>
      </div>
      <button class="primary-action rd-btn rd-btn-send-invoice" data-rid="${rid}">Send Final Invoice</button>`;
  } else if (si === 14) {
    const payMethod = req.paymentMethod || '—';
    const isOnline = req.paymentMethod === "Online";
    html += `<p style="font-size:13px;color:var(--muted);margin:0 0 6px">Customer selected: <strong>${payMethod}</strong></p>
             ${isOnline ? `<button class="primary-action rd-btn rd-btn-verify-payment" data-rid="${rid}" style="background:#27ae60">✓ Confirm Online Payment</button>
             <p style="font-size:12px;color:var(--muted);margin-top:4px">Confirm online payment received, then assign delivery.</p>`
             : `<button class="primary-action rd-btn rd-btn-assign-delivery" data-rid="${rid}" style="background:#e67e22">✓ Assign Delivery (COD)</button>
             <p style="font-size:12px;color:var(--muted);margin-top:4px">COD selected. Assign delivery directly. Technician will collect payment.</p>`}`;
  } else if (si === 15) {
    const approvedTechs = (state.applications || []).filter(a => a.role && a.status === "Approved" && (a.role.toLowerCase() === "technician"));
    const techOpts = approvedTechs.map(a =>
      `<option value="${a.name}${a.location ? ' \u2014 ' + a.location : ''}">${a.name}${a.location ? ' \u2014 ' + a.location : ''}</option>`
    ).join('');
    html += `<p style="font-size:13px;color:var(--muted);margin:0 0 6px">Assign a technician for delivery:</p>
             <select class="rd-delivery-tech" data-rid="${rid}">${techOpts || '<option value="">No approved technicians</option>'}</select>
             <button class="primary-action rd-btn rd-btn-assign-delivery" data-rid="${rid}" style="margin-top:6px">✓ Assign Delivery</button>`;
  } else if (si === 20) {
    const approvedTechs = (state.applications || []).filter(a => a.role && a.status === "Approved" && (a.role.toLowerCase() === "technician"));
    const techOpts = approvedTechs.map(a =>
      `<option value="${a.name}${a.location ? ' \u2014 ' + a.location : ''}">${a.name}${a.location ? ' \u2014 ' + a.location : ''}</option>`
    ).join('');
    const diagFee = state.baseInspectionFee || 100;
    const svcFee = state.minServiceFee || 150;
    html += `<div class="rd-info-card" style="background:#fde8e8;border:1px solid #e74c3c;margin-bottom:8px">
      <p style="font-weight:600;color:#c0392b">✗ Customer declined the repair quote</p>
      <p style="font-size:13px;margin:4px 0">Charges to apply:</p>
      <table class="coord-info-table" style="font-size:13px">
        <tr><td>Diagnosis fee</td><td>₹${diagFee}</td></tr>
        <tr><td>Service fee</td><td>₹${svcFee}</td></tr>
        <tr><td style="font-weight:600">Total</td><td style="font-weight:600">₹${diagFee + svcFee}</td></tr>
      </table>
    </div>
    <p style="font-size:13px;color:var(--muted);margin:0 0 6px">Assign a technician for device return to customer:</p>
    <select class="rd-return-tech" data-rid="${rid}">${techOpts || '<option value="">No approved technicians</option>'}</select>
    <button class="primary-action rd-btn rd-btn-assign-return" data-rid="${rid}" style="margin-top:6px;background:#e74c3c">✓ Assign Return Technician</button>`;
  } else if (si >= 4 && si < 19 && ![6,11,14,15,20].includes(si)) {
    html += `<p style="font-size:13px;color:var(--muted);margin:0 0 6px">Current step: monitoring. Progress updates will appear here.</p>`;
  }

  return html;
}

// ─── Coordinator action handlers (delegated) ─────
function setupCoordinatorHandlers() {
  const container = document.getElementById("coordinatorRequestContent") || document.body;
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest('button.rd-btn');
    if (!btn) return;
    const rid = btn.dataset.rid;
    const request = state.requests.find(r => r.id === rid) || activeRequest();
    if (!request) return;

    if (btn.classList.contains('rd-btn-accept')) {
      request.statusIndex = 1; saveState(); renderAll();
      await notifyRoles(['coordinator'], `${request.id}: Accepted — prepare quotation now`, 'success', 'coordinator');
      if (request.customer_id) await createNotification({ user_id: request.customer_id, message: `Your request ${request.id} has been accepted and is under review.`, type: 'info' });
      showToast('Request accepted');
    }
    if (btn.classList.contains('rd-btn-reject')) {
      request.statusIndex = 19; saveState(); renderAll();
      if (request.customer_id) await createNotification({ user_id: request.customer_id, message: `Your request ${request.id} could not be accepted at this time.`, type: 'warning' });
      showToast('Request rejected');
    }
    if (btn.classList.contains('rd-btn-send-quote')) {
      const cbs = container.querySelectorAll('.coord-part-cb:checked');
      if (!cbs.length) { showToast('Select at least one repair part'); return; }
      const baseFee = Number(document.getElementById('coordBaseFee')?.value) || 100;
      const taxPct = Number(document.getElementById('coordTaxPct')?.value) || 0;
      const scPct = Number(document.getElementById('coordSCPct')?.value) || 0;
      const minFee = Number(document.getElementById('coordMinFee')?.value) || 150;
      const selectedItems = [];
      let partsTotal = 0;
      cbs.forEach(cb => {
        const pi = Number(cb.dataset.pi);
        const costInput = container.querySelector(`[data-coord-part-cost="${pi}"]`);
        const cost = costInput ? Number(costInput.value) : (state.repairParts[pi]?.cost || 0);
        const name = state.repairParts[pi]?.name || 'Part';
        selectedItems.push({ name, cost });
        partsTotal += cost;
      });
      const subtotal = Math.max(partsTotal + baseFee, minFee);
      const serviceCharge = Math.round(subtotal * scPct / 100);
      const taxableAmount = subtotal + serviceCharge;
      const taxAmount = Math.round(taxableAmount * taxPct / 100);
      const amount = taxableAmount + taxAmount;
      request.quoteItems = selectedItems;
      request.quoteAmount = amount;
      request.taxPercent = taxPct;
      request.taxAmount = taxAmount;
      request.serviceChargePercent = scPct;
      request.serviceChargeAmount = serviceCharge;
      request.baseInspectionFee = baseFee;
      request.statusIndex = 2;
      request.preQuoteSentToRm = true;
      const rmVal = document.getElementById('coordPreQuoteRm')?.value;
      if (rmVal) request.repairPartner = rmVal;
      saveState(); renderAll();
      await notifyRoles(['coordinator'], `Pre-quote sent for ${request.id} to RM for review — ${formatCurrency(amount)}`, 'success', 'coordinator');
      if (rmVal) {
        await notifyRoles(['repairmaster'], `${request.id}: Pre-quote sent for review — ${formatCurrency(amount)}. Check availability and confirm.`, 'info', 'repairmaster');
      }
      if (request.customer_id) {
        await createNotification({ user_id: request.customer_id, message: `Your pre-quote for ${request.id} is being reviewed by our repair team. We'll notify you once it's ready.`, type: 'info' });
      }
      showToast(`Pre-quote sent to ${rmVal || 'RM'} for review`);
    }
    if (btn.classList.contains('rd-btn-assign')) {
      const techEl = container.querySelector(`.rd-pickup-tech[data-rid="${rid}"]`);
      const partnerEl = container.querySelector(`.rd-repair-partner[data-rid="${rid}"]`);
      if (!techEl || !techEl.value) { showToast('Select a pickup technician'); return; }
      if (!partnerEl || !partnerEl.value) { showToast('Select a repair partner'); return; }
      request.pickupTech = techEl.value;
      request.repairPartner = partnerEl.value;
      request.rmOtp = String(Math.floor(1000 + Math.random() * 9000));
      request.statusIndex = 4;
      saveState(); renderAll();
      await notifyRoles(['technician'], `Pickup scheduled for ${request.id}`, 'info', 'technician');
      await notifyRoles(['coordinator'], `${request.id}: Technician & repair partner assigned`, 'info', 'coordinator');
      showToast('Technician & repair partner assigned');
    }
    if (btn.classList.contains('rd-btn-approve-repair-quote')) {
      request.statusIndex = 7; saveState(); renderAll();
      await notifyRoles(['repairmaster'], `${request.id}: Repair quote approved — start repair`, 'info', 'repairmaster');
      showToast('Repair quote approved');
    }
    if (btn.classList.contains('rd-btn-send-invoice')) {
      const addonInput = container.querySelector(`.rd-addon-items[data-rid="${rid}"]`);
      const addonStr = addonInput ? addonInput.value.trim() : '';
      request.addonItems = [];
      if (addonStr) {
        addonStr.split(',').forEach(item => {
          const parts2 = item.trim().split('-');
          if (parts2.length === 2) {
            request.addonItems.push({ name: parts2[0].trim(), cost: Number(parts2[1]) || 0 });
          }
        });
      }
      request.statusIndex = 12;
      saveState(); renderAll();
      await notifyRoles(['coordinator'], `Final invoice sent for ${request.id}`, 'success', 'coordinator');
      if (request.customer_id) await createNotification({ user_id: request.customer_id, message: `Final invoice for ${request.id} is ready — select payment method.`, type: 'info' });
      showToast('Final invoice sent to customer');
    }
    if (btn.classList.contains('rd-btn-assign-delivery')) {
      const techEl2 = container.querySelector(`.rd-delivery-tech[data-rid="${rid}"]`);
      if (!techEl2 || !techEl2.value) { showToast('Select a delivery technician'); return; }
      request.deliveryTech = techEl2.value;
      request.deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
      request.statusIndex = 16;
      saveState(); renderAll();
      await notifyRoles(['technician'], `Delivery assigned for ${request.id}`, 'info', 'technician');
      showToast(`Delivery assigned to ${techEl2.value}`);
    }
    if (btn.classList.contains('rd-btn-verify-payment')) {
      request.paymentStatus = "Paid";
      request.statusIndex = 15;
      saveState(); renderAll();
      await notifyRoles(['coordinator'], `Payment verified for ${request.id}`, 'success', 'coordinator');
      showToast('Payment confirmed — assign delivery');
    }
    if (btn.classList.contains('rd-btn-assign-return')) {
      const techEl2 = container.querySelector(`.rd-return-tech[data-rid="${rid}"]`);
      if (!techEl2 || !techEl2.value) { showToast('Select a return technician'); return; }
      request.deliveryTech = techEl2.value;
      request.statusIndex = 21;
      saveState(); renderAll();
      await notifyRoles(['technician'], `Return pick-up assigned for ${request.id} — collect device from repair center`, 'info', 'technician');
      await notifyRoles(['coordinator'], `${request.id}: Return technician assigned — device will be returned to customer`, 'info', 'coordinator');
      showToast(`Return assigned to ${techEl2.value}`);
    }
  });
}
setupCoordinatorHandlers();

document.getElementById("detailBackBtn")?.addEventListener("click", () => closeRoleDetail('coordinator'));

function renderTechnician() {
  // Detail mode
  if (state.techDetailMode) {
    document.getElementById("techDashboard").style.display = 'none';
    document.getElementById("techRequestView").style.display = '';
    renderTechDetail(activeRequest());
    return;
  }
  document.getElementById("techDashboard").style.display = '';
  document.getElementById("techRequestView").style.display = 'none';

  const techName2 = state.activeUser?.name || '';
  const myJobs = state.requests.filter(r => {
    const tech = r.pickupTech || '';
    return tech === techName2 || tech.startsWith(techName2 + ' \u2014') || tech.startsWith(techName2 + ' -');
  });
  const myActive = myJobs.filter(r => r.statusIndex >= 1 && r.statusIndex < 17).length;
  const myDone = myJobs.filter(r => r.statusIndex >= 17).length;
  document.getElementById("techAssignedCount").textContent = myJobs.length;
  document.getElementById("techCompletedCount").textContent = myDone;
  document.getElementById("techActiveCount").textContent = myActive;

  const request = activeRequest();
  const card = document.getElementById("techActiveJobCard");
  if (!card) return;

  if (!request) {
    card.style.display = 'none';
  } else {
    card.style.display = '';
    const isDelivery = request.statusIndex >= 15;
    const jobType = isDelivery ? 'Delivery' : 'Pickup';
    document.getElementById("techJobBadge").textContent = jobType;
    document.getElementById("techJobBadge").style.background = isDelivery ? '#27ae60' : '#e67e22';
    document.getElementById("techJobId").textContent = request.id;
    document.getElementById("techJobTitle").textContent = `${request.model} — ${request.issue}`;
    document.getElementById("techJobDesc").textContent = isDelivery
      ? "Deliver the repaired device to the customer address below."
      : `Collect device from customer. Customer OTP: ${request.pickupOtp || '4821'} | RM handover OTP: ${request.rmOtp || '7382'}`;
    document.getElementById("techJobMeta").textContent = `${request.customer} | ${request.address || '—'} | ${request.phone || ''}`;

    // OTP section — show for both pickup and delivery
    const otpSection = document.getElementById("techOtpSection");
    otpSection.style.display = '';
    const otpInput = document.getElementById("otpInput");
    if (otpInput) otpInput.value = isDelivery ? (request.deliveryOtp || '3847') : (request.pickupOtp || '4821');
    const otpBtn = document.getElementById("verifyOtp");
    otpBtn.textContent = isDelivery ? 'Verify Delivery OTP' : 'Verify Pickup OTP';
    if (!otpBtn.dataset.techBound) {
      otpBtn.dataset.techBound = '1';
      otpBtn.addEventListener('click', () => {
        const r = activeRequest(); if (!r) return;
        const entered = document.getElementById("otpInput")?.value?.trim();
        const isDel2 = r.statusIndex >= 15;
        const expected = isDel2 ? (r.deliveryOtp || '3847') : (r.pickupOtp || '4821');
        if (entered === expected) {
          if (!r.checks) r.checks = {};
          r.checks.otp = true;
          if (isDel2) { r.deliveryOtpVerified = true; showToast('Delivery OTP verified'); }
          else { r.otpVerified = true; showToast('Pickup OTP verified'); }
          saveState(); renderAll();
        } else { showToast('Incorrect OTP'); }
      });
    }

    // Condition photos
    const techPreviews = document.getElementById("techConditionPreviews");
    if (techPreviews) {
      if (request.conditionImages && request.conditionImages.length) {
        techPreviews.innerHTML = `<span style="font-size:12px;font-weight:600;color:var(--muted);width:100%">Device condition photos:</span>` +
          request.conditionImages.map((img) => `<img src="${img}" alt="Device condition" loading="lazy">`).join("");
      } else {
        techPreviews.innerHTML = "";
      }
    }

    // Dynamic checklist
    const checks = isDelivery
      ? [
          ["accepted", "Delivery job accepted"],
          ["otp", "Delivery OTP verified"],
          ["delivery", "Device delivered to customer"],
          ["payment_collected", "Payment collected from customer"]
        ]
      : [
          ["accepted", "Pickup job accepted"],
          ["otp", "Customer OTP verified"],
          ["photos", "Device photos captured"],
          ["handover", "Device handed to RepairingMaster"]
        ];

    document.getElementById("techChecklist").innerHTML = checks.map(([key, label]) => `
      <div class="check-item">
        <span>${label}</span>
        <button data-check="${key}">${(request.checks || {})[key] ? "Done" : "Mark"}</button>
      </div>
    `).join("");

    document.querySelectorAll("[data-check]:not([data-bound])").forEach((button) => {
      button.dataset.bound = '1';
      button.addEventListener("click", () => {
        const r = activeRequest(); if (!r) return;
        if (!r.checks) r.checks = {};
        r.checks[button.dataset.check] = true;
        if (button.dataset.check === "otp") {
          if (r.statusIndex >= 15) r.deliveryOtpVerified = true;
          else r.otpVerified = true;
        }
        if (button.dataset.check === "payment_collected" && r.paymentMethod === "Cash on Delivery") {
          r.paymentStatus = "Paid";
        }
        saveState();
        renderAll();
        showToast("Checklist updated");
      });
    });
  }

  // Assigned requests list — color-coded cards at top
  const techName = state.activeUser?.name || '';
  const assigned = state.requests.filter(r => (r.pickupTech === techName || r.pickupTech.startsWith(techName + ' \u2014') || r.pickupTech.startsWith(techName + ' -')) && r.statusIndex < 19);
  const listEl = document.getElementById("techRequestsList");
  if (!assigned.length) {
    listEl.innerHTML = '<div class="empty-state">No assigned jobs</div>';
  } else {
    listEl.innerHTML = assigned.map(r => {
      const si = r.statusIndex;
      const isDel = si >= 17;
      const doneRatio = si / (statuses.length - 1);
      const hue = isDel ? 200 : 35;
      const borderColor = `hsl(${hue}, 60%, 45%)`;
      const bgColor = `hsl(${hue}, 30%, 95%)`;
      const lastAction = r.checks ? Object.keys(r.checks).filter(k => r.checks[k]).join(', ') : '—';
      return `
      <button class="request-row" onclick="navigateTo('#technician/request/${r.id}')" style="border-left:4px solid ${borderColor};background:${bgColor};border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;width:100%;text-align:left;border:none;border-left:4px solid ${borderColor}">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:10px;background:${borderColor};color:#fff;padding:1px 6px;border-radius:4px;font-weight:600">${isDel ? 'Delivery' : 'Pickup'}</span>
            <strong style="font-size:14px">${r.id}</strong>
          </div>
          <p style="font-size:12px;margin:0;color:var(--muted)">${r.customer} — ${r.model}</p>
          <p style="font-size:11px;color:var(--muted);margin:2px 0 0">${lastAction}</p>
          ${!isDel && r.rmOtp ? `<p style="font-size:11px;margin:2px 0 0;color:#8e44ad">RM handover OTP: <strong>${r.rmOtp}</strong></p>` : ''}
        </div>
        <span class="status-pill" style="flex-shrink:0;font-size:11px;background:${borderColor};color:#fff">${statuses[si]}</span>
      </button>`;
    }).join('');
  }

  // Market deliveries
  const deliveryList = document.getElementById("techDeliveryList");
  if (deliveryList) {
    const myDeliveries = state.marketOrders.filter((o) => o.assignedTech && o.statusIndex < 4);
    if (!myDeliveries.length) {
      deliveryList.innerHTML = '<div class="empty-state">No delivery tasks assigned.</div>';
    } else {
      deliveryList.innerHTML = myDeliveries.map((o, i) => `
        <div class="tech-delivery-card">
          <div>
            <h4>${o.id} - ${o.itemModel}</h4>
            <p>Pickup from ${o.repairMaster} &rarr; Deliver to ${o.address}</p>
          </div>
          <span class="status-pill">${orderStatuses[o.statusIndex]}</span>
          ${o.statusIndex < 4 ? '<button class="adv-order" data-oi="' + i + '">Advance</button>' : ''}
        </div>
      `).join('');
      document.querySelectorAll(".adv-order").forEach((btn) => {
        btn.addEventListener("click", () => {
          const o = state.marketOrders[Number(btn.dataset.oi)];
          o.statusIndex = Math.min(o.statusIndex + 1, orderStatuses.length - 1);
          saveState(); renderAll();
          showToast(`${o.id} moved to ${orderStatuses[o.statusIndex]}`);
        });
      });
    }
  }
}

function renderTechDetail(req) {
  if (!req) { document.getElementById("techRequestContent").innerHTML = '<div class="empty-state">Request not found</div>'; return; }
  document.getElementById("techDetailTitle").textContent = `${req.id} — ${req.model}`;
  document.getElementById("techDetailStatus").textContent = statuses[req.statusIndex];
  const isDelivery = req.statusIndex >= 15;
  const content = document.getElementById("techRequestContent");
  const imgs = [...(req.requestImages || []), ...(req.conditionImages || [])].filter(Boolean);
  content.innerHTML = `
    <div class="rd-action-card" style="border-left:4px solid ${isDelivery ? '#27ae60' : 'var(--teal)'}">
      <div class="rd-action-header"><span class="rd-action-step">${isDelivery ? 'Delivery' : 'Pickup'} task</span></div>
      <p class="rd-action-msg">${req.customer} | ${req.address} | ${req.model}</p>
      <p style="font-size:13px;color:var(--muted);margin:0 0 8px">${isDelivery ? 'Deliver the repaired device to the customer. Customer OTP required for handover.' : 'Collect device from customer (Customer OTP) then hand over to RepairingMaster (RM OTP).'}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${isDelivery
          ? `<input id="techOtpInput" maxlength="4" value="${req.deliveryOtp || '3847'}" style="width:70px;text-align:center;font-size:18px;font-weight:700;border:1px solid var(--border);border-radius:6px;padding:6px">
             <button class="primary-action rd-btn" id="techVerifyOtpBtn" style="background:#3498db">✓ Verify Delivery OTP</button>`
          : `<div style="display:flex;gap:6px;flex-wrap:wrap">
              <div><span style="font-size:11px;color:var(--muted)">Customer OTP</span><input id="techOtpInput" maxlength="4" value="${req.pickupOtp || '4821'}" style="width:60px;text-align:center;font-size:16px;font-weight:700;border:1px solid var(--border);border-radius:6px;padding:6px"></div>
              <div><span style="font-size:11px;color:var(--muted)">RM OTP</span><input id="techRmOtpInput" maxlength="4" value="${req.rmOtp || '7382'}" style="width:60px;text-align:center;font-size:16px;font-weight:700;border:1px solid var(--border);border-radius:6px;padding:6px"></div>
              <button class="primary-action rd-btn" id="techVerifyOtpBtn" style="background:#3498db">✓ Verify & Handover</button>
            </div>`}
        <button class="primary-action rd-btn" id="techMarkCheckBtn" style="background:#27ae60">✓ Mark Complete</button>
      </div>
    </div>
    <div class="rd-grid">
      <div class="rd-info-card">
        <p class="eyebrow">Customer</p>
        <table class="coord-info-table">
          <tr><td>Name</td><td>${escHtml(req.customer)}</td></tr>
          <tr><td>Phone</td><td>${escHtml(req.phone || '—')}</td></tr>
          <tr><td>Address</td><td>${escHtml(req.address)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Device</p>
        <table class="coord-info-table">
          <tr><td>Brand</td><td>${req.brand || '—'}</td></tr>
          <tr><td>Model</td><td>${escHtml(req.model)}</td></tr>
          <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Checklist</p>
        <div style="font-size:13px;display:grid;gap:4px">
          ${(isDelivery
            ? [["accepted", "Delivery job accepted"], ["delivery", "Device delivered"], ["payment_collected", "Payment collected"]]
            : [["accepted", "Pickup job accepted"], ["otp", "OTP verified"], ["photos", "Photos captured"], ["handover", "Handed to RepairingMaster"]]
          ).map(([k, l]) => `
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="checkbox" ${(req.checks || {})[k] ? 'checked' : ''} data-tech-check="${k}" style="cursor:pointer">
              <span style="${(req.checks || {})[k] ? 'text-decoration:line-through;color:var(--muted)' : ''}">${l}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
    ${imgs.length ? '<div class="rd-info-card" style="margin-top:14px"><p class="eyebrow">Photos</p><div class="rd-photos">' + imgs.map(u => '<img src="' + u + '" loading="lazy">').join('') + '</div></div>' : ''}
  `;
  // Bind tech detail actions
  content.querySelectorAll('[data-tech-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      const req2 = activeRequest(); if (!req2) return;
      req2.checks[cb.dataset.techCheck] = cb.checked;
      if (cb.dataset.techCheck === 'otp' && req2.statusIndex >= 15) req2.deliveryOtpVerified = cb.checked;
      else if (cb.dataset.techCheck === 'otp') req2.otpVerified = cb.checked;
      if (cb.dataset.techCheck === 'payment_collected' && req2.paymentMethod === 'Cash on Delivery' && cb.checked) req2.paymentStatus = 'Paid';
      saveState(); renderAll();
    });
  });
  content.querySelector('#techVerifyOtpBtn')?.addEventListener('click', () => {
    const req2 = activeRequest(); if (!req2) return;
    const entered = document.getElementById('techOtpInput')?.value?.trim();
    const isDel = req2.statusIndex >= 15;
    if (isDel) {
      const expected = req2.deliveryOtp || '3847';
      if (entered !== expected) { showToast('Incorrect delivery OTP'); return; }
      if (!req2.checks) req2.checks = {};
      req2.checks.otp = true;
      req2.deliveryOtpVerified = true;
      showToast('Delivery OTP verified — device handed over');
    } else {
      const expectedCust = req2.pickupOtp || '4821';
      if (entered !== expectedCust) { showToast('Incorrect customer OTP'); return; }
      const rmEntered = document.getElementById('techRmOtpInput')?.value?.trim();
      const expectedRm = req2.rmOtp || '7382';
      if (rmEntered !== expectedRm) { showToast('Incorrect RM OTP — verify with repairmaster'); return; }
      if (!req2.checks) req2.checks = {};
      req2.checks.otp = true;
      req2.otpVerified = true;
      showToast('Customer OTP & RM OTP verified — device handed over');
    }
    saveState(); renderAll();
  });
  content.querySelector('#techMarkCheckBtn')?.addEventListener('click', () => {
    const req2 = activeRequest(); if (!req2) return;
    const isDel = req2.statusIndex >= 15;
    if (isDel && !req2.deliveryOtpVerified) {
      showToast('Delivery OTP must be verified first');
      return;
    }
    if (!isDel && !req2.otpVerified) {
      showToast('Both Customer OTP and RM OTP must be verified first');
      return;
    }
    req2.statusIndex = Math.min(req2.statusIndex + 1, statuses.length - 1);
    saveState(); renderAll(); showToast('Task progressed');
  });
}

document.getElementById("techDetailBackBtn")?.addEventListener("click", () => closeRoleDetail('technician'));

function renderRepairingMaster() {
  // Detail mode
  if (state.rmDetailMode) {
    document.getElementById("rmDashboard").style.display = 'none';
    document.getElementById("rmRequestView").style.display = '';
    renderRmDetail(activeRequest());
    return;
  }
  document.getElementById("rmDashboard").style.display = '';
  document.getElementById("rmRequestView").style.display = 'none';

  const rmName2 = state.activeUser?.name || '';
  const myRms = state.requests.filter(r => r.repairPartner === rmName2 || r.repairPartner.startsWith(rmName2 + ' \u2014') || r.repairPartner.startsWith(rmName2 + ' -'));
  const myRmActive = myRms.filter(r => r.statusIndex >= 2 && r.statusIndex < 12).length;
  const myRmDone = myRms.filter(r => r.statusIndex >= 12).length;
  document.getElementById("rmAssignedCount").textContent = myRms.length;
  document.getElementById("rmCompletedCount").textContent = myRmDone;
  document.getElementById("rmInProgressCount").textContent = myRmActive;

  const request = activeRequest();
  // Show active request on bench
  const benchTitle = document.querySelector("#repairmaster .diagnosis-card h2");
  if (benchTitle) benchTitle.textContent = request ? `Repair bench - ${request.id}` : "Repair bench";
  const diagnosisEl = document.getElementById("diagnosisText");
  if (diagnosisEl && request) diagnosisEl.placeholder = `${request.model}: ${request.issue}`;
  // Render dynamic parts grid
  const grid = document.getElementById("partsGrid");
  if (grid) {
    const parts = state.repairParts || [];
    grid.innerHTML = parts.map((part, i) => `
      <div class="part-row" data-pi="${i}">
        <label class="part-check-label">
          <input type="checkbox" ${part.stock > 0 ? "" : "disabled"} data-pi="${i}">
          <span class="part-name">${part.name}</span>
        </label>
        <div class="part-fields">
          <input class="part-cost-input" type="number" min="0" value="${part.cost}" data-pi="${i}">
          <button class="part-remove-btn" data-pi="${i}" title="Remove part">&times;</button>
        </div>
      </div>
    `).join("");
  }

  // Diagnosis fee input
  const baseFeeEl = document.getElementById("baseFeeInput");
  if (baseFeeEl) baseFeeEl.value = state.baseInspectionFee || 100;

  // Inventory display (warehouse stock)
  if (!inventory.length) {
    document.getElementById("inventoryList").innerHTML = `<div class="empty-state">No parts in inventory.</div>`;
  } else {
    document.getElementById("inventoryList").innerHTML = inventory.map((item) => `
    <div class="inventory-row">
      <div><strong>${item.part}</strong><br><small>${item.stock} units in stock</small></div>
      <span class="status-pill">${item.health}</span>
    </div>
  `).join("");
  }

  const soldNotif = document.getElementById("soldNotification");
  if (soldNotif) {
    const activeReq = activeRequest();
    const partnerName = (activeReq && activeReq.repairPartner) || "";
    const soldItems = state.marketOrders.filter((o) => o.repairMaster === partnerName && o.statusIndex < 4);
    if (!soldItems.length) {
      soldNotif.innerHTML = `<p style="color:var(--muted)">No recent sales notifications.</p>`;
    } else {
      soldNotif.innerHTML = soldItems.map((o) => `
        <div class="inventory-row">
          <div>
            <strong>${o.itemModel}</strong><br>
            <small>Order ${o.id} | ${o.assignedTech ? o.assignedTech + " assigned" : "Awaiting pickup"}</small>
          </div>
          <span class="status-pill">${orderStatuses[o.statusIndex]}</span>
        </div>
      `).join("");
    }
  }

  // Assigned requests list — color-coded cards at top
  const rmName = state.activeUser?.name || '';
  const assigned = state.requests.filter(r => (r.repairPartner === rmName || r.repairPartner.startsWith(rmName + ' \u2014') || r.repairPartner.startsWith(rmName + ' -')) && r.statusIndex < 19);
  const listEl = document.getElementById("rmRequestsList");
  if (!assigned.length) {
    listEl.innerHTML = '<div class="empty-state">No assigned repair jobs</div>';
  } else {
    listEl.innerHTML = assigned.map(r => {
      const si = r.statusIndex;
      const doneRatio = si / (statuses.length - 1);
      const hue = si >= 11 ? 120 : si >= 6 ? 45 : 200;
      const borderColor = `hsl(${hue}, 55%, 40%)`;
      const bgColor = `hsl(${hue}, 30%, 95%)`;
      return `
      <button class="request-row" onclick="navigateTo('#repairmaster/request/${r.id}')" style="border-left:4px solid ${borderColor};background:${bgColor};border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;width:100%;text-align:left;border:none;border-left:4px solid ${borderColor}">
        <div style="flex:1;min-width:0">
          <strong style="font-size:14px">${r.id} — ${r.model}</strong>
          <p style="font-size:12px;margin:2px 0 0;color:var(--muted)">${r.customer} — ${r.issue}</p>
          ${r.rmOtp ? `<p style="font-size:11px;margin:2px 0 0;color:#8e44ad">RM OTP: <strong>${r.rmOtp}</strong> (share with tech for handover)</p>` : ''}
        </div>
        <span class="status-pill" style="flex-shrink:0;font-size:11px;background:${borderColor};color:#fff">${statuses[si]}</span>
      </button>`;
    }).join('');
  }

  const feeInput = document.getElementById("minServiceFeeInput");
  if (feeInput) feeInput.value = state.minServiceFee || 150;
  const taxInput = document.getElementById("taxPercentInput");
  if (taxInput) taxInput.value = state.taxPercent || 0;
  const scInput = document.getElementById("serviceChargeInput");
  if (scInput) scInput.value = state.serviceChargePercent || 0;
  updateListingCommission();
}

function renderRmDetail(req) {
  if (!req) { document.getElementById("rmRequestContent").innerHTML = '<div class="empty-state">Request not found</div>'; return; }
  document.getElementById("rmDetailTitle").textContent = `${req.id} — ${req.model}`;
  document.getElementById("rmDetailStatus").textContent = statuses[req.statusIndex];
  const content = document.getElementById("rmRequestContent");
  const imgs = [...(req.requestImages || []), ...(req.conditionImages || [])].filter(Boolean);
  const si = req.statusIndex;
  let actionBtns = '';
  let extraHtml = '';
  if (si === 2 && req.preQuoteSentToRm && !req.preQuoteConfirmedByRm) {
    extraHtml = `
      <div class="rd-info-card" style="margin-bottom:8px">
        <p class="eyebrow">Pre-Quote for Review</p>
        ${req.quoteItems ? req.quoteItems.map(i => '<div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0"><span>' + escHtml(i.name) + '</span><span>' + formatCurrency(i.cost) + '</span></div>').join('') : '<p style="color:var(--muted);font-size:13px">No items listed</p>'}
        <div style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px;font-weight:700;display:flex;justify-content:space-between"><span>Total</span><span>${formatCurrency(req.quoteAmount || 0)}</span></div>
      </div>
      <p style="font-size:12px;color:var(--muted)">Check parts availability and confirm the pre-quote so it can be sent to the customer.</p>`;
    actionBtns = `<button class="primary-action rd-btn rm-btn-confirm-pre-quote" style="background:#8e44ad">✓ Confirm Pre-Quote & Send to Customer</button>`;
  } else if (si === 4) {
    actionBtns = `<button class="primary-action rd-btn rm-btn-receive" style="background:#8e44ad">✓ Receive Device</button>`;
  } else if (si === 5) {
    const parts = state.repairParts || [];
    extraHtml = `
      <textarea id="rmDiagInput" placeholder="Enter diagnosis notes..." style="width:100%;min-height:80px;border:1px solid var(--border);border-radius:6px;padding:8px;font-size:13px">${escHtml(req.diagnosis || '')}</textarea>
      <div class="rd-info-card" style="margin-top:8px;background:#fefaf0;border:1px solid #f39c12;font-size:12px;color:#856404">
        <strong>⚠ Important:</strong> If you send a repair quote and the customer declines, a <strong>diagnosis fee (₹${state.baseInspectionFee || 100})</strong> and <strong>service fee (₹${state.minServiceFee || 150})</strong> will apply. The device will be returned to the customer.
      </div>
      <div style="margin-top:10px">
        <p class="eyebrow" style="margin-bottom:4px">Repair Quote — select extra parts (if needed)</p>
        <div id="rmRepairPartsGrid" style="max-height:200px;overflow-y:auto">${parts.map((part, i) => `
          <div class="part-row" data-pi="${i}">
            <label class="part-check-label">
              <input type="checkbox" ${part.stock > 0 ? "" : "disabled"} data-pi="${i}" class="rm-repair-part-cb">
              <span class="part-name">${part.name}</span>
            </label>
            <div class="part-fields">
              <input class="part-cost-input" type="number" min="0" value="${part.cost}" data-pi="${i}">
            </div>
          </div>`).join('')}</div>
      </div>`;
    actionBtns = `
      <button class="primary-action rd-btn rm-btn-confirm-send" style="background:#8e44ad">✓ Confirm Diagnosis & Send Quote</button>
      <p style="font-size:12px;color:var(--muted);margin:4px 0 0">Select extra parts above if needed, or proceed without selection (only diagnosis fee applies).</p>`;
  } else if (si === 6) {
    if (req.repairDeclined) {
      actionBtns = `<div class="rd-info-card" style="background:#fde8e8;border:1px solid #e74c3c"><p style="font-weight:600;color:#c0392b">✗ Customer declined the repair quote</p><p style="font-size:13px;margin:4px 0 0">Do not proceed with repair. The coordinator will arrange device return.</p></div>`;
    } else {
      actionBtns = `<p style="font-size:13px;color:var(--muted)">Repair quote sent. Awaiting approval from customer.</p>`;
    }
  } else if (si === 7) {
    actionBtns = `<button class="primary-action rd-btn rm-btn-start-repair" style="background:#27ae60">✓ Start Repair</button>`;
  } else if (si === 8) {
    actionBtns = `<p style="font-size:13px;color:var(--muted)">Repair in progress.</p>`;
  } else if (si === 9) {
    actionBtns = `<button class="primary-action rd-btn rm-btn-quality-check" style="background:#8e44ad">✓ Mark Quality Check Passed</button>`;
  } else if (si === 10) {
    actionBtns = `<button class="primary-action rd-btn rm-btn-repair-done" style="background:#27ae60">✓ Confirm Repair Completed</button>`;
  } else if (si >= 11) {
    actionBtns = `<p style="font-size:13px;color:var(--muted)">Repair completed. Awaiting coordinator to send final invoice.</p>`;
  }
  content.innerHTML = `
    <div class="rd-action-card" style="border-left:4px solid #8e44ad">
      <div class="rd-action-header"><span class="rd-action-step">Repair job</span></div>
      <p class="rd-action-msg">${req.customer} | ${req.model} | ${req.issue}</p>
      ${req.rmOtp ? `<p style="font-size:12px;color:#8e44ad;margin:4px 0">RM Handover OTP: <strong>${req.rmOtp}</strong> — share with technician for device handover</p>` : ''}
      ${extraHtml}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">${actionBtns}</div>
    </div>
    <div class="rd-grid">
      <div class="rd-info-card">
        <p class="eyebrow">Customer</p>
        <table class="coord-info-table">
          <tr><td>Name</td><td>${escHtml(req.customer)}</td></tr>
          <tr><td>Phone</td><td>${escHtml(req.phone || '—')}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Device</p>
        <table class="coord-info-table">
          <tr><td>Brand</td><td>${req.brand || '—'}</td></tr>
          <tr><td>Model</td><td>${escHtml(req.model)}</td></tr>
          <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Repair Quote</p>
        <div id="rmRepairQuoteSection">
          ${req.repairQuoteItems && req.repairQuoteItems.length ? req.repairQuoteItems.map(i => '<div>' + escHtml(i.name) + ' — ' + formatCurrency(i.cost) + '</div>').join('') : '<p style="color:var(--muted);font-size:13px">No repair quote yet</p>'}
        </div>
      </div>
    </div>
    ${imgs.length ? '<div class="rd-info-card" style="margin-top:14px"><p class="eyebrow">Photos</p><div class="rd-photos">' + imgs.map(u => '<img src="' + u + '" loading="lazy">').join('') + '</div></div>' : ''}
  `;
  // Bind RM action buttons
  content.querySelector('.rm-btn-confirm-pre-quote')?.addEventListener('click', async () => {
    const r = activeRequest(); if (!r) return;
    r.preQuoteConfirmedByRm = true;
    r.statusIndex = 2;
    saveState(); renderAll();
    await notifyRoles(['coordinator'], `${r.id}: RM confirmed pre-quote — send to customer for approval`, 'info', 'coordinator');
    if (r.customer_id) {
      await createNotification({ user_id: r.customer_id, message: `Your pre-quote for ${r.id} is ready — ${formatCurrency(r.quoteAmount || 0)}. Review & approve to proceed.`, type: 'info' });
    }
    showToast('Pre-quote confirmed — customer notified');
  });
  content.querySelector('.rm-btn-receive')?.addEventListener('click', () => {
    const r = activeRequest(); if (!r) return;
    r.statusIndex = 5; saveState(); renderAll(); showToast('Device received');
  });
  content.querySelector('.rm-btn-confirm-send')?.addEventListener('click', async () => {
    const r = activeRequest(); if (!r) return;
    const diag2 = document.getElementById('rmDiagInput')?.value;
    if (diag2) r.diagnosis = diag2;
    // Collect selected extra parts (optional)
    const selected = content.querySelectorAll('.rm-repair-part-cb:checked');
    if (selected.length) {
      const items = [];
      selected.forEach(cb => {
        const pi = Number(cb.dataset.pi);
        const costInput = document.querySelector(`.part-cost-input[data-pi="${pi}"]`);
        const cost = costInput ? Number(costInput.value) : (state.repairParts[pi]?.cost || 0);
        items.push({ name: state.repairParts[pi]?.name || 'Part', cost });
      });
      r.repairQuoteItems = items;
    }
    r.statusIndex = 6; saveState(); renderAll();
    await notifyRoles(['coordinator'], `${r.id}: Diagnosis confirmed — repair quote sent to customer`, 'info', 'coordinator');
    if (r.customer_id) {
      await createNotification({ user_id: r.customer_id, message: `The repairmaster has diagnosed your device. Review the repair quote and approve or decline.`, type: 'info' });
    }
    showToast('Diagnosis confirmed — repair quote sent to customer');
  });
  content.querySelector('.rm-btn-start-repair')?.addEventListener('click', () => {
    const r = activeRequest(); if (!r) return;
    r.statusIndex = 8; saveState(); renderAll(); showToast('Repair started');
  });
  content.querySelector('.rm-btn-quality-check')?.addEventListener('click', () => {
    const r = activeRequest(); if (!r) return;
    r.statusIndex = 10; saveState(); renderAll(); showToast('Quality check passed');
  });
  content.querySelector('.rm-btn-repair-done')?.addEventListener('click', async () => {
    const r = activeRequest(); if (!r) return;
    r.statusIndex = 11; saveState(); renderAll();
    await notifyRoles(['coordinator'], `${r.id}: Repair completed — send final invoice to customer`, 'info', 'coordinator');
    showToast('Repair completed. Coordinator notified.');
  });
}

document.getElementById("rmDetailBackBtn")?.addEventListener("click", () => closeRoleDetail('repairmaster'));

function renderAdmin() {
  // Detail mode
  if (state.adminDetailMode) {
    document.getElementById("adminDashboard").style.display = 'none';
    document.getElementById("adminRequestView").style.display = '';
    renderAdminDetail(activeRequest());
    return;
  }
  document.getElementById("adminDashboard").style.display = '';
  document.getElementById("adminRequestView").style.display = 'none';

  const requests = state.requests || [];
  const marketplace = state.marketplace || [];
  const applications = state.applications || [];

  // Admin request list
  const adminReqList = document.getElementById("adminRequestsList");
  if (adminReqList) {
    adminReqList.innerHTML = requests.filter(r => r.statusIndex < 18).map(r => `
      <button class="request-row" onclick="navigateTo('#admin/request/${r.id}')" style="text-align:left;width:100%">
        <div><h3>${r.id} — ${r.model}</h3><p>${r.customer} | ${r.issue}</p></div>
        <span class="status-pill">${statuses[r.statusIndex]}</span>
      </button>
    `).join('') + (requests.filter(r => r.statusIndex >= 18).length ? '<div style="font-size:11px;color:var(--muted);padding:8px 12px">' + requests.filter(r => r.statusIndex >= 18).length + ' completed requests</div>' : '<div class="empty-state">No open requests</div>');
  }

  // Real metrics
  const totalCommission = requests.reduce((s, r) => s + commissionFor(r.quoteAmount), 0) + marketplace.filter((m) => m.sold).reduce((s, m) => s + commissionFor(displayPrice(m.basePrice)), 0);
  document.getElementById("platformCommission").textContent = formatCurrency(totalCommission);
  document.getElementById("escalations").textContent = requests.filter((r) => r.statusIndex > 0 && r.statusIndex < 4).length;
  document.getElementById("totalRequests").textContent = requests.length;
  document.getElementById("pendingApps").textContent = applications.filter(a => a.status === "Pending").length;

  // Status breakdown
  const stageLabels = ["Submitted", "In Progress", "Ready", "Closed"];
  const stageCounts = [0, 0, 0, 0];
  requests.forEach(r => {
    if (r.statusIndex === 0) stageCounts[0]++;
    else if (r.statusIndex <= 10) stageCounts[1]++;
    else if (r.statusIndex <= 17) stageCounts[2]++;
    else stageCounts[3]++;
  });
  const maxCount = Math.max(...stageCounts, 1);
  document.getElementById("statusBreakdown").innerHTML = stageLabels.map((l, i) => `
    <div class="status-bar-row">
      <span class="status-bar-label">${l}</span>
      <div class="status-bar-track"><div class="status-bar-fill" style="width:${(stageCounts[i] / maxCount) * 100}%"></div></div>
      <span class="status-bar-count">${stageCounts[i]}</span>
    </div>
  `).join("");

  const days = [["Sat", 24], ["Sun", 31], ["Mon", 28], ["Tue", 42], ["Wed", 38], ["Thu", 45], ["Fri", 21]];
  document.getElementById("barChart").innerHTML = days.map(([day, value]) => `
    <div class="bar" style="height:${value * 5}px" title="${value} repairs"><span>${day}</span></div>
  `).join("");

  document.getElementById("vendorList").innerHTML = vendors.map((vendor) => `
    <div class="vendor-row">
      <div><strong>${vendor.name}</strong><br><small>${vendor.jobs} completed jobs</small></div>
      <span class="status-pill">${vendor.score}</span>
    </div>
  `).join("");

  // Application filter - use event delegation on parent
  document.getElementById("appFilterBar").onclick = (e) => {
    const btn = e.target.closest("[data-appfilter]");
    if (!btn) return;
    document.querySelectorAll("[data-appfilter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderAdmin();
  };
  const activeFilter = document.querySelector("#appFilterBar .active")?.dataset?.appfilter || "All";
  const filteredApps = activeFilter === "All" ? state.applications : state.applications.filter(a => a.status === activeFilter);
  document.getElementById("applicationList").innerHTML = filteredApps.map((app, i) => {
    const detailsHtml = app.details ? Object.entries(app.details).filter(([_, v]) => v).map(([k, v]) => `<span class="app-detail">${k}: ${v}</span>`).join("") : "";
    return `
    <div class="app-card">
      <div class="app-card-header">
        <div>
          <strong>${app.name}</strong>
          <span class="app-role-tag">${app.role}</span>
        </div>
        <span class="status-pill ${app.status === "Approved" ? "pill-approved" : app.status === "Rejected" ? "pill-rejected" : "pill-pending"}">${app.status}</span>
      </div>
      <div class="app-card-body">
        <span class="app-detail">Email: ${app.email || "—"}</span>
        <span class="app-detail">Phone: ${app.phone || "—"}</span>
        <span class="app-detail">Location: ${app.location}</span>
        ${detailsHtml}
      </div>
      <div class="app-card-actions">
        ${app.status === "Pending" ? `<button class="appr-btn" data-appr="${i}">✅ Verify &amp; Approve</button>` : ""}
        ${app.status === "Approved" ? `<button class="rej-btn" data-rej="${i}">⛔ Revoke Access</button>` : ""}
        ${app.status === "Pending" ? `<button class="rej-btn" data-rej-app="${i}">✖ Reject</button>` : ""}
      </div>
    </div>
  `}).join("");

  document.querySelectorAll(".appr-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const i = Number(btn.dataset.appr);
      const app = state.applications[i];
      app.status = "Approved";
      const dbId = app.id;
      if (dbId) await updateApplication(dbId, { status: "Approved" }).catch(() => {});
      if (app.user_id) {
        const roleMap = { 'Technician':'technician','RepairingMaster':'repairmaster','Coordinator':'coordinator' };
        const profileRole = roleMap[app.role] || app.role?.toLowerCase();
        await supabase.from('profiles').update({ role: profileRole }).eq('id', app.user_id).catch(() => {});
        await createNotification({ user_id: app.user_id, message: `Your ${app.role} application has been approved. You can now sign in.`, type: 'success' });
      }
      saveState();
      renderAll();
      renderNotifications();
      showToast("Application approved — employee can now sign in");
    });
  });
  document.querySelectorAll(".rej-btn[data-rej]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const i = Number(btn.dataset.rej);
      const app = state.applications[i];
      app.status = "Pending";
      const dbId = app.id;
      if (dbId) await updateApplication(dbId, { status: "Pending" }).catch(() => {});
      if (app.user_id) await createNotification({ user_id: app.user_id, message: `Your ${app.role} application access has been revoked. Contact admin.`, type: 'warning' });
      saveState();
      renderAll();
      renderNotifications();
      showToast("Application access revoked");
    });
  });
  document.querySelectorAll(".rej-btn[data-rej-app]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const i = Number(btn.dataset.rejApp);
      const app = state.applications[i];
      app.status = "Rejected";
      const dbId = app.id;
      if (dbId) await updateApplication(dbId, { status: "Rejected" }).catch(() => {});
      if (app.user_id) await createNotification({ user_id: app.user_id, message: `Your ${app.role} application has been rejected.`, type: 'error' });
      saveState();
      renderAll();
      renderNotifications();
      showToast("Application rejected");
    });
  });

  // Technician performance
  const techNames = state.applications
    .filter((a) => a.role === "Technician" && a.status === "Approved")
    .map((a) => a.name);
  if (!techNames.length) {
    document.getElementById("techPerformanceList").innerHTML = `<div class="empty-state">No approved technicians yet.</div>`;
    return;
  }
  document.getElementById("techPerformanceList").innerHTML = techNames.map((name) => {
    const assigned = state.requests.filter((r) => (r.pickupTech || '').startsWith(name + ' \u2014') || (r.pickupTech || '').startsWith(name + ' -') || r.pickupTech === name);
    const total = assigned.length;
    const completed = assigned.filter((r) => r.statusIndex >= 17).length;
    const active = assigned.filter((r) => r.statusIndex >= 1 && r.statusIndex < 17).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return `
      <div class="vendor-row">
        <div><strong>${name}</strong><br><small>${completed} done · ${active} active · ${total} total</small></div>
        <span class="status-pill">${rate}%</span>
      </div>
    `;
  }).join("");

  // Job postings
  renderJobPostings();
  const jobForm = document.getElementById("jobPostingForm");
  if (jobForm) {
    jobForm.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById("jobTitle").value.trim();
      const role = document.getElementById("jobRole").value;
      const location = document.getElementById("jobLocation").value.trim();
      const description = document.getElementById("jobDescription").value.trim();
      if (!title) return;
      try {
        const job = { title, role, location, description, status: "Open" };
        const result = await supabase.from("job_postings").insert(job).select();
        if (result.error) throw result.error;
        document.getElementById("jobPostingForm").reset();
        state.jobPostings = await fetchJobPostings();
        renderJobPostings();
      } catch (err) {
        showToast("Failed to create job posting", "error");
      }
    };
  }
}

function renderAdminDetail(req) {
  if (!req) { document.getElementById("adminRequestContent").innerHTML = '<div class="empty-state">Request not found</div>'; return; }
  document.getElementById("adminDetailTitle").textContent = `${req.id} — ${req.model}`;
  document.getElementById("adminDetailStatus").textContent = statuses[req.statusIndex];
  const content = document.getElementById("adminRequestContent");
  const imgs = [...(req.requestImages || []), ...(req.conditionImages || [])].filter(Boolean);
  const timeStr = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—';
  content.innerHTML = `
    <div class="rd-grid">
      <div class="rd-info-card">
        <p class="eyebrow">Customer</p>
        <table class="coord-info-table">
          <tr><td>Name</td><td>${escHtml(req.customer)}</td></tr>
          <tr><td>Phone</td><td>${escHtml(req.phone || '—')}</td></tr>
          <tr><td>Address</td><td>${escHtml(req.address)}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Device</p>
        <table class="coord-info-table">
          <tr><td>ID</td><td>${escHtml(req.id)}</td></tr>
          <tr><td>Created</td><td>${timeStr}</td></tr>
          <tr><td>Type</td><td>${escHtml(req.deviceType || 'Smartphone')}</td></tr>
          <tr><td>Brand</td><td>${req.brand || '—'}</td></tr>
          <tr><td>Model</td><td>${escHtml(req.model)}</td></tr>
          <tr><td>Issue</td><td>${escHtml(req.issue)}</td></tr>
          <tr><td>Status</td><td>${statuses[req.statusIndex]}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Assignment</p>
        <table class="coord-info-table">
          <tr><td>Pickup Tech</td><td>${escHtml(req.pickupTech || '—')}</td></tr>
          <tr><td>Repair Partner</td><td>${escHtml(req.repairPartner || '—')}</td></tr>
        </table>
      </div>
      <div class="rd-info-card">
        <p class="eyebrow">Financials</p>
        ${req.quoteAmount ? '<p style="font-size:24px;font-weight:700;color:var(--teal)">' + formatCurrency(req.quoteAmount) + '</p>' : '<p style="color:var(--muted)">No quote yet</p>'}
        <table class="coord-info-table">
          <tr><td>Payment</td><td>${req.paymentStatus || '—'}</td></tr>
          <tr><td>Method</td><td>${req.paymentMethod || '—'}</td></tr>
        </table>
      </div>
    </div>
    ${imgs.length ? '<div class="rd-info-card" style="margin-top:14px"><p class="eyebrow">Photos</p><div class="rd-photos">' + imgs.map(u => '<img src="' + u + '" loading="lazy">').join('') + '</div></div>' : ''}
    <div class="rd-info-card" style="margin-top:14px">
      <p class="eyebrow">CRM Notes</p>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="adminCrmNoteInput" placeholder="Add a note..." style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px;font-size:13px">
        <button id="adminCrmNoteAddBtn" class="primary-action" style="white-space:nowrap">Add Note</button>
      </div>
      <div id="adminCrmNotesList">${(req.crmNotes || []).map(n => '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--line)"><strong>' + escHtml(n.author || '—') + '</strong> <span style="color:var(--muted)">' + (n.date || '') + '</span><br>' + escHtml(n.text) + '</div>').join('') || '<span style="color:var(--muted);font-size:12px">No notes yet</span>'}</div>
    </div>
    <div class="rd-progress-compact" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border);margin-top:14px">
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Current</div>
        <div style="font-size:14px;font-weight:700">${statuses[req.statusIndex] || 'Unknown'}</div>
      </div>
      <div style="width:24px;text-align:center;color:var(--muted)">→</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Next</div>
        <div style="font-size:14px;font-weight:600;color:var(--muted)">${req.statusIndex < statuses.length - 1 ? statuses[req.statusIndex + 1] : '—'}</div>
      </div>
    </div>
  `;
  document.getElementById("adminCrmNoteAddBtn")?.addEventListener("click", () => {
    const input = document.getElementById("adminCrmNoteInput");
    if (!input || !input.value.trim()) return;
    const req2 = activeRequest();
    if (!req2) return;
    if (!req2.crmNotes) req2.crmNotes = [];
    req2.crmNotes.push({ text: input.value.trim(), author: state.activeUser?.name || 'Admin', date: new Date().toLocaleString() });
    input.value = '';
    saveState();
    renderAdminDetail(req2);
    showToast('Note added');
  });
}

document.getElementById("adminDetailBackBtn")?.addEventListener("click", () => closeRoleDetail('admin'));

function renderJobPostings() {
  const list = document.getElementById("jobPostingList");
  if (!list) return;
  const jobs = state.jobPostings || [];
  if (!jobs.length) {
    list.innerHTML = `<div class="empty-state">No job postings yet.</div>`;
    return;
  }
  list.innerHTML = jobs.map((j) => `
    <div class="vendor-row">
      <div>
        <strong>${j.title}</strong><br>
        <small>${j.role} · ${j.location || "Anywhere"}</small>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="status-pill" style="background:${j.status === 'Open' ? '#d4ede4' : '#f0f0f0'}">${j.status}</span>
        <button class="secondary-action" data-id="${j.id}" style="padding:4px 8px;font-size:11px">${j.status === 'Open' ? 'Close' : 'Reopen'}</button>
        <button class="secondary-action" data-id="${j.id}" data-delete style="padding:4px 8px;font-size:11px;color:var(--red)">Delete</button>
      </div>
    </div>
  `).join("");
  // Event delegation for toggle and delete
  list.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id);
      if (btn.hasAttribute("data-delete")) {
        await supabase.from("job_postings").delete().eq("id", id);
        state.jobPostings = await fetchJobPostings();
        renderJobPostings();
      } else {
        const job = jobs.find((j) => j.id === id);
        const newStatus = job.status === "Open" ? "Closed" : "Open";
        await supabase.from("job_postings").update({ status: newStatus }).eq("id", id);
        state.jobPostings = await fetchJobPostings();
        renderJobPostings();
      }
    };
  });
}

function renderMarketplace() {
  const available = state.marketplace.filter((item) => !item.sold);
  const filtered = marketFilter === "All" ? available : available.filter((item) => item.grade === marketFilter);
  if (!filtered.length) {
    document.getElementById("marketGrid").innerHTML = `<div class="empty-state" style="grid-column:1/-1">No devices match this grade filter.</div>`;
    return;
  }
  document.getElementById("marketGrid").innerHTML = filtered.map((item, index) => {
    const finalPrice = displayPrice(item.basePrice);
    const imgs = item.images && item.images.length ? item.images : [defaultDeviceIcon];
    const slide = item.currentSlide || 0;
    const currentImg = imgs[slide] || imgs[0];
    const showNav = imgs.length > 1;
    const prevIdx = (slide - 1 + imgs.length) % imgs.length;
    const nextIdx = (slide + 1) % imgs.length;
    if (item.sold) {
      return `
        <article class="market-card" style="opacity:0.5">
          <div class="market-card-image-wrap">
            <img class="market-card-image" src="${currentImg}" alt="${item.model}" loading="lazy" style="filter:grayscale(1)">
          </div>
          <div class="market-body">
            <span class="grade-pill">Grade ${item.grade}</span>
            <span class="status-pill" style="background:#fde8e8;color:var(--red);margin-left:6px">Sold</span>
            <h3>${item.model}</h3>
            <p>Sold from ${item.owner}</p>
            <div class="market-footer">
              <strong>${formatCurrency(finalPrice)}</strong>
              <button disabled style="opacity:0.5">Sold</button>
            </div>
          </div>
        </article>
      `;
    }
    return `
      <article class="market-card">
        <div class="market-card-image-wrap">
          <img class="market-card-image" src="${currentImg}" alt="${item.model}" loading="lazy">
          ${showNav ? `
          <button class="slide-btn slide-prev" data-slide="${index}" data-dir="-1">&#8249;</button>
          <button class="slide-btn slide-next" data-slide="${index}" data-dir="1">&#8250;</button>
          <div class="slide-dots">${imgs.map((_, i) => `<span class="slide-dot${i === slide ? ' active' : ''}"></span>`).join('')}</div>
          ` : ""}
        </div>
        <div class="market-body">
          <span class="grade-pill">Grade ${item.grade}</span>
          <h3>${item.model}</h3>
          <p>${item.owner} | ${item.warranty} warranty</p>
          <div class="market-footer">
            <strong>${formatCurrency(finalPrice)}</strong>
            <button class="buy-btn" data-index="${index}">Buy</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".slide-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.slide);
      const item = state.marketplace[idx];
      if (item) {
        const imgs = item.images && item.images.length ? item.images : [defaultDeviceIcon];
        item.currentSlide = (item.currentSlide || 0) + Number(btn.dataset.dir);
        if (item.currentSlide < 0) item.currentSlide = imgs.length - 1;
        if (item.currentSlide >= imgs.length) item.currentSlide = 0;
        saveState();
        renderMarketplace();
      }
    });
  });

  document.querySelectorAll(".buy-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const item = state.marketplace[index];
      if (item && !item.sold) {
        item.sold = true;
        const orderId = `MO-${1001 + state.marketOrders.length}`;
        state.marketOrders.unshift({
          id: orderId,
          itemModel: item.model,
          grade: item.grade,
          basePrice: item.basePrice,
          customer: "Marketplace Buyer",
          repairMaster: item.owner,
          statusIndex: 0,
          assignedTech: "",
          address: "Customer address pending"
        });
        saveState();
        renderAll();
        showToast(`${item.model} purchased. Order ${orderId} created for coordinator dispatch.`);
      }
    });
  });
}

function updateListingCommission() {
  const basePrice = Number(document.getElementById("listingPrice").value || 0);
  const finalPrice = displayPrice(basePrice);
  document.getElementById("listingCommission").textContent = `${formatCurrency(finalPrice)}`;
}

function renderHotDeals() {
  const deals = state.marketplace.filter((item) => !item.sold).slice(0, 3);
  const grid = document.getElementById("hotDealsGrid");
  if (!grid) return;
  if (!deals.length) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center">Check back for new deals.</p>`;
    return;
  }
  grid.innerHTML = deals.map((item) => {
    const imgs = item.images && item.images.length ? item.images : [defaultDeviceIcon];
    return `
    <div class="hot-deal-card">
      <span class="hot-badge">Hot Deal</span>
      <img class="hot-deal-img" src="${imgs[0]}" alt="${item.model}" loading="lazy">
      <h4>${item.model}</h4>
      <p>Grade ${item.grade} &middot; ${item.warranty}</p>
      <strong>${formatCurrency(displayPrice(item.basePrice))}</strong>
    </div>
  `}).join("");
}

function renderAll() {
  updateUserBadge();
  if (!state.activePortal || state.activePortal === 'login') {
    renderHotDeals();
    return;
  }
  renderProgress();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(state.activePortal);
  if (activeView) activeView.classList.add('active');
  switch (state.activePortal) {
    case 'customer': renderCustomer(); break;
    case 'coordinator': renderCoordinator(); break;
    case 'technician': renderTechnician(); break;
    case 'repairmaster': renderRepairingMaster(); break;
    case 'admin': renderAdmin(); break;
    case 'marketplace': renderMarketplace(); break;
  }
  renderNotifications();
}

function detectCity(text) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const cities = [
    ["mumbai", "Mumbai"], ["bengaluru", "Bengaluru"], ["bangalore", "Bengaluru"],
    ["delhi", "Delhi"], ["noida", "Delhi"], ["gurgaon", "Delhi"],
    ["pune", "Pune"], ["hyderabad", "Hyderabad"], ["chennai", "Chennai"],
    ["kolkata", "Kolkata"], ["ahmedabad", "Ahmedabad"], ["jaipur", "Jaipur"],
    ["lucknow", "Lucknow"], ["surat", "Surat"]
  ];
  for (const [keyword, city] of cities) {
    if (lower.includes(keyword)) return city;
  }
  return "";
}

function matchesCity(itemCity, customerCity) {
  if (!customerCity) return true;
  const map = {
    "Mumbai": ["Mumbai West", "Mumbai Region", "FixHub Andheri"],
    "Bengaluru": ["Bengaluru Central", "TechCare Koramangala"],
    "Delhi": ["Delhi NCR", "Prime Mobile Lab Noida"],
    "Pune": ["Pune"],
    "Hyderabad": ["Hyderabad"],
    "Chennai": ["Chennai"],
    "Kolkata": ["Kolkata"]
  };
  const keywords = map[customerCity] || [customerCity];
  return keywords.some(k => itemCity.toLowerCase().includes(k.toLowerCase()) || itemCity.toLowerCase().includes(customerCity.toLowerCase()));
}

function renderLocalDeals() {
  const grid = document.getElementById("localDealsGrid");
  const label = document.getElementById("dealsLocationLabel");
  if (!grid) return;
  const customerCity = (state.activeUser && state.activeUser.city) || detectCity(state.requests.find(r => r.customer === (state.activeUser ? state.activeUser.name : ""))?.address || "");
  label.textContent = customerCity ? `Hot deals in ${customerCity}` : "Hot deals near you";
  const deals = state.marketplace.filter(item => !item.sold && matchesCity(item.owner, customerCity)).slice(0, 4);
  if (!deals.length) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center">No deals in your city yet. Check back soon.</p>`;
    return;
  }
  grid.innerHTML = deals.map(item => {
    const imgs = item.images && item.images.length ? item.images : [defaultDeviceIcon];
    return `
    <div class="local-deal-card">
      <span class="local-badge">Near you</span>
      <img class="local-deal-img" src="${imgs[0]}" alt="${item.model}" loading="lazy">
      <h4>${item.model}</h4>
      <p>${item.owner} &middot; ${item.warranty}</p>
      <strong>${formatCurrency(displayPrice(item.basePrice))}</strong>
    </div>
  `}).join("");
}

function isEmployeeRole(role) {
  return ["technician", "repairmaster", "coordinator"].includes(role);
}

function verifyEmployeeAccess(role) {
  const roleLower = role.toLowerCase();
  return state.applications.some((a) => a.role && a.status === "Approved" && (a.role.toLowerCase() === roleLower || (roleLower === "repairmaster" && a.role.toLowerCase() === "repairingmaster")));
}

document.getElementById("operationSelect")?.addEventListener("change", (event) => switchView(event.target.value));

document.getElementById("unifiedLoginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const mode = document.querySelector(".login-tab.active")?.dataset.tab || "signup";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const name = document.getElementById("loginName").value.trim();
  const city = document.getElementById("loginCity").value.trim();

  if (!email || !password) { showToast("Email and password are required"); return; }
  if (!email.includes("@") || !email.includes(".")) { showToast("Enter a valid email address"); return; }
  if (mode === "signup" && !name) { showToast("Please enter your name"); return; }

  try {
    if (mode === "signup") {
      const result = await signUpWithEmail(email, password, { name, email, role: 'customer', city: city || '' });
      if (!result.user) {
        showToast("Account created! Check your email to confirm before signing in.");
        return;
      }
      state.activeUser = { name, email, role: 'customer', city: city || '' };
      loginPortal('customer');
    } else {
      // Sign In or Employee Sign In
      const { user } = await signInWithEmail(email, password);
      const profile = await fetchProfile(user.id);
      state.activeUser = profile || { name: email.split('@')[0], email, role: 'customer', city: '' };
      const userRole = profile?.role || 'customer';

      if (mode === "employee") {
        if (!isEmployeeRole(userRole)) {
          showToast("No employee role found for this account. Apply for a position first.");
          await signOutUser();
          return;
        }
        if (!await checkEmployeeAccess(user.id, userRole)) {
          showToast("Access denied. No approved application found for your role.");
          await signOutUser();
          return;
        }
      }
      loginPortal(userRole);
    }
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('already registered') || msg.includes('Email not confirmed')) {
      try {
        const { user } = await signInWithEmail(email, password);
        const profile = await fetchProfile(user.id);
        state.activeUser = profile || { name: email.split('@')[0], email, role: 'customer', city: '' };
        const userRole = profile?.role || 'customer';
        if (mode === "employee") {
          if (!isEmployeeRole(userRole) || !await checkEmployeeAccess(user.id, userRole)) {
            showToast("No approved application found.");
            await signOutUser();
            return;
          }
        }
        loginPortal(userRole);
      } catch { showToast("Login failed. Check your password."); }
    } else if (msg.includes('Invalid login credentials')) {
      if (mode === "signin" || mode === "employee") showToast("Wrong email or password.");
      else showToast("Account not found. Try the Sign Up tab to create one.");
    } else {
      showToast(msg || "Authentication failed");
    }
  }
});

const roleFields = {
  technician: [
    { id: "appExp", label: "Years of experience", type: "number", placeholder: "e.g. 3" },
    { id: "appSpec", label: "Specialization", type: "select", options: ["Mobile Phones", "Laptops", "TV & Monitors", "All Devices"] },
    { id: "appCert", label: "Certifications", type: "text", placeholder: "e.g. Mobile Repair Certified, Apple ACMT" },
    { id: "appWorkType", label: "Work type", type: "select", options: ["On-site only", "Shop-based", "Both"] }
  ],
  repairmaster: [
    { id: "appStore", label: "Store / workshop name", type: "text", placeholder: "e.g. FixHub Andheri" },
    { id: "appOwner", label: "Owner name", type: "text", placeholder: "Full name" },
    { id: "appYearsBiz", label: "Years in business", type: "number", placeholder: "e.g. 5" },
    { id: "appTechs", label: "Number of technicians", type: "number", placeholder: "e.g. 3" },
    { id: "appGst", label: "GST number (optional)", type: "text", placeholder: "e.g. 27AABCU9603R1ZX" },
    { id: "appPincodes", label: "Service pincodes", type: "text", placeholder: "e.g. 400001, 400002, 400003" },
    { id: "appHours", label: "Business hours", type: "text", placeholder: "e.g. Mon-Sat 10AM-8PM" }
  ],
  coordinator: [
    { id: "appCoordExp", label: "Previous experience", type: "textarea", placeholder: "Describe your relevant experience in logistics / coordination" },
    { id: "appLanguages", label: "Languages spoken", type: "text", placeholder: "e.g. Hindi, English, Marathi" },
    { id: "appArea", label: "Area of operation", type: "text", placeholder: "e.g. Mumbai Western Suburbs" },
    { id: "appTransport", label: "Transport options", type: "select", options: ["Two-wheeler", "Car/Van", "Public transport", "All of the above"] }
  ],
  admin: [
    { id: "appAdminReason", label: "Qualifications & reason", type: "textarea", placeholder: "Why do you want to be an admin? Describe your qualifications." },
    { id: "appMgmtExp", label: "Previous management experience", type: "textarea", placeholder: "Describe any team management or operations experience" },
    { id: "appRef", label: "Reference (existing employee)", type: "text", placeholder: "Name of current RepairingMaster or coordinator" }
  ]
};

function renderDynamicFields(role) {
  const container = document.getElementById("appDynamicFields");
  if (!container) return;
  const fields = roleFields[role] || [];
  container.innerHTML = fields.map(f => {
    if (f.type === "select") {
      return `<label>${f.label} <select id="${f.id}">${f.options.map(o => `<option>${o}</option>`).join("")}</select></label>`;
    }
    if (f.type === "textarea") {
      return `<label>${f.label} <textarea id="${f.id}" placeholder="${f.placeholder}"></textarea></label>`;
    }
    return `<label>${f.label} <input id="${f.id}" type="${f.type}" placeholder="${f.placeholder || ""}"></label>`;
  }).join("");
}

// Role pill switching
document.querySelectorAll(".role-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".role-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    renderDynamicFields(pill.dataset.role);
  });
});

// Application form submit
document.getElementById("applicationForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const activePill = document.querySelector(".role-pill.active");
  const roleKey = activePill.dataset.role;
  const roleLabel = roleKey === "repairmaster" ? "RepairingMaster" : roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
  const name = document.getElementById("appName").value.trim();
  const email = document.getElementById("appEmail").value.trim();
  const phone = document.getElementById("appPhone").value.trim();
  const location = document.getElementById("appLocation").value;
  if (!name || !email || !phone) {
    showToast("Please fill in name, email, and phone");
    return;
  }
  const details = {};
  (roleFields[roleKey] || []).forEach(f => {
    const el = document.getElementById(f.id);
    if (el) details[f.label] = el.value;
  });
  // Save to Supabase
  try {
    // Sign up the applicant as a Supabase Auth user first
    const password = document.getElementById("loginPassword").value.trim();
    if (!password) {
      showToast("Enter a password in the field above to create your account");
      return;
    }
    let userId = null;
    try {
      const { user } = await signUpWithEmail(email, password, { name, email, role: roleLabel });
      userId = user.id;
    } catch (signUpErr) {
      // User may already exist — try signing in to get their ID
      try {
        const { user } = await signInWithEmail(email, password);
        userId = user.id;
      } catch (signInErr) {
        showToast("Could not create account. Check your email/password.");
        return;
      }
    }
    const app = await createApplication({
      user_id: userId,
      name, email, phone,
      role: roleLabel,
      location,
      details,
      status: "Pending"
    });
    state.applications.unshift({ ...app, id: undefined });
    // Notify admin about new application
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    for (const admin of (admins || [])) {
      await createNotification({ user_id: admin.id, message: `New ${roleLabel} application from ${name}`, type: 'info', link: 'admin' });
    }
  } catch (e) {
    state.applications.unshift({ name, email, phone, role: roleLabel, location, details, status: "Pending" });
  }
  saveState();
  renderHotDeals();
  document.getElementById("applicationForm").reset();
  showToast(`${roleLabel} application submitted for ${location}`);
  renderNotifications();
});

// ─── Notifications ─────────────────────────────
function pendingActionCount() {
  return (state.requests || []).filter(r => {
    if (r.statusIndex >= statuses.length - 1) return false;
    const a = COORD_ACTIONS[r.statusIndex];
    return a && (a.urgency === 'critical' || a.urgency === 'high');
  }).length;
}

async function renderNotifications() {
  let userId;
  try { userId = (await getCurrentSession())?.user?.id; } catch { return; }
  if (!userId) return;
  const notifs = await fetchNotifications(userId);
  const unread = notifs.filter(n => !n.read).length;
  // For coordinator view, show pending action count as badge
  const isCoord = state.activePortal === 'coordinator';
  const pac = isCoord ? pendingActionCount() : 0;
  const badgeCount = isCoord && pac > 0 ? pac : unread;
  document.getElementById("notifBadge").textContent = badgeCount || "";
  document.getElementById("notifBadge").style.display = badgeCount ? "flex" : "none";
  const list = document.getElementById("notifList");
  if (!notifs.length) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }
  list.innerHTML = notifs.map(n => {
    const typeIcon = n.type === 'success' ? '✓' : n.type === 'warning' ? '⚠' : '•';
    const dotColor = n.read ? 'var(--muted)' : '#0b7f7a';
    return `
    <div class="notif-item ${n.read ? "" : "unread"}" data-nid="${n.id}" style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);cursor:pointer;align-items:flex-start">
      <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:${n.read ? 'var(--line)' : '#e8f4f3'};display:flex;align-items:center;justify-content:center;font-size:11px;color:${dotColor}">${typeIcon}</span>
      <div style="flex:1;min-width:0">
        <span class="notif-msg" style="font-size:13px;${n.read ? 'color:var(--muted)' : 'font-weight:600'}">${n.message}</span>
        <div style="font-size:11px;color:var(--muted);margin-top:3px">${new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll(".notif-item").forEach(el => {
    el.addEventListener("click", async () => {
      const nid = Number(el.dataset.nid);
      await markNotificationRead(nid);
      renderNotifications();
      const notif = notifs.find(n => n.id === nid);
      if (notif && notif.link) switchView(notif.link);
    });
  });
}

document.getElementById("notifBell")?.addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("notifPanel")?.classList.toggle("open");
  renderNotifications();
});

document.getElementById("markAllReadBtn")?.addEventListener("click", async () => {
  const userId = (await getCurrentSession())?.user?.id;
  if (!userId) return;
  await markAllNotificationsRead(userId);
  renderNotifications();
});

document.addEventListener("click", (e) => {
  const panel = document.getElementById("notifPanel");
  if (panel?.classList.contains("open") && !panel.contains(e.target) && e.target.id !== "notifBell") {
    panel.classList.remove("open");
  }
});

// Init dynamic fields on page load
renderDynamicFields("technician");

document.getElementById("switchPortalBtn")?.addEventListener("click", logoutPortal);
document.getElementById("sidebarLogoutBtn")?.addEventListener("click", logoutPortal);
document.getElementById("topbarLogoutBtn")?.addEventListener("click", logoutPortal);

async function notifyRoles(roles, message, type = 'info', link = '') {
  const { data: users } = await supabase.from('profiles').select('id').in('role', roles);
  for (const u of (users || [])) {
    await createNotification({ user_id: u.id, message, type, link });
  }
}

document.getElementById("advanceStatus")?.addEventListener("click", async () => {
  const request = activeRequest();
  if (!request) { showToast("No active request"); return; }
  if (request.statusIndex >= statuses.length - 1) {
    showToast("Repair lifecycle is already complete");
    return;
  }
  if (request.statusIndex === 1 && (!request.quoteItems || !request.quoteItems.length)) {
    showToast("Prepare and send quotation before advancing");
    return;
  }
  if (request.statusIndex === 3 && !request.pickupTech) {
    showToast("Assign a pickup technician before scheduling pickup");
    return;
  }
  if (request.statusIndex === 3 && !request.repairPartner) {
    showToast("Assign a repair partner before scheduling pickup");
    return;
  }
  if (request.statusIndex === 4 && !request.otpVerified) {
    showToast("OTP must be verified before marking device picked up");
    return;
  }
  if (request.statusIndex === 14 && !request.paymentMethod) {
    showToast("Customer must select a payment method first");
    return;
  }
  if ((request.statusIndex === 16 || request.statusIndex === 17) && !request.deliveryOtpVerified) {
    showToast("Delivery OTP must be verified before confirming delivery");
    return;
  }
  if (request.statusIndex === 17 && request.paymentMethod === "Cash on Delivery" && request.paymentStatus !== "Paid") {
    showToast("COD payment must be collected before finalizing");
    return;
  }
  if (request.statusIndex === 20 && !request.deliveryTech) {
    showToast("Assign a return technician before advancing");
    return;
  }
  const prevIndex = request.statusIndex;
  request.statusIndex = Math.min(request.statusIndex + 1, statuses.length - 1);
  if (request.statusIndex === 12) request.invoiceSent = true;
  saveState();
  renderAll();
  const statusName = statuses[request.statusIndex];
  const msg = `Request ${request.id} is now: ${statusName}`;
  // Notify customer at key touchpoints only
  if (request.customer_id) {
    const customerMsgs = {
      2: `Your pre-quote for ${request.id} is ready — review & approve`,
      6: `A diagnosed quote for ${request.id} has been sent by the repairmaster`,
      12: `Final invoice for ${request.id} is ready — select payment method`,
      16: `${request.id} is out for delivery`,
      17: `${request.id} has been delivered. Thank you!`,
      18: `${request.id} is complete. Thank you!`,
      20: `${request.id}: Repair declined. Return will be arranged.`
    };
    const msg = customerMsgs[request.statusIndex];
    if (msg) await createNotification({ user_id: request.customer_id, message: msg, type: 'info' });
  }
  // Role-based notifications per status — coordinator is central hub
  switch (request.statusIndex) {
    case 1: // Under Review → coordinator evaluates
      await notifyRoles(['coordinator'], `${request.id}: Under review — prepare quotation`, 'info', 'coordinator');
      if (request.customer_id) {
        await createNotification({ user_id: request.customer_id, message: `Your request ${request.id} has been accepted and is under review.`, type: 'info' });
      }
      break;
    case 2: // Pre-Quote Sent → customer reviews
      break;
    case 3: // Customer approved → coordinator assigns team
      await notifyRoles(['coordinator'], `${request.id}: Customer approved quotation — assign technician & repairmaster`, 'info', 'coordinator');
      await notifyRoles(['repairmaster'], `${request.id}: Customer approved — prepare to receive device`, 'info', 'repairmaster');
      break;
    case 4: // Pickup Scheduled → notify assigned technician
      await notifyRoles(['technician'], `Pickup scheduled for ${request.id}`, 'info', 'technician');
      await notifyRoles(['coordinator'], `${request.id}: Pickup scheduled with technician`, 'info', 'coordinator');
      break;
    case 5: // Device Picked Up → notify RepairingMaster
      await notifyRoles(['repairmaster'], `Device ${request.id} picked up — inspect & diagnose`, 'info', 'repairmaster');
      await notifyRoles(['coordinator'], `${request.id}: Device picked up, sent to repairmaster`, 'info', 'coordinator');
      break;
    case 6: // Diagnosed Quote Sent → coordinator informed
      await notifyRoles(['coordinator'], `${request.id}: Diagnosed quote sent to customer`, 'info', 'coordinator');
      break;
    case 7: // Diagnosed Quote Approved → repair can start
      await notifyRoles(['coordinator'], `${request.id}: Diagnosed quote approved`, 'info', 'coordinator');
      break;
    case 8: // Device Under Repair
      await notifyRoles(['coordinator'], `${request.id}: Device under repair`, 'info', 'coordinator');
      break;
    case 9: // Quality Check
      await notifyRoles(['coordinator'], `${request.id}: Quality check in progress`, 'info', 'coordinator');
      break;
    case 10: // Repair Completed
      break;
    case 11: // Coordinator Reviewing
      break;
    case 12: // Final Invoice Sent → customer
      break;
    case 13: // Payment Method Selection
      break;
    case 14: // Payment Confirmed
      await notifyRoles(['coordinator'], `Payment confirmed for ${request.id}`, 'success', 'coordinator');
      break;
    case 15: // Delivery Assignment
      if (request.technician_id) {
        await createNotification({ user_id: request.technician_id, message: `${request.id} ready for delivery`, type: 'info', link: 'technician' });
      }
      await notifyRoles(['coordinator'], `${request.id}: Ready for delivery`, 'info', 'coordinator');
      break;
    case 16: // Out for Delivery
      break;
    case 17: // Device Delivered
      await notifyRoles(['coordinator'], `${request.id}: Delivered to customer`, 'info', 'coordinator');
      break;
    case 18: // Payment Completed
      await notifyRoles(['coordinator'], `Payment received for ${request.id}`, 'success', 'coordinator');
      break;
    case 19: // Request Closed
      break;
    case 20: // Repair Declined
      await notifyRoles(['coordinator'], `${request.id}: Repair declined by customer`, 'warning', 'coordinator');
      break;
    case 21: // Device Returned
      await notifyRoles(['coordinator'], `${request.id}: Device returned to customer`, 'info', 'coordinator');
      break;
  }
  renderNotifications();
  showToast(`${request.id} moved to ${statusName}`);
});

document.getElementById("resetDemo")?.addEventListener("click", async () => {
  if (!confirm("Reset all demo data? This will clear all requests, applications, and marketplace changes.")) return;
  state = structuredClone(defaultState);
  document.getElementById("loginScreen")?.classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
  await saveState();
  await resetAllData();
  showToast("Demo data reset");
});

document.getElementById("requestImageInput")?.addEventListener("change", () => {
  const previews = document.getElementById("requestImagePreviews");
  previews.innerHTML = "";
  for (const file of Array.from(document.getElementById("requestImageInput").files)) {
    const reader = new FileReader();
    reader.onload = e => { const img = document.createElement("img"); img.src = e.target.result; img.style.cssText = "width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--line)"; previews.appendChild(img); };
    reader.readAsDataURL(file);
  }
});

document.getElementById("serviceForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("nameInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const deviceType = document.getElementById("deviceType").value;
  const brand = document.getElementById("brandInput").value;
  const model = document.getElementById("modelInput").value.trim();
  const issue = document.getElementById("issueInput").value;
  const address = document.getElementById("addressInput").value.trim();
  if (!name || !phone || !model || !address) {
    showToast("Please fill in your name, phone, device model, and pickup address");
    return;
  }
  const existing = state.requests.find(r => r.customer === name && r.model === model && r.issue === issue && r.statusIndex < statuses.length - 1);
  if (existing) {
    showToast(`You already have an open request (${existing.id}) for this device.`);
    state.activeRequestId = existing.id;
    saveState();
    renderAll();
    return;
  }
  const id = `RM-${1024 + state.requests.length}`;
  const session = await getCurrentSession();
  const request = {
    id,
    customer: name,
    phone,
    deviceType,
    customer_id: session?.user?.id || null,
    brand,
    model,
    issue,
    address,
    statusIndex: 0,
    pickupTech: "",
    repairPartner: "",
    quoteAmount: 0,
    quoteApproved: false,
    paymentStatus: "Pending",
    paymentMethod: "",
    invoiceSent: false,
    pickupOtp: String(Math.floor(1000 + Math.random() * 9000)),
    rmOtp: '',
    deliveryOtp: '',
    deliveryOtpVerified: false,
    otpVerified: false,
    checks: { accepted: false, otp: false, photos: false, handover: false, delivery: false },
    conditionImages: [],
    requestImages: [],
    requirements: { backCover: "", glassType: "" },
    quoteItems: [],
    taxPercent: 0,
    taxAmount: 0
  };
  // Upload device photos from the form
  const imgInput = document.getElementById("requestImageInput");
  if (imgInput && imgInput.files && imgInput.files.length) {
    for (const file of Array.from(imgInput.files)) {
      try {
        const url = await uploadImage(file);
        request.requestImages.push(url);
      } catch {
        const reader = new FileReader();
        const url = await new Promise(r => { reader.onload = e => r(e.target.result); reader.readAsDataURL(file); });
        request.requestImages.push(url);
      }
    }
  }
  state.requests.unshift(request);
  state.activeRequestId = id;
  saveState();
  renderAll();
  // Notify customer their request was submitted
  if (session?.user?.id) {
    await createNotification({ user_id: session.user.id, message: `Your request ${id} has been submitted. A coordinator will review it shortly.`, type: 'info' });
  }
  // Notify coordinator about new request
  await notifyRoles(['coordinator'], `New request ${id} from ${name} — ${model}: ${issue}. Accept to begin review`, 'info', 'coordinator');
  renderNotifications();
  showToast(`${id} created for ${name} and sent to coordinator`);
});

document.getElementById("approveQuote")?.addEventListener("click", async () => {
  const request = activeRequest();
  request.quoteApproved = true;
  request.statusIndex = Math.max(request.statusIndex, 3);
  saveState();
  renderAll();
  await notifyRoles(['coordinator'], `${request.id}: Customer approved quotation — assign technician & repairmaster`, 'info', 'coordinator');
  renderNotifications();
  showToast("Quotation approved — coordinator notified to assign team");
});

document.getElementById("uploadConditionBtn")?.addEventListener("click", async () => {
  const input = document.getElementById("conditionInput");
  const request = activeRequest();
  if (!input.files || !input.files.length) {
    showToast("Select device condition photos to upload");
    return;
  }
  let loaded = 0;
  const total = input.files.length;
  for (const file of Array.from(input.files)) {
    try {
      const url = await uploadImage(file);
      request.conditionImages.push(url);
    } catch {
      // fallback to data URL
      const reader = new FileReader();
      const url = await new Promise(r => { reader.onload = e => r(e.target.result); reader.readAsDataURL(file); });
      request.conditionImages.push(url);
    }
    loaded++;
  }
  saveState();
  renderAll();
  showToast(`${total} condition photo(s) uploaded`);
  input.value = "";
});

document.getElementById("saveRequirements")?.addEventListener("click", () => {
  const request = activeRequest();
  const backCover = document.getElementById("backCoverInput").value;
  const glassType = document.getElementById("glassInput").value;
  if (!backCover || !glassType) {
    showToast("Please select both back cover and glass preferences");
    return;
  }
  request.requirements = { backCover, glassType };
  request.statusIndex = Math.max(request.statusIndex, 1);
  saveState();
  renderAll();
  showToast("Requirements saved");
});

document.getElementById("payOnlineBtn")?.addEventListener("click", () => {
  const request = activeRequest();
  if (!request) return;
  request.paymentMethod = "Online";
  request.paymentStatus = "Paid";
  request.statusIndex = Math.max(request.statusIndex, 13);
  saveState();
  renderAll();
  showToast("Online payment received — awaiting coordinator confirmation");
});

document.getElementById("payCodBtn")?.addEventListener("click", () => {
  const request = activeRequest();
  if (!request) return;
  request.paymentMethod = "Cash on Delivery";
  request.paymentStatus = "Pending (COD)";
  request.statusIndex = Math.max(request.statusIndex, 13);
  saveState();
  renderAll();
  showToast("Cash on Delivery selected");
});

const assignDeliveryBtn = document.getElementById("assignDelivery");
if (assignDeliveryBtn) {
  assignDeliveryBtn.addEventListener("click", () => {
    const tech = document.getElementById("deliveryTech").value;
    const address = document.getElementById("deliveryAddress").value.trim();
    const editIdx = document.getElementById("deliveryAddress").dataset.editOrder;
    const order = editIdx ? state.marketOrders[Number(editIdx)] : state.marketOrders.find((o) => o.statusIndex === 0);
    if (!order) { showToast("Select an order first"); return; }
    if (!address) { showToast("Enter a delivery address"); return; }
    order.assignedTech = tech;
    order.address = address;
    order.statusIndex = Math.max(order.statusIndex, 1);
    saveState();
    renderAll();
    showToast(`${order.id} assigned to ${tech}`);
  });
}

const saveAssignBtn = document.getElementById("saveAssignments");
if (saveAssignBtn) {
  saveAssignBtn.addEventListener("click", () => {
    const request = activeRequest();
    request.pickupTech = document.getElementById("pickupTech").value;
    request.repairPartner = document.getElementById("repairPartner").value;
    if (request.statusIndex >= 3) request.statusIndex = 4;
    saveState();
    renderAll();
    showToast("Pickup scheduled and assignments saved");
  });
}

const acceptBtn = document.getElementById("acceptRequestBtn");
if (acceptBtn) {
  acceptBtn.addEventListener("click", async () => {
    const request = activeRequest();
    if (!request || request.statusIndex !== 0) return;
    request.statusIndex = 1;
    saveState();
    renderAll();
    await notifyRoles(['coordinator'], `${request.id}: Accepted — prepare quotation now`, 'success', 'coordinator');
    if (request.customer_id) {
      await createNotification({ user_id: request.customer_id, message: `Your request ${request.id} has been accepted and is under review.`, type: 'info' });
    }
    showToast(`${request.id} accepted — now prepare quotation`);
  });
}

document.getElementById("verifyOtp")?.addEventListener("click", () => {
  // Only fire when coordinator detail is visible (not tech detail)
  if (document.getElementById("coordinatorRequestView")?.style?.display !== '') return;
  const request = activeRequest();
  if (document.getElementById("otpInput").value.length !== 4) {
    showToast("Enter the 4-digit customer OTP");
    return;
  }
  if (request.statusIndex >= 15) {
    request.deliveryOtpVerified = true;
    request.checks.otp = true;
    showToast("Delivery OTP verified");
  } else {
    request.otpVerified = true;
    request.checks.otp = true;
    request.statusIndex = Math.max(request.statusIndex, 5);
    showToast("OTP verified and pickup confirmed");
  }
  saveState();
  renderAll();
});

document.getElementById("sendQuote")?.addEventListener("click", () => {
  const request = activeRequest();
  const selectedCheckboxes = Array.from(document.querySelectorAll(".parts-grid input:checked"));
  if (!selectedCheckboxes.length) {
    showToast("Select at least one repair part before sending quotation");
    return;
  }
  const baseFee = state.baseInspectionFee || 100;
  const minFee = state.minServiceFee || 150;
  const parts = state.repairParts || [];
  const selectedItems = [];
  let partsTotal = 0;
  selectedCheckboxes.forEach((cb) => {
    const pi = Number(cb.dataset.pi);
    const part = parts[pi];
    if (part && part.stock > 0) {
      selectedItems.push({ name: part.name, cost: part.cost });
      partsTotal += part.cost;
      part.stock = Math.max(0, part.stock - 1);
    }
  });
  if (!selectedItems.length) {
    showToast("Selected parts are out of stock");
    return;
  }
  const subtotal = Math.max(partsTotal + baseFee, minFee);
  const scPct = state.serviceChargePercent || 0;
  const serviceCharge = Math.round(subtotal * scPct / 100);
  const taxPct = state.taxPercent || 0;
  const taxableAmount = subtotal + serviceCharge;
  const taxAmount = Math.round(taxableAmount * taxPct / 100);
  const amount = taxableAmount + taxAmount;
  request.quoteAmount = amount;
  request.taxPercent = taxPct;
  request.taxAmount = taxAmount;
  request.serviceChargePercent = scPct;
  request.serviceChargeAmount = serviceCharge;
  request.quoteItems = selectedItems;
  request.statusIndex = Math.max(request.statusIndex, 2);
  saveState();
  renderAll();
  showToast(`Quotation sent for ${formatCurrency(amount)}`);
});

document.getElementById("listingPrice")?.addEventListener("input", updateListingCommission);

const minFeeInput = document.getElementById("minServiceFeeInput");
if (minFeeInput) {
  minFeeInput.addEventListener("change", () => {
    state.minServiceFee = Math.max(0, Number(minFeeInput.value) || 0);
    saveState();
    showToast(`Minimum service fee set to INR ${state.minServiceFee}`);
  });
}

const baseFeeInput = document.getElementById("baseFeeInput");
if (baseFeeInput) {
  baseFeeInput.addEventListener("change", () => {
    state.baseInspectionFee = Math.max(0, Number(baseFeeInput.value) || 0);
    saveState();
    showToast(`Diagnosis fee set to INR ${state.baseInspectionFee}`);
  });
}

const taxInput = document.getElementById("taxPercentInput");
if (taxInput) {
  taxInput.addEventListener("change", () => {
    state.taxPercent = Math.max(0, Math.min(100, Number(taxInput.value) || 0));
    saveState();
    showToast(`Tax rate set to ${state.taxPercent}%`);
  });
}

const scInput = document.getElementById("serviceChargeInput");
if (scInput) {
  scInput.addEventListener("change", () => {
    state.serviceChargePercent = Math.max(0, Math.min(100, Number(scInput.value) || 0));
    saveState();
    showToast(`Service charge set to ${state.serviceChargePercent}%`);
  });
}

document.getElementById("addPartBtn")?.addEventListener("click", () => {
  const name = document.getElementById("newPartName").value.trim();
  const cost = Number(document.getElementById("newPartCost").value || 0);
  const stock = Number(document.getElementById("newPartStock").value || 0);
  if (!name || cost <= 0) {
    showToast("Enter a part name and valid price");
    return;
  }
  state.repairParts.push({ name, cost, stock });
  document.getElementById("newPartName").value = "";
  document.getElementById("newPartCost").value = "";
  document.getElementById("newPartStock").value = "";
  saveState();
  renderAll();
  showToast(`${name} added to parts`);
});

document.addEventListener("input", (e) => {
  const pi = e.target.dataset.pi;
  if (e.target.classList.contains("part-cost-input") && pi !== undefined) {
    const part = state.repairParts[Number(pi)];
    if (part) {
      part.cost = Math.max(0, Number(e.target.value) || 0);
      saveState();
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("part-remove-btn")) {
    const pi = Number(e.target.dataset.pi);
    const part = state.repairParts[pi];
    if (part && confirm(`Remove "${part.name}" from parts list?`)) {
      state.repairParts.splice(pi, 1);
      saveState();
      renderAll();
      showToast(`${part.name} removed`);
    }
  }
  // Customer approve repair quote
  if (e.target.id === 'approveRepairQuote') {
    const r2 = activeRequest(); if (!r2) return;
    r2.statusIndex = 7; saveState(); renderAll();
    if (r2.repairPartner) notifyRoles(['repairmaster'], `${r2.id}: Repair quote approved — start repair`, 'info', 'repairmaster');
    notifyRoles(['coordinator'], `${r2.id}: Repair quote approved — repair can begin`, 'info', 'coordinator');
    showToast('Repair quote approved');
  }
  // Customer reject repair quote
  if (e.target.id === 'rejectRepairQuote') {
    const r2 = activeRequest(); if (!r2) return;
    if (!confirm('Decline this repair quote? A diagnosis fee (₹' + (state.baseInspectionFee || 100) + ') and service fee (₹' + (state.minServiceFee || 150) + ') will apply. Device will be returned.')) return;
    r2.repairDeclined = true;
    r2.statusIndex = 22; saveState(); renderAll();
    if (r2.repairPartner) notifyRoles(['repairmaster'], `${r2.id}: Customer declined the repair quote — do not proceed`, 'warning', 'repairmaster');
    notifyRoles(['coordinator'], `${r2.id}: Customer declined repair. Arrange return via technician. Diagnosis fee + service charge apply.`, 'high', 'coordinator');
    showToast('Repair declined — coordinator will arrange return');
  }
  // Customer add add-on item
  if (e.target.id === 'addAddonBtn') {
    const r3 = activeRequest(); if (!r3) return;
    const name = document.getElementById('addonNameInput')?.value?.trim();
    const cost = Number(document.getElementById('addonCostInput')?.value || 0);
    if (!name || cost <= 0) { showToast('Enter item name and valid price'); return; }
    if (!r3.addonItems) r3.addonItems = [];
    r3.addonItems.push({ name, cost });
    document.getElementById('addonNameInput').value = '';
    document.getElementById('addonCostInput').value = '';
    saveState(); renderAll(); showToast('Item added to invoice');
  }
});

document.getElementById("marketUploadForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const model = document.getElementById("listingModel").value.trim();
  const basePrice = Number(document.getElementById("listingPrice").value || 0);
  if (!model || basePrice <= 0) {
    showToast("Please enter a device model and a valid price");
    return;
  }
  const finalPrice = displayPrice(basePrice);
  const fileInput = document.getElementById("listingImage");
  const item = {
    model,
    grade: document.getElementById("listingGrade").value,
    basePrice,
    warranty: document.getElementById("listingWarranty").value,
    owner: (activeRequest()?.repairPartner) || "RepairingMaster Partner",
    sold: false,
    images: [],
    currentSlide: 0
  };
  if (fileInput.files && fileInput.files.length) {
    for (const file of Array.from(fileInput.files)) {
      try {
        const url = await uploadImage(file);
        item.images.push(url);
      } catch {
        const reader = new FileReader();
        const url = await new Promise(r => { reader.onload = e => r(e.target.result); reader.readAsDataURL(file); });
        item.images.push(url);
      }
    }
  }
  if (!item.images.length) item.images = [defaultDeviceIcon];
  state.marketplace.unshift(item);
  saveState();
  renderAll();
  showToast(`${item.model} listed at ${formatCurrency(finalPrice)}`);
  document.getElementById("marketUploadForm").reset();
});

document.getElementById("backCoverForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const model = document.getElementById("bcModel").value.trim();
  const design = document.getElementById("bcDesign").value;
  const customer = document.getElementById("bcCustomer").value.trim();
  if (!model || !customer) {
    showToast("Enter device model and customer name");
    return;
  }
  showToast(`Back cover order created for ${customer}: ${model} in ${design}`);
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    marketFilter = button.dataset.grade;
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.toggle("active", item === button));
    renderMarketplace();
  });
});

// Login UI initialization
function initLoginUI() {
  try {
  const loginTabs = document.querySelectorAll(".login-tab");
  if (!loginTabs.length) return;

  function applyTab(tab) {
    if (!tab) return;
    const mode = tab.dataset.tab || "signin";
    const nameField = document.getElementById("nameField");
    const cityField = document.getElementById("cityField");
    const applyLinks = document.getElementById("applyLinks");
    const submitBtn = document.getElementById("unifiedLoginForm")?.querySelector("button");
    const loginHelper = document.getElementById("loginHelper");
    const testingLogin = document.getElementById("testingLogin");
    if (nameField) nameField.style.display = mode === "signup" ? "" : "none";
    if (cityField) cityField.style.display = mode === "signup" ? "" : "none";
    if (applyLinks) applyLinks.style.display = mode === "employee" ? "" : "none";
    if (testingLogin) testingLogin.style.display = "";
    if (submitBtn) submitBtn.textContent = mode === "signup" ? "Create Account" : "Sign In";
    if (loginHelper) {
      if (mode === "signin") loginHelper.textContent = "Sign in to your account";
      else if (mode === "signup") loginHelper.textContent = "Create an account to get started";
      else loginHelper.textContent = "Already have an approved application? Sign in.";
    }
  }

  loginTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      loginTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      applyTab(tab);
    });
  });

  // Initial state — Sign Up tab active
  const activeTab = document.querySelector(".login-tab.active");
  if (activeTab) applyTab(activeTab);
  } catch(e) { console.error('initLoginUI error:', e); }
}

// Testing login — global function called from HTML onclick
window.handleGoogleLogin = async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/' }
  });
  if (error) showToast(error.message);
};

const TEST_CREDS = {
  coordinator:  { email: 'coord@test.repairmaster',  password: 'test123', role: 'coordinator', displayName: 'Testing Coordinator' },
  technician:   { email: 'tech@test.repairmaster',   password: 'test123', role: 'technician',  displayName: 'Testing Technician' },
  repairmaster: { email: 'rm@test.repairmaster',     password: 'test123', role: 'repairmaster', displayName: 'Testing RepairMaster' },
  customer:     { email: 'cust@test.repairmaster',   password: 'test123', role: 'customer',    displayName: 'Testing Customer' },
  admin:        { email: 'admin@test.repairmaster',  password: 'test123', role: 'admin',       displayName: 'Testing Admin' }
};

window.handleTestLogin = function handleTestLogin(roleKey) {
  const c = TEST_CREDS[roleKey];
  if (!c) return;
  state.activeUser = { name: c.displayName, email: c.email, role: c.role };
  state.activePortal = c.role;
  state.activeView = portalLanding[c.role] || 'customer';
  state.activeRequestId = null;
  loginPortal(c.role);
};

// Initialize login UI when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoginUI);
} else {
  initLoginUI();
}
(function initApp() {
  try {
    // Load state synchronously from localStorage (canonical data source)
    Object.assign(state, loadState());
    // Note: we do NOT load from Supabase mock tables here — localStorage is the
    // single source of truth. Supabase write-only sync prevents stale-table re-import loops.

  // Restore saved session from localStorage
  const saved = (() => { try { return JSON.parse(localStorage.getItem('repairmaster_session')); } catch { return null; } })();
  if (saved && saved.activePortal && saved.activeUser) {
    state.activePortal = saved.activePortal;
    state.activeUser = saved.activeUser;
    state.activeRequestId = saved.activeRequestId || state.activeRequestId;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = '';
    handleRoute();
    renderAll();
    showToast(`Restored ${portalNames[state.activePortal] || 'session'}`);
  } else {
    document.getElementById('loginScreen').style.display = '';
    document.getElementById('appShell').style.display = 'none';
    renderHotDeals();
  }
  } catch(e) { console.error('initApp error:', e); }
})();

// Emergency save on tab close
window.addEventListener('beforeunload', () => { try { saveLocalState(state); } catch {} });

// ─── Debug helpers (F12 Console) ───
window.__rm = {
  dump() { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); try { const v = localStorage.getItem(k) || ''; console.log(k, '(' + v.length + ' chars)', v.substring(0, 200)); } catch(e) { console.log(k, '(error reading)'); } } },
  restore() { const v5 = localStorage.getItem('repairingmaster-state-v5'); if (v5) { localStorage.setItem('repairmaster_local_backup', v5); console.log('Restored from v5. Refresh page.'); } else { console.log('No v5 backup found.'); } },
  listRequests() {
    const raw = localStorage.getItem('repairmaster_local_backup') || localStorage.getItem('repairingmaster-state-v5');
    if (!raw) { console.log('No state in localStorage'); return; }
    const s = JSON.parse(raw);
    (s.requests || []).forEach((r, i) => console.log(i, r.id || '(no id)', r.customer || '?', r.model || '?', r.issue || '?', 'si:' + r.statusIndex));
  },
  clean() { ['repairmaster_local_backup','repairingmaster-state-v5','repairmaster_session','_table_repair_requests','_table_notifications','_table_profiles','_table_applications','_table_marketplace_listings','_table_market_orders','_table_job_postings','_local_users'].forEach(k => localStorage.removeItem(k)); console.log('All storage cleared. Refresh page.'); },
  removeSpam() {
    const raw = localStorage.getItem('repairmaster_local_backup') || localStorage.getItem('repairingmaster-state-v5');
    if (!raw) { console.log('No state found'); return; }
    const s = JSON.parse(raw);
    const before = s.requests ? s.requests.length : 0;
    s.requests = (s.requests || []).filter(r => {
      const hasCustomer = r.customer && r.customer.trim().length > 0;
      const hasModel = r.model && r.model.trim().length > 0;
      return hasCustomer && hasModel;
    });
    const after = s.requests.length;
    const removed = before - after;
    localStorage.setItem('repairmaster_local_backup', JSON.stringify(s));
    // Also clear mock tables so Supabase sync won't re-import stale data
    ['_table_repair_requests','_table_notifications','_table_profiles'].forEach(k => localStorage.removeItem(k));
    console.log('Removed ' + removed + ' spam requests. ' + after + ' real requests kept. Mock tables cleared. Refresh page.');
  }
};
