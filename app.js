(function () {
  const cfg = window.INVITE_CONFIG;
  const $ = (id) => document.getElementById(id);

  // ---------- Fill in event details from config.js ----------
  const start = new Date(cfg.eventStart);
  const end = new Date(cfg.eventEnd);
  $("event-title").textContent = cfg.eventTitle;
  $("host-name").textContent = cfg.hostName;
  $("event-date").textContent = start.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeFmt = { hour: "numeric", minute: "2-digit" };
  $("event-time").textContent =
    `${start.toLocaleTimeString(undefined, timeFmt)} – ${end.toLocaleTimeString(undefined, timeFmt)}`;
  $("event-address").textContent = cfg.address;
  $("event-address").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.address);
  $("dress-code").textContent = cfg.dressCode;
  $("event-note").textContent = cfg.note;
  document.title = `${cfg.eventTitle} 🪔`;

  // ---------- Countdown ----------
  const units = {};
  document.querySelectorAll("#countdown [data-unit]").forEach((el) => (units[el.dataset.unit] = el));
  function tick() {
    let diff = Math.max(0, start - Date.now());
    if (diff === 0) {
      $("countdown").innerHTML = "<p class='live'>🎉 The celebration is happening now! 🎉</p>";
      return;
    }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    units.days.textContent = d;
    units.hours.textContent = String(h).padStart(2, "0");
    units.minutes.textContent = String(m).padStart(2, "0");
    units.seconds.textContent = String(s).padStart(2, "0");
    setTimeout(tick, 1000);
  }
  tick();

  // ---------- Festive sounds (synthesised, no audio files) ----------
  let audio = null;
  let soundOn = false;
  $("sound-toggle").addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn && !audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    $("sound-toggle").textContent = soundOn ? "🔊" : "🔇";
    $("sound-toggle").setAttribute("aria-pressed", soundOn);
    if (soundOn) chime();
  });

  function chime() {
    if (!soundOn || !audio) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "sine"; o.frequency.value = f;
      const t = audio.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.connect(g).connect(audio.destination);
      o.start(t); o.stop(t + 0.85);
    });
  }

  function boom(delay = 0) {
    if (!soundOn || !audio) return;
    const len = audio.sampleRate * 0.8;
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const g = audio.createGain();
    filter.type = "lowpass"; filter.frequency.value = 900 + Math.random() * 800;
    g.gain.value = 0.35;
    src.buffer = buf;
    src.connect(filter).connect(g).connect(audio.destination);
    src.start(audio.currentTime + delay);
  }

  function celebrate(ms = 7000) {
    Fireworks.show(ms);
    for (let i = 0; i < 8; i++) boom(0.4 + i * 0.6 + Math.random() * 0.3);
  }

  // ---------- The runaway "No" button ----------
  const noBtn = $("no-btn");
  const yesBtn = $("yes-btn");
  const hint = $("hint");
  const NO_MESSAGES = [
    "Nope", "Catch me!", "Almost there", "Too slow!", "Nice try 😜",
    "Think again", "Are you sure? 🥺", "The ladoos will miss you",
    "Gulab jamun is waiting…", "Diwali without you? Never!",
    "Our diyas won't shine as bright", "Rangoli's ready for you",
    "Error 404: No not found", "You can't escape the festivities",
    "Mom already cooked for you", "Just press Yes 🙏", "Still no? Try harder!",
    "The sweets say hi 🍬", "Lights, food, friends… and you?",
  ];
  const HINTS = [
    "Psst… the golden button works much better ✨",
    "The No button seems shy today 🙈",
    "Lakshmi ji is watching… 👀",
    "Every dodge adds one more ladoo to your plate 🍡",
  ];
  let dodges = 0;

  let lastDodge = -Infinity;

  function dodge(e) {
    if (e) e.preventDefault();
    // One tap fires several events (pointerdown, click); count it once
    if (performance.now() - lastDodge < 200) return;
    lastDodge = performance.now();
    dodges++;

    noBtn.textContent = NO_MESSAGES[(dodges - 1) % NO_MESSAGES.length];
    if (dodges % 3 === 0) hint.textContent = HINTS[(dodges / 3 - 1) % HINTS.length];

    // Yes grows a little each time (up to a limit), No shrinks a bit
    const yesScale = Math.min(1 + dodges * 0.04, 1.5);
    yesBtn.style.transform = `scale(${yesScale})`;
    noBtn.style.fontSize = Math.max(0.75, 1 - dodges * 0.015) + "rem";

    // First escape: leave an empty spacer behind so the Yes button doesn't slide
    // under the guest's finger, and move to <body> so "fixed" means the viewport
    // (the card's backdrop-filter would otherwise trap it inside the card).
    if (!noBtn.classList.contains("runaway")) {
      const r = noBtn.getBoundingClientRect();
      const spacer = document.createElement("span");
      spacer.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px`;
      noBtn.replaceWith(spacer);
      setTimeout(() => spacer.remove(), 800); // then let Yes settle in the centre
      document.body.appendChild(noBtn);
      noBtn.style.left = r.left + "px";
      noBtn.style.top = r.top + "px";
      noBtn.classList.add("runaway");
    }

    // Move to a random spot in the viewport, away from the pointer and the Yes button
    const pad = 12;
    const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
    const yes = yesBtn.getBoundingClientRect();
    const px = e && e.clientX ? e.clientX : -999;
    const py = e && e.clientY ? e.clientY : -999;
    let x, y, tries = 0;
    do {
      x = pad + Math.random() * (innerWidth - w - pad * 2);
      y = pad + Math.random() * (innerHeight - h - pad * 2);
      tries++;
    } while (
      tries < 50 &&
      (Math.hypot(x + w / 2 - px, y + h / 2 - py) < 160 ||
        (x < yes.right + 10 && x + w > yes.left - 10 && y < yes.bottom + 10 && y + h > yes.top - 10))
    );
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";

    // A tiny sparkle where it escaped from
    if (px > 0) Fireworks.burst(px, py);
  }

  // Mouse: flee on hover. Touch/pen: flee the moment a finger lands on it.
  noBtn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(e); });
  noBtn.addEventListener("pointerdown", dodge);
  // Keyboard Enter/Space (or any click that slips through) never counts as a No
  noBtn.addEventListener("click", dodge);

  // ---------- Yes → fireworks + RSVP pop-up ----------
  const modal = $("rsvp-modal");
  const form = $("rsvp-form");
  const thanks = $("thanks");

  yesBtn.addEventListener("click", () => {
    celebrate(8000);
    chime();
    form.hidden = false;
    thanks.hidden = true;
    modal.hidden = false;
    noBtn.classList.add("gone");
    setTimeout(() => form.elements.name.focus(), 300);
  });

  $("close-modal").addEventListener("click", () => (modal.hidden = true));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
  addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });

  const BLESSINGS = [
    "May the light of the diyas fill your life with happiness and prosperity.",
    "May this Diwali bring you joy as bright as fireworks and as sweet as mithai.",
    "Wishing you a year of good health, great friends and endless laughter.",
    "May Lakshmi ji bless your home with abundance and peace.",
    "May every new beginning this year shine like a thousand diyas.",
  ];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("form-error");
    err.textContent = "";
    const f = form.elements;
    const rsvp = {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      guests: parseInt(f.guests.value, 10) || 1,
      diet: f.diet.value,
      message: f.message.value.trim() || null,
    };
    if (!rsvp.name) return (err.textContent = "Please tell us your name 🙂");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rsvp.email)) return (err.textContent = "That email doesn't look quite right.");
    if (rsvp.guests < 1 || rsvp.guests > 20) return (err.textContent = "Guests should be between 1 and 20.");

    const btn = $("submit-btn");
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      await DB.addRsvp(rsvp);
      $("thanks-name").textContent = rsvp.name.split(" ")[0];
      $("blessing").textContent = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
      form.hidden = true;
      thanks.hidden = false;
      celebrate(9000);
      chime();
    } catch (ex) {
      console.error(ex);
      err.textContent = "Oops, something went wrong saving your RSVP. Please try again.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Send my RSVP ✨";
    }
  });

  $("more-fireworks").addEventListener("click", () => celebrate(6000));

  // Click anywhere on the night sky for a firework
  document.addEventListener("click", (e) => {
    if (e.target.closest(".card, .modal, button")) return;
    Fireworks.burst(e.clientX, e.clientY);
    boom();
  });

  // ---------- Add to calendar (.ics) ----------
  $("calendar-btn").addEventListener("click", () => {
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Diwali Invite//EN",
      "BEGIN:VEVENT",
      `UID:${fmt(start)}-diwali@invite`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(cfg.eventTitle)}`,
      `LOCATION:${esc(cfg.address)}`,
      `DESCRIPTION:${esc(cfg.note)}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "diwali-lunch.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ---------- Share ----------
  $("share-btn").addEventListener("click", async () => {
    const data = { title: cfg.eventTitle, text: `You're invited to our ${cfg.eventTitle}! 🪔`, url: location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(location.href);
        $("share-btn").textContent = "✅ Link copied!";
        setTimeout(() => ($("share-btn").textContent = "💌 Share invite"), 2000);
      } catch {
        prompt("Copy this link:", location.href);
      }
    }
  });

  // ---------- Falling marigold petals ----------
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const petals = $("petals");
  const PETALS = ["🌼", "🏵️", "✨", "🌸"];
  for (let i = 0; i < (reduceMotion ? 0 : 18); i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = PETALS[i % PETALS.length];
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 8 + Math.random() * 10 + "s";
    p.style.animationDelay = -Math.random() * 15 + "s";
    p.style.fontSize = 0.8 + Math.random() * 1 + "rem";
    petals.appendChild(p);
  }

  // ---------- Golden sparkle cursor trail ----------
  const trail = $("sparkle-trail");
  const tctx = trail.getContext("2d");
  let sparks = [];
  const sizeTrail = () => { trail.width = innerWidth; trail.height = innerHeight; };
  addEventListener("resize", sizeTrail);
  sizeTrail();
  if (!reduceMotion) {
    addEventListener("pointermove", (e) => {
      for (let i = 0; i < 2; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 1.5, life: 30 });
      }
    });
    (function drawTrail() {
      tctx.clearRect(0, 0, trail.width, trail.height);
      sparks = sparks.filter((s) => {
        s.x += s.vx; s.y += s.vy; s.life--;
        tctx.globalAlpha = s.life / 30;
        tctx.fillStyle = s.life % 6 < 3 ? "#ffd166" : "#ff9f1c";
        tctx.beginPath(); tctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2); tctx.fill();
        return s.life > 0;
      });
      tctx.globalAlpha = 1;
      requestAnimationFrame(drawTrail);
    })();
  }

  if (DB.isDemo) console.info("Demo mode: RSVPs are saved in this browser only. Add Supabase keys in config.js.");
})();
