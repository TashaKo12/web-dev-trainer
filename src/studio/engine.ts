import { isColor, isImage, type Action, type Condition, type KeyName, type ObjectKind, type Op, type Project, type Scene } from "./model";

// The game that runs: objects move by their behaviors, then every event of the scene is checked from top to bottom.
// The scene has no edges: the screen is a camera over the world (it starts at 0,0 and can follow an object).
// Like in GDevelop, a condition «Игрок касается Монеты» remembers WHICH coins were touched,
// and the action «Удалить Монету» in the same event removes only those.

type Body = {
  id: number;
  kind: ObjectKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  onGround: boolean;
  /** patrol: where it started and which way it goes */
  home: { x: number; y: number };
  dir: 1 | -1;
  dead: boolean;
};

type Picked = Map<string, Set<Body>>;

const KEY_CODES: Record<KeyName, string[]> = {
  ArrowLeft: ["ArrowLeft", "KeyA"],
  ArrowRight: ["ArrowRight", "KeyD"],
  ArrowUp: ["ArrowUp", "KeyW"],
  ArrowDown: ["ArrowDown", "KeyS"],
  Space: ["Space"],
  Enter: ["Enter", "NumpadEnter"],
};
const GAME_KEYS = new Set(Object.values(KEY_CODES).flat());

const compare = (a: number, op: Op, b: number) =>
  op === "=" ? a === b : op === "≠" ? a !== b : op === ">" ? a > b : op === "<" ? a < b : op === "≥" ? a >= b : a <= b;

const touching = (a: Body, b: Body) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export type GameStatus = { message: string | null; stopped: string | null; vars: Record<string, number>; firedEvent: string | null };

export class Game {
  private project: Project;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private scene!: Scene;
  private bodies: Body[] = [];
  private nextId = 1;
  private keys = new Set<string>();
  private clicks: { x: number; y: number }[] = [];
  private vars: Record<string, number> = {};
  private message: string | null = null;
  private stopped: string | null = null;
  private frame = 0;
  private time = 0;
  private timers = new Map<string, number>();
  private raf = 0;
  private last = 0;
  private pendingScene: string | null = null;
  private onStatus: (s: GameStatus) => void;
  private firedEvent: string | null = null;
  private lastStatus = "";
  /** The top-left corner of what the screen shows, in world coordinates. */
  private camera = { x: 0, y: 0 };
  private follow: { obj: string; smooth: boolean } | null = null;

  constructor(project: Project, canvas: HTMLCanvasElement, onStatus: (s: GameStatus) => void) {
    this.project = project;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onStatus = onStatus;
    for (const o of project.objects)
      if (isImage(o.look)) {
        const img = new Image();
        img.src = o.look;
        this.images.set(o.id, img);
      }
  }

  start(sceneId?: string) {
    this.vars = Object.fromEntries(this.project.variables.map((v) => [v.name, v.value]));
    this.loadScene(sceneId ?? this.project.scenes[0].id);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.canvas.addEventListener("pointerdown", this.onPointer);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    this.canvas.removeEventListener("pointerdown", this.onPointer);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onBlur = () => this.keys.clear();
  private onPointer = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.clicks.push({ x: ((e.clientX - r.left) / r.width) * this.scene.w + this.camera.x, y: ((e.clientY - r.top) / r.height) * this.scene.h + this.camera.y });
  };

  private kindOf = (id: string) => this.project.objects.find((o) => o.id === id);

  private spawn(kindId: string, x: number, y: number) {
    const kind = this.kindOf(kindId);
    if (!kind) return;
    this.bodies.push({ id: this.nextId++, kind, x, y, w: kind.w, h: kind.h, vy: 0, onGround: false, home: { x, y }, dir: 1, dead: false });
  }

  private loadScene(id: string) {
    const scene = this.project.scenes.find((s) => s.id === id) ?? this.project.scenes[0];
    this.scene = scene;
    this.canvas.width = scene.w;
    this.canvas.height = scene.h;
    this.bodies = [];
    for (const i of scene.instances) this.spawn(i.kind, i.x, i.y);
    this.message = null;
    this.stopped = null;
    this.frame = 0;
    this.time = 0;
    this.timers.clear();
    this.camera = { x: 0, y: 0 };
    this.follow = null;
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.stopped) this.step(dt);
    this.draw();
    // tell the screen only when something it shows has changed — not 60 times a second
    const status = { message: this.message, stopped: this.stopped, vars: { ...this.vars }, firedEvent: this.firedEvent };
    const key = JSON.stringify(status);
    if (key !== this.lastStatus) {
      this.lastStatus = key;
      this.onStatus(status);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  // ── movement ──

  private down = (k: KeyName) => KEY_CODES[k].some((c) => this.keys.has(c));
  private solids = (self: Body) => this.bodies.filter((b) => b !== self && !b.dead && b.kind.behaviors.some((x) => x.kind === "solid"));

  /** Moves along one axis and stops at solid objects. Returns true when it bumped into something. */
  private move(b: Body, dx: number, dy: number) {
    let hit = false;
    if (dx) {
      b.x += dx;
      for (const s of this.solids(b))
        if (touching(b, s)) {
          b.x = dx > 0 ? s.x - b.w : s.x + s.w;
          hit = true;
        }
    }
    if (dy) {
      b.y += dy;
      for (const s of this.solids(b))
        if (touching(b, s)) {
          b.y = dy > 0 ? s.y - b.h : s.y + s.h;
          hit = true;
        }
    }
    return hit;
  }

  private behave(b: Body, dt: number) {
    const has = (k: string) => b.kind.behaviors.some((x) => x.kind === k);
    for (const beh of b.kind.behaviors) {
      if (beh.kind === "topdown") {
        const dx = (this.down("ArrowRight") ? 1 : 0) - (this.down("ArrowLeft") ? 1 : 0);
        const dy = (this.down("ArrowDown") ? 1 : 0) - (this.down("ArrowUp") ? 1 : 0);
        const len = Math.hypot(dx, dy) || 1;
        this.move(b, (dx / len) * beh.speed * dt, 0);
        this.move(b, 0, (dy / len) * beh.speed * dt);
      } else if (beh.kind === "platformer") {
        const dx = (this.down("ArrowRight") ? 1 : 0) - (this.down("ArrowLeft") ? 1 : 0);
        this.move(b, dx * beh.speed * dt, 0);
        if (b.onGround && (this.down("ArrowUp") || this.down("Space"))) b.vy = -beh.jump;
        b.vy = Math.min(b.vy + beh.gravity * dt, 1400);
        const falling = b.vy > 0;
        const hit = this.move(b, 0, b.vy * dt);
        b.onGround = hit && falling;
        if (hit) b.vy = 0;
      } else if (beh.kind === "patrol") {
        const step = beh.speed * dt * b.dir;
        const hit = beh.axis === "x" ? this.move(b, step, 0) : this.move(b, 0, step);
        const away = beh.axis === "x" ? b.x - b.home.x : b.y - b.home.y;
        if (hit || (b.dir > 0 && away >= beh.distance) || (b.dir < 0 && away <= 0)) b.dir = b.dir > 0 ? -1 : 1;
      } else if (beh.kind === "chase") {
        const targets = this.bodies.filter((t) => !t.dead && t.kind.id === beh.target && t !== b);
        if (!targets.length) continue;
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const t = targets.reduce((best, t) => (Math.hypot(t.x - cx, t.y - cy) < Math.hypot(best.x - cx, best.y - cy) ? t : best));
        const dx = t.x + t.w / 2 - cx;
        const dy = t.y + t.h / 2 - cy;
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          this.move(b, (dx / len) * beh.speed * dt, 0);
          this.move(b, 0, (dy / len) * beh.speed * dt);
        }
      }
    }
    if (has("bounds")) {
      const c = this.camera;
      b.x = Math.max(c.x, Math.min(c.x + this.scene.w - b.w, b.x));
      // a platformer hero may fall down through the bottom edge — «ушёл за край» catches it
      if (b.y < c.y) b.y = c.y;
      if (!has("platformer") && b.y > c.y + this.scene.h - b.h) b.y = c.y + this.scene.h - b.h;
    }
  }

  // ── events ──

  private alive = (kind: string) => this.bodies.filter((b) => !b.dead && b.kind.id === kind);

  private check(c: Condition, picked: Picked, eventId: string, index: number): boolean {
    switch (c.k) {
      case "start":
        return this.frame === 0;
      case "key":
        return this.down(c.key);
      case "collide": {
        const as = picked.get(c.a) ? [...picked.get(c.a)!] : this.alive(c.a);
        const bs = picked.get(c.b) ? [...picked.get(c.b)!] : this.alive(c.b);
        const pa = new Set<Body>();
        const pb = new Set<Body>();
        for (const a of as) for (const b of bs) if (a !== b && touching(a, b)) (pa.add(a), pb.add(b));
        if (!pa.size) return false;
        if (c.a === c.b) picked.set(c.a, new Set([...pa, ...pb]));
        else (picked.set(c.a, pa), picked.set(c.b, pb));
        return true;
      }
      case "click": {
        const hit = new Set(this.alive(c.obj).filter((b) => this.clicks.some((p) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h)));
        if (!hit.size) return false;
        picked.set(c.obj, hit);
        return true;
      }
      case "count":
        return compare(this.alive(c.obj).length, c.op, c.value);
      case "var":
        return compare(this.vars[c.name] ?? 0, c.op, c.value);
      case "timer": {
        const key = `${eventId}:${index}`;
        const last = this.timers.get(key) ?? 0;
        if (this.time - last >= c.seconds) {
          this.timers.set(key, this.time);
          return true;
        }
        return false;
      }
      case "outside": {
        const { x, y } = this.camera;
        const out = new Set(this.alive(c.obj).filter((b) => b.x + b.w < x || b.x > x + this.scene.w || b.y + b.h < y || b.y > y + this.scene.h));
        if (!out.size) return false;
        picked.set(c.obj, out);
        return true;
      }
      case "pos": {
        const ok = new Set(this.alive(c.obj).filter((b) => compare(Math.round(c.axis === "x" ? b.x : b.y), c.op, c.value)));
        if (!ok.size) return false;
        picked.set(c.obj, ok);
        return true;
      }
    }
  }

  private run(a: Action, picked: Picked) {
    const targets = (obj: string) => (picked.get(obj) ? [...picked.get(obj)!] : this.alive(obj));
    switch (a.k) {
      case "delete":
        targets(a.obj).forEach((b) => (b.dead = true));
        break;
      case "create":
        this.spawn(a.obj, a.x, a.y);
        break;
      case "teleport":
        targets(a.obj).forEach((b) => {
          b.x = a.x;
          b.y = a.y;
          b.vy = 0;
        });
        break;
      case "var": {
        const v = this.vars[a.name] ?? 0;
        this.vars[a.name] = a.mode === "set" ? a.value : a.mode === "add" ? v + a.value : v - a.value;
        break;
      }
      case "text":
        this.message = this.fill(a.text);
        break;
      case "stop":
        this.stopped = this.fill(a.text);
        break;
      case "scene":
        this.pendingScene = a.scene;
        break;
      case "restartScene":
        this.pendingScene = this.scene.id;
        break;
      case "camera":
        this.follow = { obj: a.obj, smooth: a.smooth };
        this.aim(false);
        break;
      case "restartGame":
        this.vars = Object.fromEntries(this.project.variables.map((v) => [v.name, v.value]));
        this.pendingScene = this.project.scenes[0].id;
        break;
    }
  }

  /** Puts the followed object in the middle of the screen; smoothly — a bit closer every frame. */
  private aim(smooth: boolean, dt = 0) {
    const f = this.follow;
    if (!f) return;
    const t = this.alive(f.obj)[0];
    if (!t) return;
    const x = t.x + t.w / 2 - this.scene.w / 2;
    const y = t.y + t.h / 2 - this.scene.h / 2;
    const k = smooth && f.smooth ? Math.min(1, dt * 6) : 1;
    this.camera.x += (x - this.camera.x) * k;
    this.camera.y += (y - this.camera.y) * k;
  }

  /** «Очки: {Очки}» → «Очки: 3». */
  private fill = (text: string) => text.replace(/\{([^}]+)\}/g, (_, name: string) => String(this.vars[name.trim()] ?? 0));

  private step(dt: number) {
    for (const b of this.bodies) if (!b.dead) this.behave(b, dt);
    this.time += dt;
    this.firedEvent = null;
    for (const ev of this.scene.events) {
      if (!ev.actions.length) continue;
      const picked: Picked = new Map();
      // every condition must be true (they are joined with «и»); an event without conditions runs every frame
      const ok = ev.conditions.every((c, i) => this.check(c, picked, ev.id, i));
      if (!ok) continue;
      this.firedEvent = ev.id;
      for (const a of ev.actions) this.run(a, picked);
      if (this.pendingScene || this.stopped) break;
    }
    this.bodies = this.bodies.filter((b) => !b.dead);
    this.aim(true, dt);
    this.clicks = [];
    this.frame++;
    if (this.pendingScene) {
      const id = this.pendingScene;
      this.pendingScene = null;
      this.loadScene(id);
    }
  }

  // ── drawing ──

  private draw() {
    const { ctx, scene } = this;
    ctx.fillStyle = scene.bg;
    ctx.fillRect(0, 0, scene.w, scene.h);
    ctx.save();
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
    for (const b of this.bodies) {
      // only what is on the screen is drawn
      if (b.x + b.w < this.camera.x || b.x > this.camera.x + scene.w || b.y + b.h < this.camera.y || b.y > this.camera.y + scene.h) continue;
      const look = b.kind.look;
      if (isColor(look)) {
        ctx.fillStyle = look;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        ctx.fill();
      } else if (isImage(look)) {
        const img = this.images.get(b.kind.id);
        if (img?.complete) ctx.drawImage(img, b.x, b.y, b.w, b.h);
      } else {
        ctx.font = `${Math.round(Math.min(b.w, b.h) * 0.9)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(look, b.x + b.w / 2, b.y + b.h / 2 + 2);
      }
    }
    ctx.restore();
  }
}
