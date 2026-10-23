// ============================================================
//  EDIT THIS FILE to personalise the invitation.
//  Everything the guests see (host, date, address) lives here.
// ============================================================

window.INVITE_CONFIG = {
  // --- Event details -----------------------------------------
  hostName: "The Patel Family",
  eventTitle: "Diwali Celebration Lunch",
  // ISO date-time in your local time zone (used for countdown + calendar file)
  eventStart: "2026-11-08T12:30:00",
  eventEnd: "2026-11-08T16:00:00",
  // Placeholder address: change it to your real one
  address: "123 Festival Lane, Your City, ST 00000",
  dressCode: "Festive Indian wear (or whatever makes you sparkle!)",
  note: "Home-cooked feast, sweets, rangoli and lots of laughter. Bring your smile!",

  // --- Database (Supabase) -----------------------------------
  // Paste the values from Supabase > Project Settings > API.
  // While these are placeholders the app runs in "demo mode" and
  // saves RSVPs only in the visitor's own browser.
  supabaseUrl: "https://YOUR-PROJECT-ID.supabase.co",
  supabaseAnonKey: "YOUR-SUPABASE-ANON-KEY",
};
