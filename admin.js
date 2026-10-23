(function () {
  const $ = (id) => document.getElementById(id);
  let all = [];

  const show = (id, on) => ($(id).hidden = !on);

  async function init() {
    if (DB.isDemo) {
      show("demo-banner", true);
      showDashboard();
      return;
    }
    const { data } = await DB.client.auth.getSession();
    if (data.session) showDashboard();
    else show("login", true);
  }

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    $("login-error").textContent = "";
    const { error } = await DB.client.auth.signInWithPassword({
      email: f.email.value.trim(),
      password: f.password.value,
    });
    if (error) {
      $("login-error").textContent = error.message;
      return;
    }
    show("login", false);
    showDashboard();
  });

  $("logout").addEventListener("click", async () => {
    await DB.client.auth.signOut();
    location.reload();
  });

  async function showDashboard() {
    show("dashboard", true);
    show("logout", !DB.isDemo);
    await load();
  }

  async function load() {
    try {
      all = await DB.listRsvps();
    } catch (ex) {
      console.error(ex);
      alert("Could not load RSVPs: " + ex.message);
      all = [];
    }
    render();
  }

  function render() {
    const q = $("search").value.trim().toLowerCase();
    const rows = all.filter((r) => !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));

    $("stat-rsvps").textContent = all.length;
    $("stat-guests").textContent = all.reduce((n, r) => n + (r.guests || 1), 0);
    const diet = {};
    all.forEach((r) => (diet[r.diet || "—"] = (diet[r.diet || "—"] || 0) + (r.guests || 1)));
    $("stat-diet").textContent = Object.entries(diet).map(([k, v]) => `${k}: ${v}`).join(" · ") || "–";

    const tbody = $("rows");
    tbody.replaceChildren();
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      const cells = [
        new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
        r.name, r.email, r.guests, r.diet || "", r.message || "",
      ];
      cells.forEach((c) => {
        const td = document.createElement("td");
        td.textContent = c; // textContent keeps guest input from injecting HTML
        tr.appendChild(td);
      });
      const td = document.createElement("td");
      const del = document.createElement("button");
      del.className = "danger";
      del.textContent = "Delete";
      del.addEventListener("click", async () => {
        if (!confirm(`Delete RSVP from ${r.name}?`)) return;
        try {
          await DB.deleteRsvp(r.id);
          await load();
        } catch (ex) {
          alert("Delete failed: " + ex.message);
        }
      });
      td.appendChild(del);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    show("empty", rows.length === 0);
  }

  $("search").addEventListener("input", render);
  $("refresh").addEventListener("click", load);

  $("export").addEventListener("click", () => {
    const head = ["created_at", "name", "email", "guests", "diet", "message"];
    // Quote every field and neutralise leading = + - @ so spreadsheets don't run formulas
    const cell = (v) => {
      let s = v == null ? "" : String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [head.join(","), ...all.map((r) => head.map((h) => cell(r[h])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "diwali-rsvps.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  init();
})();
