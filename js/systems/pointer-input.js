// Unified mouse/touch input on the canvas. Coordinates in CSS px.
// Supports hold-to-sweep: while the pointer is held down, `down` stays true
// and the game auto-fires at the pointer position (cooldown-gated elsewhere).

export class PointerInput {
  constructor(canvas, { onShoot, onMove }) {
    this.x = null; // last known pointer position (for the glow cursor)
    this.y = null;
    this.down = false; // finger/button currently held

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const { x, y } = this.toCanvas(canvas, e);
      this.x = x;
      this.y = y;
      this.down = true;
      onShoot(x, y);
    });

    canvas.addEventListener('pointermove', (e) => {
      const { x, y } = this.toCanvas(canvas, e);
      this.x = x;
      this.y = y;
      if (onMove) onMove(x, y);
    });

    const release = () => {
      this.down = false;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    // hide the glow cursor when touch ends (no hover on phones)
    canvas.addEventListener('pointerleave', () => {
      this.down = false;
      this.x = null;
      this.y = null;
    });
  }

  toCanvas(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
