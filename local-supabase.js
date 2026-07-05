// Local Supabase mock — uses localStorage when supabase client is unavailable
// Include AFTER supabase.js in index.html: <script src="local-supabase.js"></script>

(function() {
  if (typeof supabase !== "undefined" && supabase) {
    console.log("[local-supabase] Supabase client detected, using cloud mode");
    return;
  }
  console.log("[local-supabase] No Supabase client — using localStorage mock");

  const STORAGE_KEY = "repairmaster_local_backup";

  function getState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
  }
  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  // Override supabase global with localStorage-backed stubs
  window.supabase = {
    auth: {
      signUp: async ({ email, password }) => {
        const users = JSON.parse(localStorage.getItem("_local_users") || "[]");
        if (users.find(u => u.email === email)) {
          return { data: { user: null, session: null }, error: { message: "User already exists" } };
        }
        const user = { id: "local_" + Date.now(), email, created_at: new Date().toISOString() };
        users.push(user);
        localStorage.setItem("_local_users", JSON.stringify(users));
        return { data: { user, session: null }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const users = JSON.parse(localStorage.getItem("_local_users") || "[]");
        const user = users.find(u => u.email === email);
        if (!user) return { data: { user: null, session: null }, error: { message: "Invalid login" } };
        return { data: { user, session: { user } }, error: null };
      },
      signOut: async () => {},
      getSession: async () => {
        const user = JSON.parse(localStorage.getItem("_local_session") || "null");
        return { data: { session: user ? { user } : null } };
      },
      onAuthStateChange: (cb) => {
        cb("INITIAL_SESSION", JSON.parse(localStorage.getItem("_local_session") || "null"));
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table) => ({
      select: (cols) => ({
        eq: (col, val) => ({
          single: async () => {
            const data = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
            return { data: data.find(r => r[col] === val) || null, error: null };
          },
          order: (col, dir) => ({
            limit: (n) => {
              let rows = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
              return { data: rows.slice(0, n), error: null };
            }
          }),
          maybeSingle: async () => {
            const data = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
            return { data: data.find(r => r[col] === val) || null, error: null };
          }
        }),
        order: (col, dir) => {
          let rows = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
          if (dir?.ascending === false) rows = rows.reverse();
          return { data: rows, error: null };
        },
        single: async () => {
          const data = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
          return { data: data[0] || null, error: null };
        },
        limit: (n) => {
          let rows = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
          return { data: rows.slice(0, n), error: null };
        }
      }),
      insert: (item) => ({
        select: async () => {
          const table = JSON.parse(localStorage.getItem("_table_" + arguments.callee.caller?.table || table) || "[]");
          const newItem = { ...item, id: Date.now() };
          table.push(newItem);
          localStorage.setItem("_table_" + table, JSON.stringify(table));
          return { data: [newItem], error: null };
        }
      }),
      update: (updates) => ({
        eq: (col, val) => ({
          select: async () => {
            let table = JSON.parse(localStorage.getItem("_table_" + table) || "[]");
            const idx = table.findIndex(r => r[col] === val);
            if (idx >= 0) { table[idx] = { ...table[idx], ...updates }; }
            localStorage.setItem("_table_" + table, JSON.stringify(table));
            return { data: [table[idx]], error: null };
          }
        }),
        neq: (col, val) => ({
          select: async () => {
            localStorage.setItem("_table_" + table, "[]");
            return { data: [], error: null };
          }
        })
      }),
      delete: () => ({
        eq: (col, val) => ({
          select: async () => {
            localStorage.setItem("_table_" + table, "[]");
            return { data: [], error: null };
          }
        }),
        neq: (col, val) => ({
          select: async () => {
            localStorage.setItem("_table_" + table, "[]");
            return { data: [], error: null };
          }
        })
      }),
      upsert: async (item) => {
        const id = item.id || Date.now();
        const key = "_table_" + table;
        let data = JSON.parse(localStorage.getItem(key) || "[]");
        const idx = data.findIndex(r => r.id === id);
        if (idx >= 0) data[idx] = { ...data[idx], ...item };
        else data.push({ ...item, id });
        localStorage.setItem(key, JSON.stringify(data));
        return { data: [data[idx >= 0 ? idx : data.length - 1]], error: null };
      }
    }),
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => {
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          const imageStore = JSON.parse(localStorage.getItem("_image_store") || "{}");
          imageStore[path] = dataUrl;
          localStorage.setItem("_image_store", JSON.stringify(imageStore));
          return { error: null };
        },
        getPublicUrl: (path) => {
          const imageStore = JSON.parse(localStorage.getItem("_image_store") || "{}");
          return { data: { publicUrl: imageStore[path] || "image/device-repair.png" } };
        }
      })
    }
  };

  // Init local tables from app state if they exist
  const state = getState();
  ["repair_requests", "marketplace_listings", "applications", "market_orders", "notifications", "job_postings", "profiles"].forEach(t => {
    if (!localStorage.getItem("_table_" + t)) {
      localStorage.setItem("_table_" + t, "[]");
    }
  });
})();
