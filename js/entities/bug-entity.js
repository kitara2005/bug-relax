// A single bug: spawn-in → wander (soft sinusoidal drift) → escape off screen.

const SPAWN_DURATION = 0.45; // seconds of scale-in
const ESCAPE_ACCEL = 260;    // px/s² while fleeing
const STEER_MARGIN = 70;     // px from edge where wandering bugs turn back

export class BugEntity {
  constructor(type, x, y, hpBonus = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.maxHp = type.hp + hpBonus;
    this.hp = this.maxHp;

    this.state = 'spawning'; // 'spawning' | 'wander' | 'escaping' | 'gone'
    this.escaped = false;    // true when it left the screen alive
    this.age = 0;
    this.scale = 0;
    this.flashT = 0;         // hit-flash timer

    const [minLife, maxLife] = type.lifetime;
    this.lifetime = minLife + Math.random() * (maxLife - minLife);

    this.heading = Math.random() * Math.PI * 2;
    this.phase = Math.random() * Math.PI * 2; // desync wobble between bugs
    this.speedJitter = 0.85 + Math.random() * 0.3;
    this.escapeSpeed = 0;
  }

  get hitRadius() {
    // generous touch target for phones
    return (this.type.size / 2) * 1.3;
  }

  /** Visual bob offset — drawing only, does not affect hit position. */
  get bobY() {
    return Math.sin(this.age * 2.2 + this.phase) * 5;
  }

  update(dt, speedMult, bounds) {
    this.age += dt;
    this.flashT = Math.max(0, this.flashT - dt);

    if (this.state === 'spawning') {
      this.scale = Math.min(this.age / SPAWN_DURATION, 1);
      if (this.scale >= 1) this.state = 'wander';
      return;
    }

    if (this.state === 'wander') {
      // meandering: heading slowly oscillates so paths curve organically
      this.heading += Math.sin(this.age * 0.7 + this.phase) * 0.7 * dt;
      this.steerAwayFromEdges(bounds, dt);

      const speed = this.type.speed * speedMult * this.speedJitter;
      this.x += Math.cos(this.heading) * speed * dt;
      this.y += Math.sin(this.heading) * speed * dt;

      if (this.age >= this.lifetime) {
        this.state = 'escaping';
        this.heading = this.nearestEdgeAngle(bounds);
        this.escapeSpeed = this.type.speed * speedMult;
      }
      return;
    }

    if (this.state === 'escaping') {
      this.escapeSpeed += ESCAPE_ACCEL * dt;
      this.x += Math.cos(this.heading) * this.escapeSpeed * dt;
      this.y += Math.sin(this.heading) * this.escapeSpeed * dt;

      const r = this.type.size;
      if (this.x < -r || this.x > bounds.w + r || this.y < -r || this.y > bounds.h + r) {
        this.state = 'gone';
        this.escaped = true;
      }
    }
  }

  /** Gently turn wandering bugs back toward the play area near edges. */
  steerAwayFromEdges(bounds, dt) {
    const targetX = bounds.w / 2;
    const targetY = bounds.h / 2;
    const nearEdge =
      this.x < STEER_MARGIN || this.x > bounds.w - STEER_MARGIN ||
      this.y < STEER_MARGIN || this.y > bounds.h - STEER_MARGIN;
    if (!nearEdge) return;

    const toCenter = Math.atan2(targetY - this.y, targetX - this.x);
    let diff = toCenter - this.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.heading += diff * Math.min(3 * dt, 1);
  }

  nearestEdgeAngle(bounds) {
    const dists = [
      { angle: Math.PI, d: this.x },                 // left
      { angle: 0, d: bounds.w - this.x },            // right
      { angle: -Math.PI / 2, d: this.y },            // top
      { angle: Math.PI / 2, d: bounds.h - this.y },  // bottom
    ];
    dists.sort((a, b) => a.d - b.d);
    return dists[0].angle;
  }

  /** Apply weapon damage; returns true when the bug dies. */
  takeDamage(amount) {
    this.hp -= amount;
    this.flashT = 0.15;
    if (this.hp <= 0) {
      this.state = 'gone';
      return true;
    }
    return false;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.hitRadius * this.hitRadius;
  }
}
