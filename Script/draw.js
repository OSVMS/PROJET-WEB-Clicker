window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const carColors = [];
  const trackScale = 170;

  function getTrackCenter() {
    const { canvas } = Game.refs;
    return { x: canvas.width / 2, y: canvas.height / 2 + 10 };
  }

  function lemniscatePoint(angle) {
    const center = getTrackCenter();
    const denom = 1 + Math.sin(angle) ** 2;
    const x = center.x + (trackScale * Math.cos(angle)) / denom;
    const y = center.y + (trackScale * Math.sin(angle) * Math.cos(angle)) / denom;
    return { x, y };
  }

  function getHeading(angle) {
    const p1 = lemniscatePoint(angle);
    const p2 = lemniscatePoint(angle + 0.01);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  function drawFinishLines() {
    const { ctx } = Game.refs;
    const count = Game.calc.getFinishLineCount();
    const spacing = (Math.PI * 2) / count;

    ctx.save();
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';

    for (let i = 0; i < count; i += 1) {
      const finishAngle = i * spacing;
      const p = lemniscatePoint(finishAngle);
      const tangent = getHeading(finishAngle);
      const normal = tangent + Math.PI / 2;
      const halfLength = 14;

      const x1 = p.x + Math.cos(normal) * halfLength;
      const y1 = p.y + Math.sin(normal) * halfLength;
      const x2 = p.x - Math.cos(normal) * halfLength;
      const y2 = p.y - Math.sin(normal) * halfLength;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawTrack() {
    const { ctx } = Game.refs;

    ctx.save();
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#c8c0b3';
    ctx.lineCap = 'round';
    ctx.beginPath();

    for (let i = 0; i <= 720; i += 1) {
      const a = (i / 720) * Math.PI * 2;
      const p = lemniscatePoint(a);
      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#7f7466';
    ctx.setLineDash([10, 8]);
    ctx.stroke();

    drawFinishLines();
    ctx.restore();
  }

  function generateRandomCarColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 55 + Math.floor(Math.random() * 25);
    const lightness = 28 + Math.floor(Math.random() * 18);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  function ensureCarColors(count) {
    while (carColors.length < count) {
      carColors.push(generateRandomCarColor());
    }
  }

  function drawCar(point, angle, bodyColor) {
    const { ctx } = Game.refs;

    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(-13, -8, 26, 16);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-7, -6, 14, 6);

    ctx.fillStyle = '#1f2a2e';
    ctx.beginPath();
    ctx.arc(-8, 9, 4, 0, Math.PI * 2);
    ctx.arc(8, 9, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCars(cars, t, phaseStep) {
    ensureCarColors(cars);

    for (let i = 0; i < cars; i += 1) {
      const carT = (t + i * phaseStep) % (Math.PI * 2);
      const carPos = lemniscatePoint(carT);
      const heading = getHeading(carT);
      drawCar(carPos, heading, carColors[i]);
    }
  }

  Game.draw = {
    drawTrack,
    drawCars,
  };
})();
