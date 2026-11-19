(() => {
  const root = document.documentElement;
  const body = document.body;

  // Theme Toggle (Day: Lively light natural air sky / Night: Starry midnight setting)
  const themeBtn = document.getElementById("theme-toggle");
  const themeText = document.getElementById("theme-toggle-text");

  function setTheme(mode) {
    root.setAttribute("data-theme", mode);
    localStorage.setItem("wasif_theme", mode);
    if (themeText) {
      themeText.textContent = mode === "night" ? "day" : "night";
    }
  }

  const savedTheme = localStorage.getItem("wasif_theme") || "day";
  setTheme(savedTheme);

  themeBtn?.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme");
    setTheme(cur === "night" ? "day" : "night");
  });

  // Expandable "Findings & limitations +" panels inside Research
  document.querySelectorAll(".expand-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      const isHidden = panel.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(!isHidden));
      const icon = btn.querySelector(".plus-icon");
      if (icon) icon.textContent = isHidden ? "+" : "−";
    });
  });

  // ==================== VIEW SWITCHING (TOWN <-> NAVY BLUE SECTIONS) ====================
  const townView = document.getElementById("town-view");
  const sectionView = document.getElementById("section-view");
  const backToTownBtn = document.getElementById("back-to-town");
  const homeBrand = document.getElementById("home-brand");
  const navLinks = document.querySelectorAll(".site-nav a[data-section]");
  const editorialPages = document.querySelectorAll(".editorial-page[data-page]");
  const pinLabels = document.querySelectorAll(".pin-label[data-target]");

  let activeSection = null;

  function openSectionPage(sectionId, pushHash = true) {
    const targetPage = document.querySelector(`.editorial-page[data-page="${sectionId}"]`);
    if (!targetPage) return;

    activeSection = sectionId;
    body.classList.add("section-active");
    townView?.classList.add("hidden");
    sectionView?.classList.remove("hidden");

    editorialPages.forEach((p) => {
      p.classList.toggle("hidden", p.getAttribute("data-page") !== sectionId);
    });

    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("data-section") === sectionId);
    });

    if (pushHash) {
      history.pushState(null, "", `#${sectionId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnToTown(pushHash = true) {
    activeSection = null;
    body.classList.remove("section-active");
    sectionView?.classList.add("hidden");
    townView?.classList.remove("hidden");

    navLinks.forEach((a) => a.classList.remove("active"));
    if (pushHash) {
      history.pushState(null, "", "#town");
    }
    resizeTownCanvas();
  }

  backToTownBtn?.addEventListener("click", () => returnToTown(true));
  homeBrand?.addEventListener("click", (e) => {
    e.preventDefault();
    returnToTown(true);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sec = link.getAttribute("data-section");
      if (sec) openSectionPage(sec, true);
    });
  });

  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && hash !== "town" && document.querySelector(`.editorial-page[data-page="${hash}"]`)) {
      openSectionPage(hash, false);
    } else {
      returnToTown(false);
    }
  });

  // ==================== SKY & ATMOSPHERE CANVAS (MANY CLOUDS, BIRDS, BREEZE) ====================
  const skyCanvas = document.getElementById("sky-canvas");
  const skyCtx = skyCanvas ? skyCanvas.getContext("2d") : null;
  let skyW = window.innerWidth;
  let skyH = window.innerHeight;

  function resizeSky() {
    if (!skyCanvas || !skyCtx) return;
    const dpr = window.devicePixelRatio || 1;
    skyW = window.innerWidth;
    skyH = window.innerHeight;
    skyCanvas.width = skyW * dpr;
    skyCanvas.height = skyH * dpr;
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeSky);
  resizeSky();

  // 14 Layered Crossy-Road Isometric Blocky Clouds
  const skyClouds = Array.from({ length: 14 }, (_, i) => ({
    x: (i / 14) * 1.25 - 0.1,
    y: 0.05 + ((i * 0.17) % 0.85),
    scale: 0.55 + (i % 4) * 0.24,
    speed: 0.00012 + (i % 5) * 0.000045,
    layer: i % 3,
  }));

  // Voxel Bird Flocks flying across the sky
  const birdFlocks = [
    { x: 0.15, y: 0.18, speed: 0.00038, count: 3, phase: 0 },
    { x: 0.68, y: 0.32, speed: 0.00031, count: 4, phase: 2.1 },
    { x: 0.42, y: 0.76, speed: 0.00035, count: 2, phase: 4.0 },
  ];

  // Crossy-Road Wind Breeze Streaks & Stars/Fireflies
  const windStreaks = Array.from({ length: 10 }, (_, i) => ({
    x: Math.random(),
    y: 0.1 + Math.random() * 0.8,
    len: 45 + Math.random() * 65,
    speed: 0.0009 + Math.random() * 0.0007,
  }));

  const stars = Array.from({ length: 55 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.85,
    r: 0.8 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));

  function drawVoxelCloud(ctx, cx, cy, scale, isNight, inSection) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const topCol = isNight || inSection
      ? "rgba(32, 58, 92, 0.34)"
      : "rgba(255, 255, 255, 0.92)";
    const bottomCol = isNight || inSection
      ? "rgba(18, 36, 62, 0.38)"
      : "rgba(188, 222, 252, 0.85)";

    // Crossy-Road geometric stepped cloud silhouette
    ctx.fillStyle = bottomCol;
    ctx.beginPath();
    ctx.moveTo(-58, 8);
    ctx.lineTo(-20, -12);
    ctx.lineTo(18, -12);
    ctx.lineTo(62, 8);
    ctx.lineTo(28, 22);
    ctx.lineTo(-32, 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.moveTo(-54, 4);
    ctx.lineTo(-32, -12);
    ctx.lineTo(-10, -24);
    ctx.lineTo(16, -22);
    ctx.lineTo(38, -8);
    ctx.lineTo(58, 4);
    ctx.lineTo(24, 15);
    ctx.lineTo(-28, 15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function renderSky(now) {
    if (!skyCtx) return;
    skyCtx.clearRect(0, 0, skyW, skyH);

    const isNight = root.getAttribute("data-theme") === "night";
    const inSection = body.classList.contains("section-active");

    // Twinkling stars in Night Mode
    if (isNight || inSection) {
      stars.forEach((st) => {
        const alpha = 0.25 + 0.55 * Math.abs(Math.sin(now * 0.0015 + st.phase));
        skyCtx.fillStyle = `rgba(215, 234, 255, ${inSection ? alpha * 0.45 : alpha})`;
        skyCtx.fillRect(st.x * skyW, st.y * skyH, st.r * 1.4, st.r * 1.4);
      });
    }

    // Wind breeze lines (lively Crossy-Road entry atmosphere)
    if (!inSection) {
      windStreaks.forEach((w) => {
        w.x = (w.x + w.speed) % 1.2;
        const sx = (w.x - 0.1) * skyW;
        const sy = w.y * skyH;
        skyCtx.strokeStyle = isNight
          ? "rgba(148, 195, 246, 0.08)"
          : "rgba(255, 255, 255, 0.55)";
        skyCtx.lineWidth = 1.5;
        skyCtx.beginPath();
        skyCtx.moveTo(sx, sy);
        skyCtx.lineTo(sx + w.len, sy - w.len * 0.18);
        skyCtx.stroke();
      });
    }

    // Drifting Isometric Clouds
    skyClouds.forEach((c) => {
      c.x = (c.x + c.speed) % 1.3;
      const cx = (c.x - 0.15) * skyW;
      const cy = c.y * skyH;
      drawVoxelCloud(skyCtx, cx, cy, c.scale, isNight, inSection);
    });

    // Flying Voxel Birds in V-Formation
    if (!inSection) {
      birdFlocks.forEach((flock) => {
        flock.x = (flock.x + flock.speed) % 1.25;
        const bx = (flock.x - 0.12) * skyW;
        const by = flock.y * skyH + Math.sin(now * 0.002 + flock.phase) * 8;

        for (let i = 0; i < flock.count; i++) {
          const ox = bx - i * 14;
          const oy = by + (i % 2 === 0 ? 1 : -1) * i * 7;
          const flap = Math.sin(now * 0.014 + i * 0.8 + flock.phase) * 4.5;

          skyCtx.strokeStyle = isNight ? "rgba(214, 232, 255, 0.65)" : "rgba(38, 78, 126, 0.55)";
          skyCtx.lineWidth = 1.8;
          skyCtx.beginPath();
          skyCtx.moveTo(ox - 5, oy - flap);
          skyCtx.lineTo(ox, oy);
          skyCtx.lineTo(ox + 5, oy - flap);
          skyCtx.stroke();
        }
      });
    }
  }

  // ==================== ISOMETRIC CROSSY-ROAD TOWN GAME ====================
  const townCanvas = document.getElementById("town-canvas");
  const ctx = townCanvas ? townCanvas.getContext("2d") : null;
  const worldStage = document.getElementById("world-stage");
  const nearHintEl = document.getElementById("near-building-hint");
  const enterVisitBtn = document.getElementById("enter-visit-btn");

  let W = 900;
  let H = 520;
  let originX = W / 2;
  let originY = H / 2 + 12;
  let tileW = 34;
  let tileH = 17.5;

  function resizeTownCanvas() {
    if (!townCanvas || !ctx || !worldStage) return;
    const rect = worldStage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    W = rect.width;
    H = rect.height;
    townCanvas.width = W * dpr;
    townCanvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scale = Math.min(W / 920, H / 510);
    tileW = Math.max(22, Math.min(39, 34 * scale));
    tileH = tileW * 0.515;
    originX = W / 2;
    originY = H * 0.49;
  }
  window.addEventListener("resize", resizeTownCanvas);
  resizeTownCanvas();

  function iso(gx, gy, z = 0) {
    return {
      x: originX + (gx - gy) * tileW,
      y: originY + (gx + gy) * tileH - z,
    };
  }

  function screenToIso(sx, sy) {
    const dx = (sx - originX) / tileW;
    const dy = (sy - originY) / tileH;
    return {
      gx: (dx + dy) / 2,
      gy: (dy - dx) / 2,
    };
  }

  // 7 Buildings on the 13x13 Isometric Board
  const BUILDINGS = {
    about: {
      id: "about",
      label: "01 about",
      gx: -3.1,
      gy: -3.5,
      wx: 2.5,
      wy: 2.3,
      h: 40,
      doorGx: -2,
      doorGy: -2,
    },
    blog: {
      id: "blog",
      label: "07 blog",
      gx: 0.8,
      gy: -4.2,
      wx: 2.0,
      wy: 1.9,
      h: 34,
      doorGx: 1,
      doorGy: -2,
    },
    research: {
      id: "research",
      label: "02 research",
      gx: 3.4,
      gy: -2.4,
      wx: 2.7,
      wy: 2.5,
      h: 42,
      doorGx: 2,
      doorGy: -2,
    },
    experience: {
      id: "experience",
      label: "03 experience",
      gx: 2.1,
      gy: 1.4,
      wx: 2.2,
      wy: 2.2,
      h: 64,
      doorGx: 1,
      doorGy: 1,
    },
    cv: {
      id: "cv",
      label: "04 cv",
      gx: -0.2,
      gy: 4.1,
      wx: 2.4,
      wy: 2.1,
      h: 34,
      doorGx: -1,
      doorGy: 3,
    },
    life: {
      id: "life",
      label: "05 life",
      gx: -4.1,
      gy: 0.1,
      wx: 2.3,
      wy: 2.1,
      h: 36,
      doorGx: -2,
      doorGy: 0,
    },
    awards: {
      id: "awards",
      label: "06 awards",
      gx: -3.6,
      gy: 3.5,
      wx: 2.4,
      wy: 2.1,
      h: 38,
      doorGx: -2,
      doorGy: 3,
    },
  };

  // Player state with squash-and-stretch physics & dust particles
  const player = {
    gx: -1,
    gy: 3,
    visGx: -1,
    visGy: 3,
    hopZ: 0,
    scaleX: 1,
    scaleZ: 1,
    hopping: false,
    hopStart: 0,
    fromGx: -1,
    fromGy: 3,
    toGx: -1,
    toGy: 3,
    pathQueue: [],
    pendingSection: null,
  };

  const particles = [];

  function spawnDust(gx, gy, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      particles.push({
        gx,
        gy,
        z: 1,
        vx: Math.cos(angle) * 0.035,
        vy: Math.sin(angle) * 0.035,
        vz: 0.35 + Math.random() * 0.3,
        size: 2.5 + Math.random() * 2,
        alpha: 0.9,
        color: "#ffffff",
      });
    }
  }

  function isBlocked(gx, gy) {
    if (gx < -6 || gx > 6 || gy < -6 || gy > 6) return true;
    for (const b of Object.values(BUILDINGS)) {
      const hx = b.wx / 2 - 0.1;
      const hy = b.wy / 2 - 0.1;
      if (gx >= b.gx - hx && gx <= b.gx + hx && gy >= b.gy - hy && gy <= b.gy + hy) {
        return true;
      }
    }
    return false;
  }

  function findNearbyBuilding(gx, gy) {
    let best = null;
    let bestDist = 2.2;
    for (const b of Object.values(BUILDINGS)) {
      const d = Math.hypot(gx - b.doorGx, gy - b.doorGy);
      if (d < bestDist) {
        bestDist = d;
        best = b;
      }
    }
    return best;
  }

  function updateNearHint() {
    const near = findNearbyBuilding(player.gx, player.gy);
    pinLabels.forEach((p) => {
      p.classList.toggle("pin-active", Boolean(near && p.getAttribute("data-target") === near.id));
    });
    if (nearHintEl) {
      nearHintEl.textContent = near ? `· near ${near.label}` : "";
    }
  }

  function stepToward(nextGx, nextGy) {
    if (isBlocked(nextGx, nextGy)) return false;
    spawnDust(player.visGx, player.visGy, 4);
    player.fromGx = player.visGx;
    player.fromGy = player.visGy;
    player.toGx = nextGx;
    player.toGy = nextGy;
    player.gx = nextGx;
    player.gy = nextGy;
    player.hopping = true;
    player.hopStart = performance.now();
    updateNearHint();
    return true;
  }

  function queueWalkTo(targetGx, targetGy, sectionAfter = null) {
    const tx = Math.max(-5, Math.min(5, Math.round(targetGx)));
    const ty = Math.max(-5, Math.min(5, Math.round(targetGy)));
    const queue = [];
    let cx = player.gx;
    let cy = player.gy;
    let guard = 0;

    while ((cx !== tx || cy !== ty) && guard < 24) {
      guard++;
      const dx = Math.sign(tx - cx);
      const dy = Math.sign(ty - cy);
      if (dx !== 0 && !isBlocked(cx + dx, cy)) {
        cx += dx;
      } else if (dy !== 0 && !isBlocked(cx, cy + dy)) {
        cy += dy;
      } else if (dx !== 0) {
        cx += dx;
      } else if (dy !== 0) {
        cy += dy;
      }
      queue.push({ gx: cx, gy: cy });
    }

    player.pathQueue = queue;
    player.pendingSection = sectionAfter;

    if (queue.length === 0 && sectionAfter) {
      openSectionPage(sectionAfter, true);
      player.pendingSection = null;
    }
  }

  // Pin label clicks: walk character to that building's door, then enter section!
  pinLabels.forEach((pin) => {
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = pin.getAttribute("data-target");
      const b = target ? BUILDINGS[target] : null;
      if (!b) return;
      queueWalkTo(b.doorGx, b.doorGy, b.id);
    });
  });

  // Canvas click: hit-test building or walk to ground tile
  townCanvas?.addEventListener("click", (e) => {
    const rect = townCanvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    for (const b of Object.values(BUILDINGS)) {
      const center = iso(b.gx, b.gy, b.h * 0.5);
      if (Math.hypot(sx - center.x, sy - center.y) < tileW * 1.45) {
        queueWalkTo(b.doorGx, b.doorGy, b.id);
        return;
      }
    }

    const { gx, gy } = screenToIso(sx, sy);
    if (gx >= -6 && gx <= 6 && gy >= -6 && gy <= 6) {
      queueWalkTo(Math.round(gx), Math.round(gy), null);
    }
  });

  // Keyboard & "enter visit" controls
  function manualMove(dir) {
    player.pathQueue = [];
    player.pendingSection = null;
    if (player.hopping) return;
    if (dir === "up") stepToward(player.gx, player.gy - 1);
    if (dir === "down") stepToward(player.gx, player.gy + 1);
    if (dir === "left") stepToward(player.gx - 1, player.gy);
    if (dir === "right") stepToward(player.gx + 1, player.gy);
  }

  enterVisitBtn?.addEventListener("click", () => {
    const near = findNearbyBuilding(player.gx, player.gy);
    openSectionPage(near ? near.id : "about", true);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeSection) {
      returnToTown(true);
      return;
    }
    if (activeSection) return;

    const k = e.key.toLowerCase();
    if (k === "w" || k === "arrowup") {
      e.preventDefault();
      manualMove("up");
    } else if (k === "s" || k === "arrowdown") {
      e.preventDefault();
      manualMove("down");
    } else if (k === "a" || k === "arrowleft") {
      e.preventDefault();
      manualMove("left");
    } else if (k === "d" || k === "arrowright") {
      e.preventDefault();
      manualMove("right");
    } else if (k === "enter" || k === " ") {
      e.preventDefault();
      const near = findNearbyBuilding(player.gx, player.gy);
      if (near) openSectionPage(near.id, true);
    }
  });

  // ==================== ISOMETRIC DRAWING PRIMITIVES ====================
  function drawPoly(pts, fill, stroke = null, lw = 1) {
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  }

  function drawPrism(gx, gy, wx, wy, z0, z1, topCol, leftCol, rightCol, strokeCol = null) {
    const x0 = gx - wx / 2;
    const x1 = gx + wx / 2;
    const y0 = gy - wy / 2;
    const y1 = gy + wy / 2;

    const t00 = iso(x0, y0, z1);
    const t10 = iso(x1, y0, z1);
    const t11 = iso(x1, y1, z1);
    const t01 = iso(x0, y1, z1);

    const b10 = iso(x1, y0, z0);
    const b11 = iso(x1, y1, z0);
    const b01 = iso(x0, y1, z0);

    drawPoly([t01, t11, b11, b01], leftCol, strokeCol);
    drawPoly([t10, t11, b11, b10], rightCol, strokeCol);
    drawPoly([t00, t10, t11, t01], topCol, strokeCol);
  }

  function drawTile(gx, gy, wx, wy, z, fill, stroke = null) {
    const x0 = gx - wx / 2;
    const x1 = gx + wx / 2;
    const y0 = gy - wy / 2;
    const y1 = gy + wy / 2;
    drawPoly([iso(x0, y0, z), iso(x1, y0, z), iso(x1, y1, z), iso(x0, y1, z)], fill, stroke);
  }

  function drawWallWindowLeft(xCenter, yFixed, w, zBottom, zTop, color) {
    drawPoly(
      [
        iso(xCenter - w / 2, yFixed, zTop),
        iso(xCenter + w / 2, yFixed, zTop),
        iso(xCenter + w / 2, yFixed, zBottom),
        iso(xCenter - w / 2, yFixed, zBottom),
      ],
      color
    );
  }

  function drawWallWindowRight(xFixed, yCenter, w, zBottom, zTop, color) {
    drawPoly(
      [
        iso(xFixed, yCenter - w / 2, zTop),
        iso(xFixed, yCenter + w / 2, zTop),
        iso(xFixed, yCenter + w / 2, zBottom),
        iso(xFixed, yCenter - w / 2, zBottom),
      ],
      color
    );
  }

  // Lively Crossy-Road Props: Trees, Streetlamps, River Logs, Lily Pads, Little Birds, Cars
  const TREES = [
    { gx: -5.1, gy: -4.2, s: 1.0, phase: 0.2 },
    { gx: -4.6, gy: -2.9, s: 0.85, phase: 1.1 },
    { gx: -0.9, gy: -4.8, s: 0.95, phase: 2.0 },
    { gx: 2.5, gy: -4.5, s: 1.05, phase: 3.1 },
    { gx: 5.1, gy: -0.6, s: 0.95, phase: 0.7 },
    { gx: 4.5, gy: 0.6, s: 0.82, phase: 1.9 },
    { gx: -5.2, gy: 1.6, s: 1.0, phase: 2.5 },
    { gx: -4.8, gy: 2.6, s: 0.82, phase: 3.8 },
    { gx: -2.2, gy: 4.9, s: 0.9, phase: 1.4 },
    { gx: 2.1, gy: 4.8, s: 0.95, phase: 2.9 },
    { gx: 1.2, gy: 5.2, s: 0.8, phase: 0.5 },
  ];

  const LAMPS = [
    { gx: -1.3, gy: -1.2 },
    { gx: -1.3, gy: 1.5 },
    { gx: 1.2, gy: -1.2 },
  ];

  // Crossy-Road Floating Wooden Logs & Lily Pads in the Canal River (gy = 0.1)
  const riverLogs = [
    { gx: -4.2, gy: 0.1, len: 1.5, speed: 0.011 },
    { gx: 2.0, gy: 0.1, len: 1.7, speed: 0.011 },
  ];

  const lilyPads = [
    { gx: -2.3, gy: 0.15 },
    { gx: 4.3, gy: 0.05 },
  ];

  // Little Hopping Crossy-Road White Birds on the Grass Pads
  const groundBirds = [
    { gx: -4.9, gy: -1.6, phase: 0 },
    { gx: 3.8, gy: 3.8, phase: 1.8 },
    { gx: 4.6, gy: -3.9, phase: 3.4 },
  ];

  // Blocky Voxel Cars with Exhaust Particles
  const cars = [
    { axis: "x", gx: -4.5, gy: -1.65, speed: 0.024, color: "#eab64d", roof: "#fef3c7" },
    { axis: "x", gx: 1.4, gy: -1.65, speed: 0.024, color: "#34598a", roof: "#93c5fd" },
    { axis: "y", gx: -0.55, gy: 4.5, speed: -0.021, color: "#3f6ca6", roof: "#bfdbfe" },
  ];

  // Rising Coffee Steam Particles from 05 Life Café
  const steamWisps = [
    { z: 0, offset: 0 },
    { z: 8, offset: 2.1 },
    { z: 16, offset: 4.2 },
  ];

  function drawBuilding(b, isNight, now) {
    const wallLeft = isNight ? "#335482" : "#c7daee";
    const wallRight = isNight ? "#223b5e" : "#95b3d5";
    const roofTop = isNight ? "#2d5589" : "#4975ad";
    const roofLeft = isNight ? "#1e3c66" : "#345c8f";
    const roofRight = isNight ? "#152b4a" : "#24436c";
    const winCol = isNight ? "#ffd166" : "#eef6ff";

    if (b.id === "about") {
      // 01 about: Residence with tiered roof & warm golden door
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, roofTop, wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx + 0.34, b.wy + 0.34, b.h, b.h + 7, roofTop, roofLeft, roofRight);
      drawPrism(b.gx, b.gy, b.wx * 0.65, b.wy * 0.65, b.h + 7, b.h + 13, "#5884bc", roofTop, roofLeft);
      drawWallWindowLeft(b.gx - 0.3, b.gy + b.wy / 2 + 0.01, 0.55, 0, 21, "#eab64d");
      drawWallWindowLeft(b.gx + 0.55, b.gy + b.wy / 2 + 0.01, 0.52, 10, 23, winCol);
      drawWallWindowRight(b.gx + b.wx / 2 + 0.01, b.gy, 0.68, 10, 23, winCol);
    } else if (b.id === "blog") {
      // 07 blog: Cozy studio near top-right with notebook sheet on roof
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, roofTop, wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx + 0.24, b.wy + 0.24, b.h, b.h + 5, roofTop, roofLeft, roofRight);
      drawPrism(b.gx, b.gy, 0.95, 0.8, b.h + 5, b.h + 8, "#fef3c7", "#fde68a", "#eab64d");
      drawWallWindowLeft(b.gx, b.gy + b.wy / 2 + 0.01, 0.6, 8, 22, winCol);
    } else if (b.id === "research") {
      // 02 research: Solar/tensor grid lab with pulsing antenna beacon
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, "#d9e7f5", wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx * 0.76, b.wy * 0.76, b.h, b.h + 4, "#294c7a", "#1d385c", "#152945", "#d9e7f5");
      for (let i = -0.8; i <= 0.8; i += 0.8) {
        drawWallWindowLeft(b.gx + i, b.gy + b.wy / 2 + 0.01, 0.42, 6, b.h - 6, winCol);
      }
      const antBase = iso(b.gx + 0.9, b.gy - 0.9, b.h + 4);
      const antTop = iso(b.gx + 0.9, b.gy - 0.9, b.h + 22);
      ctx.beginPath();
      ctx.moveTo(antBase.x, antBase.y);
      ctx.lineTo(antTop.x, antTop.y);
      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 2;
      ctx.stroke();

      const pulseR = 3.5 + Math.sin(now * 0.008) * 1.2;
      ctx.beginPath();
      ctx.arc(antTop.x, antTop.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c265";
      ctx.fill();
    } else if (b.id === "experience") {
      // 03 experience: Multi-story tower with waving golden flag
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, roofTop, wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx + 0.28, b.wy + 0.28, b.h, b.h + 6, roofTop, roofLeft, roofRight);
      drawPrism(b.gx, b.gy, b.wx * 0.72, b.wy * 0.72, b.h + 6, b.h + 13, "#4e7cb5", roofTop, roofLeft);

      for (let z = 10; z <= b.h - 14; z += 14) {
        for (let offset of [-0.6, 0, 0.6]) {
          drawWallWindowLeft(b.gx + offset, b.gy + b.wy / 2 + 0.01, 0.34, z, z + 9, winCol);
          drawWallWindowRight(b.gx + b.wx / 2 + 0.01, b.gy + offset, 0.34, z, z + 9, winCol);
        }
      }
      const poleBot = iso(b.gx, b.gy, b.h + 13);
      const poleTop = iso(b.gx, b.gy, b.h + 29);
      ctx.beginPath();
      ctx.moveTo(poleBot.x, poleBot.y);
      ctx.lineTo(poleTop.x, poleTop.y);
      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 2;
      ctx.stroke();
      const wave = Math.sin(now * 0.009) * 2.5;
      drawPoly(
        [
          poleTop,
          { x: poleTop.x + 15, y: poleTop.y + 3 + wave },
          { x: poleTop.x, y: poleTop.y + 9 },
        ],
        "#f0c265"
      );
    } else if (b.id === "cv") {
      // 04 cv: Archive building with 3D CV page on roof
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, roofTop, wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx + 0.24, b.wy + 0.24, b.h, b.h + 5, roofTop, roofLeft, roofRight);
      drawPrism(b.gx, b.gy, 1.1, 0.9, b.h + 5, b.h + 8.5, "#fef3c7", "#fde68a", "#f59e0b");
      for (let off of [-0.24, 0, 0.24]) {
        drawTile(b.gx, b.gy + off, 0.68, 0.08, b.h + 8.8, "#334155");
      }
      for (let off of [-0.5, 0, 0.5]) {
        drawWallWindowLeft(b.gx + off, b.gy + b.wy / 2 + 0.01, 0.32, 8, 22, winCol);
      }
    } else if (b.id === "life") {
      // 05 life: Café with striped yellow/white awning, coffee cup & rising steam wisps!
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, roofTop, wallLeft, wallRight);
      for (let i = -0.8; i <= 0.8; i += 0.4) {
        const stripeCol = Math.round(i * 5) % 2 === 0 ? "#f0c265" : "#ffffff";
        drawPrism(b.gx + i, b.gy + b.wy / 2 + 0.2, 0.38, 0.45, 17, 22, stripeCol, stripeCol, "#d97706");
      }
      drawPrism(b.gx, b.gy, 0.55, 0.55, b.h, b.h + 11, "#fef3c7", "#fde68a", "#eab64d");

      // Animated rising steam wisps above coffee cup
      steamWisps.forEach((w) => {
        const prog = ((now * 0.015 + w.z) % 18) / 18;
        const sz = b.h + 13 + prog * 16;
        const sway = Math.sin(now * 0.006 + w.offset) * 3;
        const pt = iso(b.gx, b.gy, sz);
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - prog) * 0.7})`;
        ctx.beginPath();
        ctx.arc(pt.x + sway, pt.y, 2.2 + prog * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (b.id === "awards") {
      // 06 awards: Pavilion with glowing trophy/screen facade & golden counter
      drawPrism(b.gx, b.gy, b.wx, b.wy, 0, b.h, "#9cb9da", wallLeft, wallRight);
      drawPrism(b.gx, b.gy, b.wx + 0.24, b.wy + 0.24, b.h, b.h + 5, "#7f9fc5", roofLeft, roofRight);
      drawWallWindowLeft(b.gx, b.gy + b.wy / 2 + 0.02, 1.45, 9, 26, "#bae6fd");
      drawPrism(b.gx, b.gy + b.wy / 2 + 0.18, 1.55, 0.32, 5, 9, "#f0c265", "#eab64d", "#ca8a04");
    }
  }

  function renderTown(now) {
    if (!ctx || activeSection) return;
    ctx.clearRect(0, 0, W, H);

    const isNight = root.getAttribute("data-theme") === "night";

    // Update player hop with legendary squash-and-stretch spring physics
    if (player.hopping) {
      const t = Math.min(1, (now - player.hopStart) / 195);
      const ease = 1 - Math.pow(1 - t, 3);
      player.visGx = player.fromGx + (player.toGx - player.fromGx) * ease;
      player.visGy = player.fromGy + (player.toGy - player.fromGy) * ease;
      player.hopZ = Math.sin(t * Math.PI) * 18;

      // Stretch vertically at mid-jump, squash slightly on landing
      if (t < 0.5) {
        player.scaleZ = 1 + Math.sin(t * Math.PI) * 0.22;
        player.scaleX = 1 - Math.sin(t * Math.PI) * 0.12;
      } else {
        player.scaleZ = 1 - Math.sin((t - 0.5) * Math.PI) * 0.15;
        player.scaleX = 1 + Math.sin((t - 0.5) * Math.PI) * 0.12;
      }

      if (t >= 1) {
        player.hopping = false;
        player.visGx = player.gx;
        player.visGy = player.gy;
        player.hopZ = 0;
        player.scaleX = 1;
        player.scaleZ = 1;
        spawnDust(player.gx, player.gy, 6);
      }
    } else if (player.pathQueue.length > 0) {
      const next = player.pathQueue.shift();
      stepToward(next.gx, next.gy);
    } else if (player.pendingSection) {
      const sec = player.pendingSection;
      player.pendingSection = null;
      openSectionPage(sec, true);
    }

    // 1. Soft Ground Drop Shadow beneath the Floating Isometric Island
    const shadowCenter = iso(0, 0, -16);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(shadowCenter.x, shadowCenter.y + 16, tileW * 11.2, tileH * 10.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? "rgba(3, 8, 18, 0.55)" : "rgba(102, 152, 204, 0.22)";
    ctx.fill();
    ctx.restore();

    // 2. Isometric Island Platform Base
    drawPrism(
      0,
      0,
      12.4,
      12.4,
      -15,
      0,
      isNight ? "#243b5e" : "#bdd4ec",
      isNight ? "#182a45" : "#86a6cb",
      isNight ? "#111f35" : "#6486af",
      isNight ? "rgba(155, 195, 242, 0.18)" : "#92b1d4"
    );

    // Subtle tile grid lines
    const gridCol = isNight ? "rgba(160, 198, 242, 0.07)" : "rgba(74, 110, 154, 0.14)";
    for (let g = -5; g <= 5; g++) {
      const p1 = iso(g, -6, 0.2);
      const p2 = iso(g, 6, 0.2);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = gridCol;
      ctx.lineWidth = 1;
      ctx.stroke();

      const q1 = iso(-6, g, 0.2);
      const q2 = iso(6, g, 0.2);
      ctx.beginPath();
      ctx.moveTo(q1.x, q1.y);
      ctx.lineTo(q2.x, q2.y);
      ctx.stroke();
    }

    // 3. Canal River with Floating Crossy-Road Logs, Lily Pads & Shimmer
    drawTile(0, 0.1, 12.3, 1.25, 0.4, isNight ? "#1e5ea8" : "#5ca2ea");
    const waveShift = (now * 0.0022) % 1;
    for (let rx = -5; rx <= 5; rx += 2) {
      drawTile(rx + waveShift * 0.7, 0.1, 0.85, 0.13, 0.6, "rgba(255, 255, 255, 0.42)");
    }

    lilyPads.forEach((lp) => {
      drawTile(lp.gx, lp.gy, 0.42, 0.42, 0.7, isNight ? "#2d6a4f" : "#52b788");
    });

    riverLogs.forEach((log) => {
      log.gx += log.speed;
      if (log.gx > 5.3) log.gx = -5.3;
      drawPrism(log.gx, log.gy, log.len, 0.36, 0.4, 2.6, "#b47b44", "#8d5b2c", "#6f451f");
    });

    // 4. Intersecting Crossy-Road Streets & Zebra Crosswalks
    const roadCol = isNight ? "#1b2e4b" : "#5578a6";
    drawTile(0, -1.65, 12.3, 1.35, 0.5, roadCol);
    for (let rx = -5.5; rx <= 5.5; rx += 1.2) {
      drawTile(rx, -1.65, 0.5, 0.1, 0.7, "rgba(255, 255, 255, 0.65)");
    }

    drawTile(-0.55, 0, 1.35, 12.3, 0.5, roadCol);
    for (let ry = -5.5; ry <= 5.5; ry += 1.2) {
      drawTile(-0.55, ry, 0.1, 0.5, 0.7, "rgba(255, 255, 255, 0.65)");
    }

    for (let s = -0.45; s <= 0.45; s += 0.22) {
      drawTile(-0.55 + s, -0.8, 0.1, 0.45, 0.8, "#edf4fb");
      drawTile(0.35, -1.65 + s, 0.45, 0.1, 0.8, "#edf4fb");
    }

    // Path preview breadcrumbs when auto-walking
    player.pathQueue.forEach((step) => {
      drawTile(step.gx, step.gy, 0.36, 0.36, 1.0, "rgba(234, 182, 77, 0.65)");
    });

    // Pedestrian Bridge across the Canal
    drawPrism(-0.55, 0.1, 1.65, 1.45, 0, 3.5, "#dbe7f4", "#b0c6df", "#8fa9c7", "#6f8fb3");

    // 5. Collect & Depth-Sort All 3D Objects
    const renderables = [];

    Object.values(BUILDINGS).forEach((b) => {
      renderables.push({
        depth: b.gx + b.gy,
        draw: () => drawBuilding(b, isNight, now),
      });
    });

    // Swaying Trees
    TREES.forEach((t) => {
      renderables.push({
        depth: t.gx + t.gy,
        draw: () => {
          const sway = Math.sin(now * 0.003 + t.phase) * 0.04;
          const h = 16 * t.s;
          drawPrism(t.gx, t.gy, 0.22, 0.22, 0, 6 * t.s, "#475569", "#334155", "#1e293b");
          drawPrism(
            t.gx + sway,
            t.gy - sway,
            0.78 * t.s,
            0.78 * t.s,
            6 * t.s,
            6 * t.s + h,
            isNight ? "#3b6e8c" : "#7ca0c0",
            isNight ? "#2c556e" : "#5e83a6",
            isNight ? "#1d3d52" : "#46688a"
          );
        },
      });
    });

    // Streetlamps with Night Glow
    LAMPS.forEach((l) => {
      renderables.push({
        depth: l.gx + l.gy,
        draw: () => {
          drawPrism(l.gx, l.gy, 0.12, 0.12, 0, 22, "#64748b", "#475569", "#334155");
          drawPrism(l.gx, l.gy, 0.36, 0.36, 22, 26, "#ffd166", "#f59e0b", "#d97706");
          if (isNight) {
            const p = iso(l.gx, l.gy, 24);
            const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 42);
            grad.addColorStop(0, "rgba(255, 209, 102, 0.42)");
            grad.addColorStop(1, "rgba(255, 209, 102, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 42, 0, Math.PI * 2);
            ctx.fill();
          }
        },
      });
    });

    // Little Hopping White Crossy-Road Birds on the Grass
    groundBirds.forEach((gb) => {
      const hop = Math.max(0, Math.sin(now * 0.008 + gb.phase)) * 4;
      renderables.push({
        depth: gb.gx + gb.gy,
        draw: () => {
          drawPrism(gb.gx, gb.gy, 0.24, 0.24, hop, hop + 5, "#ffffff", "#e2e8f0", "#cbd5e1");
          drawPrism(gb.gx + 0.1, gb.gy, 0.1, 0.1, hop + 2, hop + 4, "#f97316", "#ea580c", "#c2410c");
        },
      });
    });

    // Moving Cars with Bouncy Suspension & Exhaust Puffs
    cars.forEach((car) => {
      if (car.axis === "x") {
        car.gx += car.speed;
        if (car.gx > 5.6) car.gx = -5.6;
      } else {
        car.gy += car.speed;
        if (car.gy < -5.6) car.gy = 5.6;
      }

      if (Math.random() < 0.14) {
        const backX = car.axis === "x" ? car.gx - 0.5 : car.gx;
        const backY = car.axis === "y" ? car.gy + 0.5 : car.gy;
        particles.push({
          gx: backX,
          gy: backY,
          z: 3,
          vx: (Math.random() - 0.5) * 0.01,
          vy: (Math.random() - 0.5) * 0.01,
          vz: 0.18,
          size: 2.2,
          alpha: 0.55,
          color: "#ffffff",
        });
      }

      const bounce = Math.abs(Math.sin(now * 0.018 + car.gx)) * 1.2;
      renderables.push({
        depth: car.gx + car.gy,
        draw: () => {
          const wx = car.axis === "x" ? 0.85 : 0.55;
          const wy = car.axis === "x" ? 0.55 : 0.85;
          drawPrism(car.gx, car.gy, wx, wy, bounce, bounce + 8, car.color, "#28466e", "#193052");
          drawPrism(car.gx, car.gy, wx * 0.58, wy * 0.58, bounce + 8, bounce + 13, car.roof, "#93c5fd", "#60a5fa");
        },
      });
    });

    // Animated Jogger on West Trail
    const jogPhase = (now * 0.002) % (Math.PI * 2);
    const jogGx = -5.1;
    const jogGy = 3.1 + Math.sin(jogPhase) * 1.1;
    const jogHop = Math.abs(Math.sin(now * 0.013)) * 5.5;
    renderables.push({
      depth: jogGx + jogGy,
      draw: () => {
        drawPrism(jogGx, jogGy, 0.32, 0.32, jogHop, jogHop + 8, "#1e293b", "#0f172a", "#020617");
        drawPrism(jogGx, jogGy, 0.34, 0.34, jogHop + 8, jogHop + 15, "#38bdf8", "#0284c7", "#0369a1");
        drawPrism(jogGx, jogGy, 0.28, 0.28, jogHop + 15, jogHop + 20, "#fde68a", "#fcd34d", "#f59e0b");
      },
    });

    // Player Character with Squash-and-Stretch
    renderables.push({
      depth: player.visGx + player.visGy + 0.05,
      draw: () => {
        const shadow = iso(player.visGx, player.visGy, 0.8);
        ctx.beginPath();
        ctx.ellipse(shadow.x, shadow.y, 7, 3.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
        ctx.fill();

        const z = player.hopZ;
        const w = 0.42 * player.scaleX;
        const h1 = 7 * player.scaleZ;
        const h2 = 17 * player.scaleZ;
        const h3 = 23 * player.scaleZ;

        drawPrism(player.visGx, player.visGy, w * 0.85, w * 0.85, z, z + h1, "#1e3a5f", "#172554", "#0f172a");
        drawPrism(player.visGx, player.visGy, w, w, z + h1, z + h2, "#f6c967", "#e0ab3c", "#c48f22");
        drawPrism(player.visGx, player.visGy, w * 0.85, w * 0.85, z + h2, z + h3, "#fde68a", "#f59e0b", "#d97706");

        // Bobbing pointer above player
        const marker = iso(player.visGx, player.visGy, z + h3 + 7 + Math.sin(now * 0.007) * 2.5);
        ctx.beginPath();
        ctx.moveTo(marker.x, marker.y);
        ctx.lineTo(marker.x - 4, marker.y - 6);
        ctx.lineTo(marker.x + 4, marker.y - 6);
        ctx.closePath();
        ctx.fillStyle = "#eab64d";
        ctx.fill();
      },
    });

    renderables.sort((a, b) => a.depth - b.depth);
    renderables.forEach((r) => r.draw());

    // 6. Render Dust & Exhaust Cube Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.gx += p.vx;
      p.gy += p.vy;
      p.z += p.vz;
      p.alpha -= 0.028;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      const pt = iso(p.gx, p.gy, p.z);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fillRect(pt.x - p.size / 2, pt.y - p.size / 2, p.size, p.size);
    }

    // 7. Sync Floating Pin Labels over the 7 Buildings
    pinLabels.forEach((pin) => {
      const id = pin.getAttribute("data-target");
      const b = id ? BUILDINGS[id] : null;
      if (!b) return;
      const anchor = iso(b.gx, b.gy, b.h + 24);
      pin.style.left = `${anchor.x}px`;
      pin.style.top = `${anchor.y}px`;
    });
  }

  // Master Animation Loop
  function tick(now) {
    renderSky(now);
    renderTown(now);
    requestAnimationFrame(tick);
  }

  // Handle initial URL hash if user loaded e.g. #awards or #research directly
  const initHash = window.location.hash.replace("#", "");
  if (initHash && initHash !== "town" && document.querySelector(`.editorial-page[data-page="${initHash}"]`)) {
    openSectionPage(initHash, false);
  } else {
    updateNearHint();
  }

  requestAnimationFrame(tick);
})();
