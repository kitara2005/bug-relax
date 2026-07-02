// Unified mouse/touch input on the canvas. Coordinates in CSS px.

export class PointerInput {
  constructor(canvas, { onShoot, onMove }) {
    this.x = null; // last known pointer position (for the glow cursor)
    this.y = null;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const { x, y } = this.toCanvas(canvas, e);
      this.x = x;
      this.y = y;
      onShoot(x, y);
    });

    canvas.addEventListener('pointermove', (e) => {
      const { x, y } = this.toCanvas(canvas, e);
      this.x = x;
      this.y = y;
      if (onMove) onMove(x, y);
    });

    // hide the glow cursor when touch ends (no hover on phones)
    canvas.addEventListener('pointerleave', () => {
      this.x = null;
      this.y = null;
    });
  }

  toCanvas(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}
