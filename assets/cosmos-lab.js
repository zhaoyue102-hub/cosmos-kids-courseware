(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;

  function fit(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }

  function stars(ctx, w, h, t, count) {
    ctx.save();
    const band = ctx.createLinearGradient(0, h * 0.18, w, h * 0.82);
    band.addColorStop(0, "rgba(85,214,255,0)");
    band.addColorStop(0.45, "rgba(126,240,193,.055)");
    band.addColorStop(0.58, "rgba(255,122,182,.04)");
    band.addColorStop(1, "rgba(85,214,255,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i += 1) {
      const x = (Math.sin(i * 37.1) * 0.5 + 0.5) * w;
      const y = (Math.sin(i * 91.7) * 0.5 + 0.5) * h;
      const twinkle = 0.35 + 0.45 * Math.sin(t * 0.0012 + i);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = i % 11 === 0 ? "#ffd166" : i % 7 === 0 ? "#7ef0c1" : "#f8fbff";
      ctx.beginPath();
      ctx.arc(x, y, i % 17 === 0 ? 2.4 : i % 11 === 0 ? 1.7 : 0.9, 0, TAU);
      ctx.fill();
      if (i % 23 === 0) {
        ctx.globalAlpha = twinkle * 0.25;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function pseudo(seed) {
    const x = Math.sin(seed * 999.17) * 43758.5453;
    return x - Math.floor(x);
  }

  function planet(ctx, x, y, r, colors, phase) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.12, x, y, r);
    colors.forEach(([stop, color]) => g.addColorStop(stop, color));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.clip();
    for (let i = 0; i < 28; i += 1) {
      const sx = x + (pseudo(i + r * 3.1) * 2 - 1) * r * 0.78;
      const sy = y + (pseudo(i * 2.3 + r) * 2 - 1) * r * 0.72;
      const dist = Math.hypot(sx - x, sy - y);
      if (dist > r * 0.86) continue;
      const size = r * (0.045 + pseudo(i * 4.7 + phase) * 0.12);
      ctx.globalAlpha = 0.08 + pseudo(i * 5.9) * 0.15;
      ctx.fillStyle = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#111827" : "#7ef0c1";
      ctx.beginPath();
      ctx.ellipse(sx, sy, size * 1.5, size, phase * 0.2 + i, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 0.24;
    for (let i = -3; i <= 3; i += 1) {
      ctx.strokeStyle = i % 2 ? "#ffffff" : "#55d6ff";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(phase + i) * r * 0.14, y + i * r * 0.18, r * 0.9, r * 0.08, Math.sin(phase) * 0.12, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    const shade = ctx.createLinearGradient(x - r, y, x + r, y);
    shade.addColorStop(0, "rgba(0,0,0,.58)");
    shade.addColorStop(0.42, "rgba(0,0,0,.06)");
    shade.addColorStop(1, "rgba(255,255,255,.14)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    const rim = ctx.createRadialGradient(x, y, r * 0.72, x, y, r * 1.1);
    rim.addColorStop(0, "rgba(255,255,255,0)");
    rim.addColorStop(0.74, "rgba(255,255,255,.05)");
    rim.addColorStop(1, "rgba(85,214,255,.22)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function label(ctx, text, x, y) {
    ctx.save();
    ctx.font = "800 18px Inter, sans-serif";
    ctx.textBaseline = "middle";
    const m = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(5,8,24,.72)";
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 1;
    const pad = 12;
    roundRect(ctx, x - pad, y - 17, m + pad * 2, 34, 17);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fbff";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function planetFlyby(ctx, w, h, t) {
    stars(ctx, w, h, t, 96);
    const p = (t * 0.00006) % 1;
    const planets = [
      ["水星", 0.08, 18, [[0, "#f8f0d8"], [1, "#7d746b"]]],
      ["金星", 0.22, 30, [[0, "#fff1b0"], [0.45, "#d98939"], [1, "#6d351c"]]],
      ["地球", 0.39, 33, [[0, "#e6fbff"], [0.45, "#2688d8"], [1, "#143a73"]]],
      ["火星", 0.54, 27, [[0, "#ffd0a3"], [0.52, "#d75b38"], [1, "#4b1d1a"]]],
      ["木星", 0.72, 56, [[0, "#fff4d5"], [0.45, "#c98e55"], [1, "#5a3325"]]],
      ["土星", 0.9, 46, [[0, "#fff3c4"], [0.55, "#d9b270"], [1, "#6c5630"]]]
    ];
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.14)";
    ctx.lineWidth = 1;
    planets.forEach(([name, pos, r, colors], i) => {
      const x = (pos * w + Math.sin(t * 0.0002 + i) * 34 - p * w * 0.16 + w * 0.08) % (w + 120) - 60;
      const y = h * (0.18 + (i % 3) * 0.24) + Math.sin(t * 0.00035 + i * 2) * 18;
      planet(ctx, x, y, r, colors, t * 0.001 + i);
      if (name === "土星") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.35);
        ctx.strokeStyle = "rgba(255,230,180,.58)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.8, r * 0.42, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      label(ctx, name, x - r * 0.5, y + r + 24);
    });
    ctx.strokeStyle = "rgba(126,240,193,.5)";
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(20, h - 50);
    ctx.bezierCurveTo(w * 0.28, h * 0.42, w * 0.66, h * 0.64, w - 24, 48);
    ctx.stroke();
    ctx.restore();
  }

  function distanceModel(ctx, w, h, t) {
    stars(ctx, w, h, t, 70);
    const y = h * 0.58;
    const start = 54;
    const end = w - 52;
    const planets = [
      ["水", 0.05, 6, "#b8b0a4"],
      ["金", 0.09, 9, "#f1c27d"],
      ["地", 0.14, 10, "#55d6ff"],
      ["火", 0.2, 8, "#ff7a5c"],
      ["木", 0.46, 22, "#d6a66a"],
      ["土", 0.67, 19, "#ffd166"],
      ["天", 0.83, 14, "#7ef0c1"],
      ["海", 0.96, 14, "#7aa8ff"]
    ];
    const glow = ctx.createRadialGradient(start, y, 0, start, y, 82);
    glow.addColorStop(0, "#fff7b0");
    glow.addColorStop(0.45, "#ffd166");
    glow.addColorStop(1, "rgba(255,121,31,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(start, y, 82, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(start, y, 34, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.24)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(start + 55, y);
    ctx.lineTo(end, y);
    ctx.stroke();
    planets.forEach(([name, pos, r, color], i) => {
      const x = start + 65 + (end - start - 90) * pos;
      const bob = Math.sin(t * 0.001 + i) * 8;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y + bob, r, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      label(ctx, name, x - 10, y + bob + 38);
    });
    ctx.fillStyle = "rgba(248,251,255,.85)";
    ctx.font = "800 20px Inter, sans-serif";
    ctx.fillText("内侧很挤，外侧越来越空", 38, 46);
  }

  function sunEnergy(ctx, w, h, t) {
    stars(ctx, w, h, t, 72);
    const cx = w * 0.5;
    const cy = h * 0.5;
    const pulse = 1 + Math.sin(t * 0.0014) * 0.06;

    const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.46 * pulse);
    corona.addColorStop(0, "rgba(255,247,176,.95)");
    corona.addColorStop(0.22, "rgba(255,209,102,.72)");
    corona.addColorStop(0.5, "rgba(255,121,31,.28)");
    corona.addColorStop(1, "rgba(255,121,31,0)");
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.46 * pulse, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * TAU + t * 0.00025;
      const len = Math.min(w, h) * (0.34 + Math.sin(t * 0.001 + i) * 0.04);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const ray = ctx.createLinearGradient(58 * pulse, 0, len, 0);
      ray.addColorStop(0, "rgba(255,247,176,.82)");
      ray.addColorStop(0.55, "rgba(255,209,102,.34)");
      ray.addColorStop(1, "rgba(255,209,102,0)");
      ctx.strokeStyle = ray;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(58 * pulse, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.restore();
    }

    const core = ctx.createRadialGradient(cx - 18, cy - 18, 8, cx, cy, 54 * pulse);
    core.addColorStop(0, "#fffef0");
    core.addColorStop(0.45, "#ffd166");
    core.addColorStop(1, "#ff791f");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 54 * pulse, 0, TAU);
    ctx.fill();

    const earthX = cx + Math.cos(t * 0.00045) * w * 0.3;
    const earthY = cy + Math.sin(t * 0.00045) * h * 0.18 + 42;
    planet(ctx, earthX, earthY, 22, [[0, "#e6fbff"], [0.45, "#2688d8"], [1, "#153b72"]], t * 0.001);

    ctx.save();
    ctx.strokeStyle = "rgba(255,209,102,.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(cx + 58 * pulse, cy);
    ctx.lineTo(earthX - 18, earthY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const photon = ((t * 0.00012) % 1);
    const px = cx + 58 * pulse + (earthX - cx - 58 * pulse) * photon;
    const py = cy + (earthY - cy) * photon;
    ctx.fillStyle = "#7ef0c1";
    ctx.shadowColor = "#7ef0c1";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;

    label(ctx, "太阳能量站", cx - 58, cy - 108);
    label(ctx, "光约 8 分钟到地球", earthX - 92, earthY + 42);
  }

  function earthMoonTide(ctx, w, h, t) {
    stars(ctx, w, h, t, 80);
    const cx = w * 0.42;
    const cy = h * 0.5;
    const moonAngle = t * 0.00035;
    const mx = cx + Math.cos(moonAngle) * w * 0.28;
    const my = cy + Math.sin(moonAngle) * h * 0.24;

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.28, h * 0.24, 0, 0, TAU);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(moonAngle);
    const tide = 1 + Math.sin(t * 0.0012) * 0.04;
    ctx.fillStyle = "rgba(85,214,255,.38)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 78 * tide, 58 / tide, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    planet(ctx, cx, cy, 56, [[0, "#e6fbff"], [0.45, "#2688d8"], [1, "#153b72"]], t * 0.001);
    planet(ctx, mx, my, 26, [[0, "#ffffff"], [0.5, "#a8a8a8"], [1, "#4a4a4a"]], t * 0.0007);
    ctx.strokeStyle = "rgba(255,209,102,.58)";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 9]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(mx, my);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, "地球：海水被拉出潮汐", cx - 95, cy + 100);
    label(ctx, "月球引力", mx - 42, my + 50);
  }

  function moonPhaseDemo(ctx, w, h, t) {
    stars(ctx, w, h, t, 76);
    const cx = w * 0.48;
    const cy = h * 0.52;
    const orbitR = Math.min(w, h) * 0.28;
    const angle = t * 0.00032;
    const sunX = 72;
    const sunY = h * 0.5;
    const moonX = cx + Math.cos(angle) * orbitR;
    const moonY = cy + Math.sin(angle) * orbitR * 0.72;

    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 95);
    sunGlow.addColorStop(0, "rgba(255,247,176,.95)");
    sunGlow.addColorStop(0.35, "rgba(255,209,102,.62)");
    sunGlow.addColorStop(1, "rgba(255,209,102,0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 95, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 34, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, orbitR, orbitR * 0.72, 0, 0, TAU);
    ctx.stroke();

    planet(ctx, cx, cy, 42, [[0, "#e6fbff"], [0.45, "#2688d8"], [1, "#153b72"]], t * 0.001);
    label(ctx, "地球", cx - 22, cy + 68);

    ctx.save();
    ctx.strokeStyle = "rgba(255,209,102,.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 11]);
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(sunX + 48, sunY + i * 20);
      ctx.lineTo(w - 36, sunY + i * 20);
      ctx.stroke();
    }
    ctx.restore();

    const toSun = Math.atan2(sunY - moonY, sunX - moonX);
    const moonR = 31;
    ctx.save();
    ctx.translate(moonX, moonY);
    ctx.rotate(toSun);
    const moonGrad = ctx.createLinearGradient(-moonR, 0, moonR, 0);
    moonGrad.addColorStop(0, "#f8fbff");
    moonGrad.addColorStop(0.46, "#c9c9c9");
    moonGrad.addColorStop(0.54, "#44495e");
    moonGrad.addColorStop(1, "#15182d");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(0, 0, moonR, 0, TAU);
    ctx.fill();
    ctx.restore();

    const phase = (Math.cos(angle) + 1) / 2;
    const names = ["满月", "下弦月", "新月", "上弦月"];
    const idx = Math.floor((((angle % TAU) + TAU) % TAU) / (TAU / 4)) % 4;
    label(ctx, names[idx], moonX - 28, moonY + 52);

    ctx.fillStyle = "rgba(248,251,255,.88)";
    ctx.font = "800 18px Inter, sans-serif";
    ctx.fillText("太阳光方向", sunX + 18, sunY - 76);
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillStyle = "rgba(200,213,255,.78)";
    ctx.fillText("亮面永远朝向太阳；我们在地球上看到的角度不同。", 36, h - 34);

    ctx.save();
    ctx.globalAlpha = 0.22 + phase * 0.15;
    ctx.strokeStyle = "#7ef0c1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR + 7, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function blackHoleLens(ctx, w, h, t) {
    stars(ctx, w, h, t, 120);
    const cx = w * 0.52;
    const cy = h * 0.5;
    const spin = t * 0.00045;

    for (let i = 0; i < 26; i += 1) {
      const a = spin + i * 0.28;
      const r = 74 + i * 4;
      const x = cx + Math.cos(a) * r * 1.55;
      const y = cy + Math.sin(a) * r * 0.48;
      ctx.fillStyle = i % 2 ? "rgba(255,209,102,.55)" : "rgba(85,214,255,.42)";
      ctx.beginPath();
      ctx.arc(x, y, 2.2 + (i % 4), 0, TAU);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.18);
    for (let i = 0; i < 6; i += 1) {
      ctx.strokeStyle = i < 3 ? "rgba(255,209,102,.62)" : "rgba(255,122,182,.32)";
      ctx.lineWidth = 8 - i;
      ctx.beginPath();
      ctx.ellipse(0, 0, 146 + i * 12, 48 + i * 5, 0, spin + i * 0.4, spin + Math.PI * 1.55 + i * 0.4);
      ctx.stroke();
    }
    ctx.restore();

    const lens = ctx.createRadialGradient(cx, cy, 18, cx, cy, 190);
    lens.addColorStop(0, "rgba(0,0,0,1)");
    lens.addColorStop(0.25, "rgba(0,0,0,.98)");
    lens.addColorStop(0.34, "rgba(85,214,255,.22)");
    lens.addColorStop(0.58, "rgba(85,214,255,.08)");
    lens.addColorStop(1, "rgba(85,214,255,0)");
    ctx.fillStyle = lens;
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = "rgba(248,251,255,.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 66 + Math.sin(t * 0.001) * 3, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = "#02030a";
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 3; i += 1) {
      ctx.strokeStyle = `rgba(126,240,193,${0.32 - i * 0.08})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 92 + i * 68);
      ctx.quadraticCurveTo(cx - 92, cy - 70 + i * 45, w - 44, 68 + i * 54);
      ctx.stroke();
    }

    label(ctx, "光被强引力弯曲", 34, 40);
    label(ctx, "事件视界", cx - 38, cy + 92);
    label(ctx, "吸积盘", cx + 96, cy - 96);
  }

  function explorationTools(ctx, w, h, t) {
    stars(ctx, w, h, t, 95);
    const earthX = w * 0.26;
    const earthY = h * 0.64;
    const orbitR = Math.min(w, h) * 0.25;
    const a = t * 0.00042;

    planet(ctx, earthX, earthY, 58, [[0, "#e6fbff"], [0.35, "#2f9ae8"], [0.62, "#1f7a5a"], [1, "#12366d"]], t * 0.001);
    label(ctx, "地球出发", earthX - 48, earthY + 86);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(earthX, earthY, orbitR * 1.05, orbitR * 0.52, -0.18, 0, TAU);
    ctx.stroke();
    ctx.restore();

    const satX = earthX + Math.cos(a) * orbitR * 1.05;
    const satY = earthY + Math.sin(a) * orbitR * 0.52;
    ctx.save();
    ctx.translate(satX, satY);
    ctx.rotate(a + 0.8);
    ctx.fillStyle = "#dbeafe";
    ctx.strokeStyle = "rgba(248,251,255,.72)";
    ctx.lineWidth = 2;
    roundRect(ctx, -18, -12, 36, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(85,214,255,.75)";
    ctx.fillRect(-54, -10, 32, 20);
    ctx.fillRect(22, -10, 32, 20);
    ctx.restore();

    const rocketT = (t * 0.00012) % 1;
    const rx = w * (0.38 + rocketT * 0.45);
    const ry = h * (0.72 - Math.sin(rocketT * Math.PI) * 0.48);
    ctx.save();
    ctx.strokeStyle = "rgba(255,209,102,.45)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(earthX + 42, earthY - 40);
    ctx.bezierCurveTo(w * 0.45, h * 0.18, w * 0.68, h * 0.16, w * 0.82, h * 0.38);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.translate(rx, ry);
    ctx.rotate(-0.55 + rocketT * 0.9);
    ctx.fillStyle = "#f8fbff";
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(14, 16);
    ctx.lineTo(0, 10);
    ctx.lineTo(-14, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff7a5c";
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(0, 42 + Math.sin(t * 0.008) * 5);
    ctx.lineTo(8, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const scopeX = w * 0.78;
    const scopeY = h * 0.46;
    ctx.save();
    ctx.translate(scopeX, scopeY);
    ctx.rotate(-0.28);
    ctx.fillStyle = "rgba(219,234,254,.9)";
    roundRect(ctx, -58, -18, 116, 36, 16);
    ctx.fill();
    ctx.fillStyle = "rgba(85,214,255,.32)";
    ctx.fillRect(-46, -12, 70, 24);
    ctx.strokeStyle = "rgba(248,251,255,.65)";
    ctx.lineWidth = 3;
    ctx.strokeRect(-58, -18, 116, 36);
    ctx.restore();

    ctx.save();
    const beam = ctx.createLinearGradient(scopeX - 28, scopeY - 34, w - 18, h * 0.2);
    beam.addColorStop(0, "rgba(85,214,255,.28)");
    beam.addColorStop(1, "rgba(85,214,255,0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(scopeX - 28, scopeY - 34);
    ctx.lineTo(w - 22, h * 0.15);
    ctx.lineTo(w - 18, h * 0.34);
    ctx.lineTo(scopeX + 8, scopeY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    label(ctx, "火箭送出去", rx - 64, ry - 44);
    label(ctx, "卫星通信", satX - 44, satY + 42);
    label(ctx, "望远镜看更远", scopeX - 82, scopeY + 58);
  }

  const renderers = {
    "planet-flyby": planetFlyby,
    "distance-model": distanceModel,
    "sun-energy": sunEnergy,
    "earth-moon-tide": earthMoonTide,
    "moon-phase": moonPhaseDemo,
    "black-hole": blackHoleLens,
    "exploration-tools": explorationTools
  };

  function boot(el) {
    const canvas = document.createElement("canvas");
    canvas.className = "cosmos-canvas";
    el.appendChild(canvas);
    let raf = 0;
    let state = fit(canvas);
    const ro = new ResizeObserver(() => { state = fit(canvas); });
    ro.observe(el);
    const draw = (t) => {
      state.ctx.clearRect(0, 0, state.w, state.h);
      renderers[el.dataset.cosmos](state.ctx, state.w, state.h, reduceMotion ? 1200 : t);
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }

  const cleanups = new WeakMap();
  function refresh() {
    document.querySelectorAll("[data-cosmos]").forEach((el) => {
      const slide = el.closest(".slide");
      const active = slide && slide.classList.contains("is-active");
      if (active && !cleanups.has(el)) cleanups.set(el, boot(el));
      if (!active && cleanups.has(el)) {
        cleanups.get(el)();
        cleanups.delete(el);
        el.querySelectorAll("canvas.cosmos-canvas").forEach((canvas) => canvas.remove());
      }
    });
  }

  const mo = new MutationObserver(refresh);
  mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", refresh);
  window.addEventListener("DOMContentLoaded", refresh);
  setTimeout(refresh, 200);
})();
