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
      // capture the pointer so we always get its pointerup, even if the finger
      // is released over another element (mute button, overlay). Without this,
      // releasing off-canvas leaves `down` stuck true → runaway auto-fire.
      try { canvas.setPointerCapture(e.pointerId); } catch { /* older browsers */ }
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

    // release anywhere ends the hold. Listen on window (not just canvas) so a
    // release over the mute button / overlay still counts — otherwise `down`
    // could stick true and auto-fire forever. pointer capture (above) covers
    // real dragging; the window listener is the reliable catch-all.
    const release = () => {
      this.down = false;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

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
