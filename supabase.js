// Supabase service layer — replaces localStorage with cloud database
const SUPABASE_URL = 'https://tmvjeqpqkozaozqzdqwp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__TNM1ah3ZLIwqyU8Iu3S8A_Lik1M-ql';
var supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
}) : null;

// ─── Auth ───────────────────────────────────────────
async function signUpWithEmail(email, password, profile) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: profile.email || email,
      name: profile.name,
      phone: profile.phone || '',
      role: profile.role || 'customer',
      city: profile.city || ''
    });
  }
  return data;
}

async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOutUser() {
  await supabase.auth.signOut();
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Profiles ───────────────────────────────────────
async function fetchProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

// ─── Repair Requests ────────────────────────────────
async function fetchRepairRequests() {
  const { data } = await supabase.from('repair_requests').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function createRepairRequest(req) {
  const { data, error } = await supabase.from('repair_requests').insert(req).select();
  if (error) throw error;
  return data[0];
}

async function updateRepairRequest(id, updates) {
  const { data, error } = await supabase.from('repair_requests').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function deleteRepairRequest(id) {
  await supabase.from('repair_requests').delete().eq('id', id);
}

// ─── Marketplace Listings ───────────────────────────
async function fetchMarketplaceListings() {
  const { data } = await supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function createMarketplaceListing(listing) {
  const { data, error } = await supabase.from('marketplace_listings').insert(listing).select();
  if (error) throw error;
  return data[0];
}

async function updateMarketplaceListing(id, updates) {
  const { data, error } = await supabase.from('marketplace_listings').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// ─── Applications ───────────────────────────────────
async function fetchApplications() {
  const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function createApplication(app) {
  const { data, error } = await supabase.from('applications').insert(app).select();
  if (error) throw error;
  return data[0];
}

async function updateApplication(id, updates) {
  const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// ─── Market Orders ──────────────────────────────────
async function fetchMarketOrders() {
  const { data } = await supabase.from('market_orders').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function createMarketOrder(order) {
  const { data, error } = await supabase.from('market_orders').insert(order).select();
  if (error) throw error;
  return data[0];
}

async function updateMarketOrder(id, updates) {
  const { data, error } = await supabase.from('market_orders').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

// ─── Quotation Parts ────────────────────────────────
async function fetchQuotationParts() {
  const { data } = await supabase.from('quotation_parts').select('*');
  return data || [];
}

// ─── Service Charge Config ──────────────────────────
async function fetchServiceChargeConfig() {
  const { data } = await supabase.from('service_charge_config').select('*').limit(1).single();
  return data || { percentage: 10 };
}

// ─── Storage (images) ───────────────────────────────
async function uploadImage(file, bucket = 'images') {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Data Reset (admin only) ────────────────────────
async function resetAllData() {
  await supabase.from('repair_requests').delete().neq('id', 0);
  await supabase.from('marketplace_listings').delete().neq('id', 0);
  await supabase.from('applications').delete().neq('id', 0);
  await supabase.from('market_orders').delete().neq('id', 0);
}

// ─── Verify employee access ─────────────────────────
async function checkEmployeeAccess(userId, role) {
  const roleLabel = role === 'repairmaster' ? 'RepairingMaster' : role.charAt(0).toUpperCase() + role.slice(1);
  const { data } = await supabase.from('applications').select('id').eq('user_id', userId).eq('role', roleLabel).eq('status', 'Approved').maybeSingle();
  return !!data;
}

// ─── Notifications ──────────────────────────────────
async function fetchNotifications(userId) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return data || [];
}

async function createNotification(notification) {
  const { error } = await supabase.from('notifications').insert(notification);
  if (error) console.error('Notification insert failed:', error);
}

async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

async function markAllNotificationsRead(userId) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}

async function getUnreadCount(userId) {
  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false);
  return count || 0;
}

// ─── Job Postings ───────────────────────────────────
async function fetchJobPostings() {
  const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
  return data || [];
}

async function createJobPosting(job) {
  const { data, error } = await supabase.from('job_postings').insert(job).select();
  if (error) throw error;
  return data[0];
}

async function updateJobPosting(id, updates) {
  const { data, error } = await supabase.from('job_postings').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
}

async function deleteJobPosting(id) {
  await supabase.from('job_postings').delete().eq('id', id);
}

// ─── Load all data into state ───────────────────────
async function loadAllDataIntoState(targetState) {
  const [requests, marketplace, applications, orders, jobPostings] = await Promise.all([
    fetchRepairRequests(),
    fetchMarketplaceListings(),
    fetchApplications(),
    fetchMarketOrders(),
    fetchJobPostings()
  ]);
  targetState.requests = requests;
  targetState.marketplace = marketplace;
  targetState.applications = applications;
  targetState.marketOrders = orders;
  targetState.jobPostings = jobPostings || [];
}
