// Full-screen fireworks on a canvas that sits above every other layer
// (including the RSVP pop-up). pointer-events are off so it never blocks clicks.
(function () {
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  const COLORS = ["#ffd166", "#ff7b00", "#ff3d7f", "#f9f871", "#9b5de5", "#00f5d4", "#ffffff", "#ffb703"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let rockets = [];
  let particles = [];
  let launchUntil = 0;
  let nextLaunch = 0;
  let running = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function launch() {
    const x = rand(innerWidth * 0.1, innerWidth * 0.9);
    const targetY = rand(innerHeight * 0.1, innerHeight * 0.45);
    rockets.push({
      x, y: innerHeight,
      vx: rand(-1, 1),
      vy: -Math.sqrt(2 * 0.12 * (innerHeight - targetY)),
      color: pick(COLORS),
    });
  }

  function explode(x, y, color) {
    const count = reduceMotion ? 30 : Math.floor(rand(70, 120));
    const style = Math.random();
    const second = pick(COLORS);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      // "ring" bursts are uniform, others get a random speed for a peony look
      const speed = style < 0.3 ? 4.2 : rand(1, 6);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(55, 90),
        age: 0,
        color: style > 0.7 && i % 2 ? second : color,
        sparkle: Math.random() < 0.3,
      });
    }
  }

  function frame(now) {
    // Fading trail effect
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "lighter";

    if (now < launchUntil && now > nextLaunch) {
      launch();
      if (Math.random() < 0.4) launch();
      nextLaunch = now + rand(180, 450);
    }

    rockets = rockets.filter((r) => {
      r.x += r.vx; r.y += r.vy; r.vy += 0.12;
      ctx.fillStyle = r.color;
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2); ctx.fill();
      if (r.vy >= -0.5) { explode(r.x, r.y, r.color); return false; }
      return true;
    });

    particles = particles.filter((p) => {
      p.age++;
      p.vx *= 0.98; p.vy = p.vy * 0.98 + 0.05;
      p.x += p.vx; p.y += p.vy;
      const alpha = 1 - p.age / p.life;
      if (alpha <= 0) return false;
      if (p.sparkle && Math.random() < 0.5) return true; // twinkle
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

    if (now < launchUntil || rockets.length || particles.length) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  function ensureRunning() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  window.Fireworks = {
    // Launch rockets for `ms` milliseconds
    show(ms = 6000) {
      launchUntil = Math.max(launchUntil, performance.now() + (reduceMotion ? 1500 : ms));
      ensureRunning();
    },
    burst(x, y) {
      explode(x, y, pick(COLORS));
      ensureRunning();
    },
  };
})();
