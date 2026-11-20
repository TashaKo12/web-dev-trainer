import { instSize, isColor, isImage, kindType, type Action, type Condition, type Instance, type KeyName, type ObjectKind, type Op, type Project, type Scene } from "./model";

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
  /** where it stood when the scene began: «Вернуть на чекпоинт» goes here if no checkpoint was saved */
  start: { x: number; y: number };
  /** where it looks (the last way it moved): shots fly this way */
  face: { x: number; y: number };
  /** a shot: flies by itself with this speed until it hits a wall or leaves the screen far behind */
  fly: { x: number; y: number } | null;
  /** seconds until the weapon can shoot again */
  reload: number;
  dir: 1 | -1;
  dead: boolean;
  /** drawn over the ones with a smaller z */
  z: number;
  /** text and button: the words now (the action «Изменить текст» changes them) */
  text: string;
  /** stays on the screen when the camera moves: x, y are screen coordinates */
  fixed: boolean;
  /** which animation plays and for how long */
  anim: number;
  animTime: number;
};

type Picked = Map<string, Set<Body>>;

const KEY_CODES: Record<KeyName, string[]> = {
  ArrowLeft: ["ArrowLeft", "KeyA"],
  ArrowRight: ["ArrowRight", "KeyD"],
  ArrowUp: ["ArrowUp", "KeyW"],
  ArrowDown: ["ArrowDown", "KeyS"],
  Space: ["Space"],
  Enter: ["Enter", "NumpadEnter"],
  KeyX: ["KeyX"],
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
  /** clicks in screen coordinates (objects fixed on the screen use them as they are, the others add the camera) */
  private clicks: { x: number; y: number }[] = [];
  /** tiled sprites: one tile, ready to be repeated */
  private tiles = new Map<string, CanvasPattern | null>();
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
  /** saved return points: object kind → place (they belong to one scene) */
  private checkpoints = new Map<string, { x: number; y: number; scene: string }>();

  constructor(project: Project, canvas: HTMLCanvasElement, onStatus: (s: GameStatus) => void) {
    this.project = project;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.onStatus = onStatus;
    // every picture the game can show — the object's own and every animation frame — loaded once
    for (const o of project.objects)
      for (const look of [o.look, ...(o.animations ?? []).flatMap((a) => a.frames)])
        if (isImage(look) && !this.images.has(look)) {
          const img = new Image();
          img.src = look;
          this.images.set(look, img);
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
    this.clicks.push({ x: ((e.clientX - r.left) / r.width) * this.scene.w, y: ((e.clientY - r.top) / r.height) * this.scene.h });
  };

  private kindOf = (id: string) => this.project.objects.find((o) => o.id === id);

  private spawn(kindId: string, x: number, y: number, inst?: Instance) {
    const kind = this.kindOf(kindId);
    if (!kind) return;
    const { w, h } = instSize(kind, inst ?? {});
    const t = kindType(kind);
    this.bodies.push({
      id: this.nextId++,
      kind,
      x,
      y,
      w,
      h,
      vy: 0,
      onGround: false,
      home: { x, y },
      start: { x, y },
      face: { x: 1, y: 0 },
      fly: null,
      reload: 0,
      dir: 1,
      dead: false,
      z: inst?.z ?? 0,
      text: kind.text ?? "",
      fixed: (t === "text" || t === "button") && !!kind.fixed,
      anim: 0,
      animTime: 0,
    });
  }

  private loadScene(id: string) {
    const scene = this.project.scenes.find((s) => s.id === id) ?? this.project.scenes[0];
    this.scene = scene;
    this.canvas.width = scene.w;
    this.canvas.height = scene.h;
    this.bodies = [];
    for (const i of scene.instances) this.spawn(i.kind, i.x, i.y, i);
    this.message = null;
    this.stopped = null;
    this.frame = 0;
    this.time = 0;
    this.timers.clear();
    this.camera = { x: 0, y: 0 };
    this.follow = null;
    // checkpoints of another scene are forgotten; restarting the same scene keeps them
    for (const [k, c] of this.checkpoints) if (c.scene !== scene.id) this.checkpoints.delete(k);
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
  private solids = (self: Body) => this.bodies.filter((b) => b !== self && !b.dead && !b.fixed && b.kind.behaviors.some((x) => x.kind === "solid"));

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
        if (dx || dy) b.face = { x: dx / len, y: dy / len };
        this.move(b, (dx / len) * beh.speed * dt, 0);
        this.move(b, 0, (dy / len) * beh.speed * dt);
      } else if (beh.kind === "platformer") {
        const dx = (this.down("ArrowRight") ? 1 : 0) - (this.down("ArrowLeft") ? 1 : 0);
        if (dx) b.face = { x: dx, y: 0 };
        this.move(b, dx * beh.speed * dt, 0);
        if (b.onGround && (this.down("ArrowUp") || this.down("Space"))) b.vy = -beh.jump;
        b.vy = Math.min(b.vy + beh.gravity * dt, 1400);
        const falling = b.vy > 0;
        const hit = this.move(b, 0, b.vy * dt);
        b.onGround = hit && falling;
        if (hit) b.vy = 0;
      } else if (beh.kind === "weapon") {
        b.reload -= dt;
        if (this.down(beh.key) && b.reload <= 0) {
          this.fire(b, beh.bullet, b.face, beh.speed);
          b.reload = 1 / Math.max(0.5, beh.rate);
        }
      } else if (beh.kind === "patrol") {
        const step = beh.speed * dt * b.dir;
        if (beh.axis === "x") b.face = { x: b.dir, y: 0 };
        else b.face = { x: 0, y: b.dir };
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
        // things fixed on the screen (texts, buttons) are not in the world and touch nothing
        const as = (picked.get(c.a) ? [...picked.get(c.a)!] : this.alive(c.a)).filter((b) => !b.fixed);
        const bs = (picked.get(c.b) ? [...picked.get(c.b)!] : this.alive(c.b)).filter((b) => !b.fixed);
        const pa = new Set<Body>();
        const pb = new Set<Body>();
        for (const a of as) for (const b of bs) if (a !== b && touching(a, b)) (pa.add(a), pb.add(b));
        if (!pa.size) return false;
        if (c.a === c.b) picked.set(c.a, new Set([...pa, ...pb]));
        else (picked.set(c.a, pa), picked.set(c.b, pb));
        return true;
      }
      case "click": {
        const hit = new Set(
          this.alive(c.obj).filter((b) =>
            this.clicks.some((p) => {
              const x = b.fixed ? p.x : p.x + this.camera.x;
              const y = b.fixed ? p.y : p.y + this.camera.y;
              return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
            }),
          ),
        );
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
        const out = new Set(this.alive(c.obj).filter((b) => !b.fixed && (b.x + b.w < x || b.x > x + this.scene.w || b.y + b.h < y || b.y > y + this.scene.h)));
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
      case "anim":
        targets(a.obj).forEach((b) => {
          const i = (b.kind.animations ?? []).findIndex((x) => x.name === a.name);
          // switching to the animation that already plays does not restart it
          if (i >= 0 && i !== b.anim) {
            b.anim = i;
            b.animTime = 0;
          }
        });
        break;
      case "settext":
        targets(a.obj).forEach((b) => (b.text = a.text));
        break;
      case "checkpoint": {
        const who = targets(a.obj)[0];
        if (!who) break;
        // stand on the checkpoint: in the middle of it, feet at its bottom
        const at = a.at && a.at !== a.obj ? targets(a.at)[0] : undefined;
        const x = at ? at.x + at.w / 2 - who.w / 2 : who.x;
        const y = at ? at.y + at.h - who.h : who.y;
        const old = this.checkpoints.get(a.obj);
        const fresh = !old || Math.abs(old.x - x) > 1 || Math.abs(old.y - y) > 1;
        this.checkpoints.set(a.obj, { x, y, scene: this.scene.id });
        if (fresh && a.say.trim()) this.message = this.fill(a.say);
        break;
      }
      case "shoot": {
        const dirs = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };
        targets(a.obj).forEach((b) => this.fire(b, a.bullet, a.dir === "face" ? b.face : dirs[a.dir], a.speed));
        break;
      }
      case "respawn":
        targets(a.obj).forEach((b) => {
          const c = this.checkpoints.get(b.kind.id);
          const p = c && c.scene === this.scene.id ? c : b.start;
          b.x = p.x;
          b.y = p.y;
          b.vy = 0;
          b.onGround = false;
        });
        this.aim(false);
        break;
      case "restartGame":
        this.checkpoints.clear();
        this.vars = Object.fromEntries(this.project.variables.map((v) => [v.name, v.value]));
        this.pendingScene = this.project.scenes[0].id;
        break;
    }
  }

  /** A shot leaves the shooter from its side that looks the way of the shot. */
  private fire(from: Body, bulletKind: string, dir: { x: number; y: number }, speed: number) {
    const kind = this.kindOf(bulletKind);
    if (!kind || bulletKind === from.kind.id) return;
    const len = Math.hypot(dir.x, dir.y) || 1;
    const d = { x: dir.x / len, y: dir.y / len };
    const cx = from.x + from.w / 2 + d.x * (from.w / 2 + kind.w / 2 + 2);
    const cy = from.y + from.h / 2 + d.y * (from.h / 2 + kind.h / 2 + 2);
    this.spawn(bulletKind, cx - kind.w / 2, cy - kind.h / 2);
    const shot = this.bodies[this.bodies.length - 1];
    shot.fly = { x: d.x * speed, y: d.y * speed };
    shot.face = d;
    shot.z = from.z;
  }

  /** A shot flies straight; a wall stops it, and it disappears far outside the screen. */
  private flyShot(b: Body, dt: number) {
    const f = b.fly!;
    if (this.move(b, f.x * dt, 0) || this.move(b, 0, f.y * dt)) b.dead = true;
    const c = this.camera;
    const m = 300;
    if (b.x + b.w < c.x - m || b.x > c.x + this.scene.w + m || b.y + b.h < c.y - m || b.y > c.y + this.scene.h + m) b.dead = true;
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
    for (const b of this.bodies)
      if (!b.dead) {
        if (b.fly) this.flyShot(b, dt);
        else this.behave(b, dt);
        b.animTime += dt;
      }
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
    // smaller z first, so bigger z ends up on top; the world first, then what is fixed on the screen
    const order = [...this.bodies].sort((a, b) => Number(a.fixed) - Number(b.fixed) || a.z - b.z);
    for (const b of order) {
      const cx = b.fixed ? 0 : Math.round(this.camera.x);
      const cy = b.fixed ? 0 : Math.round(this.camera.y);
      // only what is on the screen is drawn
      if (b.x + b.w < cx || b.x > cx + scene.w || b.y + b.h < cy || b.y > cy + scene.h) continue;
      ctx.save();
      ctx.translate(-cx, -cy);
      this.drawBody(b);
      ctx.restore();
    }
  }

  private drawBody(b: Body) {
    const { ctx } = this;
    const t = kindType(b.kind);
    if (t === "text") {
      const size = b.kind.fontSize ?? 24;
      ctx.font = `700 ${size}px "Nunito Sans", "Segoe UI Emoji", sans-serif`;
      ctx.fillStyle = b.kind.color ?? "#1e293b";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      this.fill(b.text).split("\n").forEach((line, i) => ctx.fillText(line, b.x, b.y + i * size * 1.2));
      return;
    }
    if (t === "button") {
      ctx.fillStyle = b.kind.bg ?? "#4d16c9";
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 12);
      ctx.fill();
      ctx.font = `700 ${b.kind.fontSize ?? 22}px "Nunito Sans", "Segoe UI Emoji", sans-serif`;
      ctx.fillStyle = b.kind.color ?? "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.fill(b.text), b.x + b.w / 2, b.y + b.h / 2 + 1);
      return;
    }
    if (t === "tiled") {
      const pattern = this.tile(b.kind);
      if (!pattern) return;
      ctx.translate(b.x, b.y);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, b.w, b.h);
      return;
    }
    const look = this.lookOf(b);
    if (isColor(look)) {
      ctx.fillStyle = look;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fill();
    } else if (isImage(look)) {
      const img = this.images.get(look);
      if (img?.complete) ctx.drawImage(img, b.x, b.y, b.w, b.h);
    } else {
      ctx.font = `${Math.round(Math.min(b.w, b.h) * 0.9)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(look, b.x + b.w / 2, b.y + b.h / 2 + 2);
    }
  }

  /** The picture of a sprite right now: the current frame of its animation, or its picture. */
  private lookOf(b: Body) {
    const a = b.kind.animations?.[b.anim];
    if (!a || !a.frames.length) return b.kind.look;
    const n = Math.floor(b.animTime * Math.max(0.1, a.fps));
    return a.frames[a.loop ? n % a.frames.length : Math.min(n, a.frames.length - 1)];
  }

  /** One tile of a tiled sprite drawn once (picture, emoji or colour) and turned into a repeating pattern. */
  private tile(kind: ObjectKind): CanvasPattern | null {
    if (this.tiles.has(kind.id)) return this.tiles.get(kind.id)!;
    const img = this.images.get(kind.look);
    if (isImage(kind.look) && !img?.complete) return null; // the picture is still loading
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(kind.w));
    c.height = Math.max(1, Math.round(kind.h));
    const g = c.getContext("2d")!;
    if (isColor(kind.look)) {
      g.fillStyle = kind.look;
      g.fillRect(0, 0, c.width, c.height);
    } else if (img) g.drawImage(img, 0, 0, c.width, c.height);
    else {
      g.font = `${Math.round(Math.min(c.width, c.height) * 0.9)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(kind.look, c.width / 2, c.height / 2 + 1);
    }
    const p = this.ctx.createPattern(c, "repeat");
    this.tiles.set(kind.id, p);
    return p;
  }
}
