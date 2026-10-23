// Tiny data layer shared by the invitation page and the admin page.
// Uses Supabase when config.js has real keys, otherwise falls back to
// "demo mode" (localStorage in the current browser only).
(function () {
  const cfg = window.INVITE_CONFIG || {};
  const configured =
    cfg.supabaseUrl && !cfg.supabaseUrl.includes("YOUR-PROJECT-ID") &&
    cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes("YOUR-SUPABASE");

  const client = configured && window.supabase
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    : null;

  const DEMO_KEY = "diwali-demo-rsvps";
  const readDemo = () => {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || []; } catch { return []; }
  };
  const writeDemo = (rows) => {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(rows)); } catch { /* ignore */ }
  };

  window.DB = {
    isDemo: !client,
    client,

    async addRsvp(rsvp) {
      if (!client) {
        const rows = readDemo();
        rows.unshift({ id: Date.now(), created_at: new Date().toISOString(), ...rsvp });
        writeDemo(rows);
        return;
      }
      const { error } = await client.from("rsvps").insert(rsvp);
      if (error) throw error;
    },

    async listRsvps() {
      if (!client) return readDemo();
      const { data, error } = await client
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },

    async deleteRsvp(id) {
      if (!client) {
        writeDemo(readDemo().filter((r) => r.id !== id));
        return;
      }
      const { error } = await client.from("rsvps").delete().eq("id", id);
      if (error) throw error;
    },
  };
})();
