(() => {
  "use strict";

  const TARGET_USER = "Dibyansu33Gouda";
  const ROOT_ID = "dibyansu-3d-snake";
  const SCAN_DELAY = 700;
  const STEP_MS = 105;
  const LEVELS = [0, 1, 2, 3, 4];

  let runtime = null;
  let scanTimer = 0;
  let lastSignature = "";
  let lastUrl = location.href;
  let manuallyClosed = false;

  const $ = (selector, root = document) => root.querySelector(selector);

  function isTargetProfile() {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.length === 1 && parts[0].toLowerCase() === TARGET_USER.toLowerCase();
  }

  function numeric(value, fallback = 0) {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function cluster(values, tolerance = 3) {
    const sorted = [...values].sort((a, b) => a - b);
    const groups = [];
    for (const value of sorted) {
      const current = groups[groups.length - 1];
      if (!current || Math.abs(value - current.mean) > tolerance) {
        groups.push({ values: [value], mean: value });
      } else {
        current.values.push(value);
        current.mean = current.values.reduce((sum, item) => sum + item, 0) / current.values.length;
      }
    }
    return groups.map(group => group.mean);
  }

  function nearestIndex(values, value) {
    let answer = 0;
    let distance = Infinity;
    values.forEach((item, index) => {
      const nextDistance = Math.abs(item - value);
      if (nextDistance < distance) {
        distance = nextDistance;
        answer = index;
      }
    });
    return answer;
  }

  function levelFromElement(element) {
    const levelAttribute = element.getAttribute("data-level");
    if (levelAttribute !== null && /^\d+$/.test(levelAttribute)) {
      return Math.max(0, Math.min(4, numeric(levelAttribute)));
    }

    const count = numeric(element.getAttribute("data-count"), 0);
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  function readCalendar() {
    const selectors = [
      "rect.day",
      "td.ContributionCalendar-day",
      "td[data-date]",
      "[data-date][data-level]",
      "[data-date][data-count]"
    ];

    const candidates = [...document.querySelectorAll(selectors.join(","))];
    const seen = new Set();
    const cells = [];

    for (const element of candidates) {
      if (element.closest(`#${ROOT_ID}`)) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;

      const date = element.getAttribute("data-date") || "";
      const fallbackKey = `cell-${cells.length}`;
      const key = date || fallbackKey;
      if (seen.has(key)) continue;
      seen.add(key);

      cells.push({
        key,
        date,
        element,
        level: levelFromElement(element),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2
      });
    }

    if (cells.length < 35) return null;

    const xColumns = cluster(cells.map(cell => cell.left));
    const yRows = cluster(cells.map(cell => cell.top));
    cells.forEach(cell => {
      cell.col = nearestIndex(xColumns, cell.left);
      cell.row = nearestIndex(yRows, cell.top);
    });

    const bounds = {
      left: Math.min(...cells.map(cell => cell.left)),
      top: Math.min(...cells.map(cell => cell.top)),
      right: Math.max(...cells.map(cell => cell.right)),
      bottom: Math.max(...cells.map(cell => cell.bottom))
    };

    const signature = cells
      .map(cell => `${cell.key}:${cell.level}:${cell.col}:${cell.row}:${Math.round(cell.width)}:${Math.round(cell.height)}`)
      .join("|");

    return { cells, bounds, signature };
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  }

  function addDefinitions(svg) {
    const defs = svgElement("defs");

    const snakeGradient = svgElement("linearGradient", {
      id: "dg3d-snake-gradient",
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%"
    });
    snakeGradient.append(
      svgElement("stop", { offset: "0%", "stop-color": "#39d353" }),
      svgElement("stop", { offset: "55%", "stop-color": "#d4ff4f" }),
      svgElement("stop", { offset: "100%", "stop-color": "#fff7a8" })
    );

    const headGradient = svgElement("radialGradient", { id: "dg3d-head-gradient", cx: "35%", cy: "30%" });
    headGradient.append(
      svgElement("stop", { offset: "0%", "stop-color": "#fff7a8" }),
      svgElement("stop", { offset: "55%", "stop-color": "#d4ff4f" }),
      svgElement("stop", { offset: "100%", "stop-color": "#4a9c2e" })
    );

    const blur = svgElement("filter", { id: "dg3d-blur", x: "-80%", y: "-80%", width: "260%", height: "260%" });
    blur.append(svgElement("feGaussianBlur", { stdDeviation: "3" }));

    const shadow = svgElement("filter", { id: "dg3d-shadow", x: "-80%", y: "-80%", width: "260%", height: "260%" });
    shadow.append(
      svgElement("feDropShadow", {
        dx: "0",
        dy: "2",
        stdDeviation: "1.7",
        "flood-color": "#08140a",
        "flood-opacity": ".85"
      })
    );

    defs.append(snakeGradient, headGradient, blur, shadow);
    svg.append(defs);
  }

  function pointFor(cell, left, top) {
    return { x: cell.cx - left, y: cell.cy - top };
  }

  function topFace(point, half, depth, height) {
    return [
      `${point.x},${point.y - depth - height}`,
      `${point.x + half},${point.y - height}`,
      `${point.x},${point.y + depth - height}`,
      `${point.x - half},${point.y - height}`
    ].join(" ");
  }

  function leftFace(point, half, depth, height) {
    return [
      `${point.x - half},${point.y - height}`,
      `${point.x},${point.y + depth - height}`,
      `${point.x},${point.y + depth}`,
      `${point.x - half},${point.y}`
    ].join(" ");
  }

  function rightFace(point, half, depth, height) {
    return [
      `${point.x},${point.y + depth - height}`,
      `${point.x + half},${point.y - height}`,
      `${point.x + half},${point.y}`,
      `${point.x},${point.y + depth}`
    ].join(" ");
  }

  function createBlock(cell, left, top, blocks) {
    const point = pointFor(cell, left, top);
    const size = Math.max(5, Math.min(cell.width, cell.height));
    const half = size * 0.48;
    const depth = Math.max(1.5, size * 0.22);
    const height = 2 + cell.level * 2.5;
    const group = svgElement("g", { class: `dg3d-block level-${cell.level}` });
    group.dataset.cellKey = cell.key;
    group.append(
      svgElement("polygon", { class: "top", points: topFace(point, half, depth, height) }),
      svgElement("polygon", { class: "left", points: leftFace(point, half, depth, height) }),
      svgElement("polygon", { class: "right", points: rightFace(point, half, depth, height) })
    );
    blocks.append(group);
    return group;
  }

  function gridCellMap(cells) {
    const result = new Map();
    cells.forEach(cell => result.set(`${cell.col},${cell.row}`, cell));
    return result;
  }

  function walkBetween(from, to, map) {
    const points = [];
    let col = from.col;
    let row = from.row;
    const horizontalStep = to.col >= col ? 1 : -1;
    const verticalStep = to.row >= row ? 1 : -1;

    while (col !== to.col) {
      col += horizontalStep;
      points.push(map.get(`${col},${row}`) || to);
    }
    while (row !== to.row) {
      row += verticalStep;
      points.push(map.get(`${col},${row}`) || to);
    }
    return points;
  }

  function buildRoute(cells) {
    const map = gridCellMap(cells);
    const traversal = [...cells].sort((a, b) => {
      if (a.col !== b.col) return a.col - b.col;
      return a.col % 2 === 0 ? a.row - b.row : b.row - a.row;
    });

    const start = traversal[0];
    const targets = cells
      .filter(cell => cell.level > 0)
      .sort((a, b) => a.level - b.level || a.date.localeCompare(b.date));

    if (!targets.length) return { route: traversal, events: new Map() };

    const route = [start];
    const events = new Map();
    let current = start;

    for (const target of targets) {
      const segment = walkBetween(current, target, map);
      segment.forEach(cell => route.push(cell));
      events.set(route.length - 1, target);
      current = target;
    }

    return { route, events };
  }

  function destroy() {
    if (!runtime) return;
    if (runtime.frame) cancelAnimationFrame(runtime.frame);
    runtime.root.remove();
    runtime = null;
  }

  function updatePosition(model) {
    if (!runtime) return;
    const pad = runtime.pad;
    const left = model.bounds.left - pad;
    const top = model.bounds.top - pad;
    runtime.root.style.left = `${left}px`;
    runtime.root.style.top = `${top}px`;
  }

  function startAnimation(state) {
    const { route, events } = state;
    let routeIndex = 0;
    let stepStarted = performance.now();
    let history = [pointFor(route[0], state.left, state.top)];
    const total = [...events.values()].length;
    let eaten = 0;

    function draw(position) {
      history.unshift(position);
      history = history.slice(0, 24);
      const points = history.map(item => `${item.x},${item.y}`).join(" ");
      state.glow.setAttribute("points", points);
      state.line.setAttribute("points", points);
      state.highlight.setAttribute("points", points);
      state.head.setAttribute("transform", `translate(${position.x} ${position.y})`);
    }

    function nextEvent() {
      const target = events.get(routeIndex);
      if (!target) return;
      const block = state.blocks.get(target.key);
      if (block) block.classList.add("eaten");
      eaten += 1;
      state.status.textContent = `${eaten}/${total} eaten`;
    }

    function frame(now) {
      if (!runtime || runtime !== state) return;
      if (state.paused) {
        state.frame = requestAnimationFrame(frame);
        stepStarted = now;
        return;
      }

      if (routeIndex >= route.length - 1) {
        state.status.textContent = `complete · ${eaten}/${total}`;
        state.frame = requestAnimationFrame(() => restart(state));
        return;
      }

      const from = pointFor(route[routeIndex], state.left, state.top);
      const to = pointFor(route[routeIndex + 1], state.left, state.top);
      const progress = Math.min(1, (now - stepStarted) / STEP_MS);
      const position = {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress
      };
      draw(position);

      if (progress >= 1) {
        routeIndex += 1;
        stepStarted = now;
        nextEvent();
      }

      state.frame = requestAnimationFrame(frame);
    }

    state.frame = requestAnimationFrame(frame);
  }

  function restart(state) {
    if (!runtime || runtime !== state) return;
    state.blocks.forEach(block => block.classList.remove("eaten"));
    state.status.textContent = `0/${state.total} eaten`;
    state.frame = 0;
    state.routeIndex = 0;
    state.restarting = true;
    setTimeout(() => {
      if (!runtime || runtime !== state) return;
      state.restarting = false;
      startAnimation(state);
    }, 500);
  }

  function build(model) {
    destroy();

    const pad = 12;
    const left = model.bounds.left - pad;
    const top = model.bounds.top - pad;
    const width = model.bounds.right - model.bounds.left + pad * 2;
    const height = model.bounds.bottom - model.bounds.top + pad * 2;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.style.left = `${left}px`;
    root.style.top = `${top}px`;
    root.style.width = `${width}px`;
    root.style.height = `${height}px`;

    const toolbar = document.createElement("div");
    toolbar.className = "dg3d-toolbar";
    toolbar.innerHTML = `
      <span>3D SNAKE</span>
      <span class="dg3d-status">loading</span>
      <button type="button" data-action="pause" aria-label="Pause or play snake">Ⅱ</button>
      <button type="button" data-action="replay" aria-label="Replay snake">↻</button>
      <button type="button" data-action="close" aria-label="Close snake">×</button>
    `;

    const svg = svgElement("svg", { width, height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    addDefinitions(svg);

    const blocksGroup = svgElement("g", { class: "dg3d-blocks" });
    const glow = svgElement("polyline", { class: "dg3d-snake-glow", points: "" });
    const line = svgElement("polyline", { class: "dg3d-snake-line", points: "" });
    const highlight = svgElement("polyline", { class: "dg3d-snake-highlight", points: "" });
    const snakeGroup = svgElement("g", { class: "dg3d-head" });
    const head = svgElement("circle", { r: "6", fill: "url(#dg3d-head-gradient)" });
    const leftEye = svgElement("circle", { class: "dg3d-head-eye", cx: "-2.2", cy: "-1.7", r: "1.55" });
    const rightEye = svgElement("circle", { class: "dg3d-head-eye", cx: "2.2", cy: "-1.7", r: "1.55" });
    const leftDot = svgElement("circle", { class: "dg3d-head-eye-dot", cx: "-2.2", cy: "-1.7", r: ".55" });
    const rightDot = svgElement("circle", { class: "dg3d-head-eye-dot", cx: "2.2", cy: "-1.7", r: ".55" });
    snakeGroup.append(head, leftEye, rightEye, leftDot, rightDot);

    const blocks = new Map();
    model.cells.forEach(cell => blocks.set(cell.key, createBlock(cell, left, top, blocksGroup)));
    svg.append(blocksGroup, glow, line, highlight, snakeGroup);
    root.append(toolbar, svg);
    document.documentElement.append(root);

    const routeData = buildRoute(model.cells);
    const positiveCount = model.cells.filter(cell => cell.level > 0).length;
    runtime = {
      root,
      svg,
      pad,
      left,
      top,
      blocks,
      glow,
      line,
      highlight,
      head: snakeGroup,
      status: $(".dg3d-status", toolbar),
      route: routeData.route,
      events: routeData.events,
      total: positiveCount,
      paused: false,
      frame: 0,
      restarting: false
    };
    runtime.status.textContent = `0/${positiveCount} eaten`;

    $("[data-action=close]", toolbar).addEventListener("click", () => {
      manuallyClosed = true;
      destroy();
    });
    $("[data-action=pause]", toolbar).addEventListener("click", event => {
      runtime.paused = !runtime.paused;
      event.currentTarget.textContent = runtime.paused ? "▶" : "Ⅱ";
    });
    $("[data-action=replay]", toolbar).addEventListener("click", () => restart(runtime));

    startAnimation(runtime);
  }

  function scheduleScan(delay = SCAN_DELAY) {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, delay);
  }

  function scan() {
    if (!isTargetProfile()) {
      manuallyClosed = false;
      destroy();
      lastSignature = "";
      return;
    }

    const model = readCalendar();
    if (!model) {
      scheduleScan(1200);
      return;
    }

    if (manuallyClosed) return;

    if (runtime && model.signature === lastSignature) {
      updatePosition(model);
      return;
    }

    lastSignature = model.signature;
    build(model);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && runtime) destroy();
  });

  window.addEventListener("resize", () => scheduleScan(150));
  window.addEventListener("scroll", () => {
    if (runtime) scheduleScan(80);
  }, { passive: true });
  window.addEventListener("popstate", () => {
    lastUrl = location.href;
    scheduleScan(300);
  });

  const observer = new MutationObserver(mutations => {
    const relevant = mutations.some(mutation => {
      const target = mutation.target;
      return !(target instanceof Element && target.closest(`#${ROOT_ID}`));
    });
    if (relevant) scheduleScan();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });

  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      scheduleScan(250);
    } else if (!runtime) {
      scheduleScan(250);
    }
  }, 2500);

  scheduleScan(1000);
})();
