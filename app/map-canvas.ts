export function drawAtlasPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = "#fbf8f1";
  ctx.fillRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(width * 0.72, height * 0.2, 0, width * 0.72, height * 0.2, width * 0.72);
  wash.addColorStop(0, "rgba(231, 205, 176, .22)");
  wash.addColorStop(0.48, "rgba(244, 233, 218, .1)");
  wash.addColorStop(1, "rgba(255, 253, 248, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = "rgba(119, 99, 88, .11)";
  ctx.lineWidth = Math.max(1, width / 1600);
  const grid = Math.max(70, Math.round(width / 14));
  for (let x = -grid; x <= width + grid; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + width * 0.035, height * 0.5, x, height);
    ctx.stroke();
  }
  for (let y = -grid; y <= height + grid; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(width * 0.5, y - height * 0.025, width, y);
    ctx.stroke();
  }
  ctx.restore();

  const contours = [
    { x: 0.2, y: 0.34, rx: 0.25, ry: 0.2, rotation: -0.12 },
    { x: 0.73, y: 0.32, rx: 0.3, ry: 0.23, rotation: 0.1 },
    { x: 0.58, y: 0.82, rx: 0.22, ry: 0.16, rotation: -0.08 },
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(173, 126, 96, .16)";
  ctx.lineWidth = Math.max(1.25, width / 1350);
  for (const contour of contours) {
    for (let ring = 0; ring < 5; ring += 1) {
      const scale = 1 - ring * 0.12;
      ctx.beginPath();
      ctx.ellipse(
        width * contour.x,
        height * contour.y,
        width * contour.rx * scale,
        height * contour.ry * scale,
        contour.rotation + ring * 0.012,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}
