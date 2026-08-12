const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
let scale = 1;
let pan = { x: 0, y: 0 };

const delta = -0.5; // Zoom in
const prevScale = scale;
const newScale = Math.min(Math.max(MIN_SCALE, prevScale * Math.exp(delta)), MAX_SCALE);
const f = newScale / prevScale;

const mouseX = 100;
const mouseY = 100;

pan = {
  x: mouseX - (mouseX - pan.x) * f,
  y: mouseY - (mouseY - pan.y) * f,
};
scale = newScale;
console.log("Scale:", scale.toFixed(2), "Pan:", pan.x.toFixed(2), pan.y.toFixed(2));
console.log("World point 100,100 at screen:", (100 * scale + pan.x).toFixed(2));

const delta2 = -0.5;
const prevScale2 = scale;
const newScale2 = Math.min(Math.max(MIN_SCALE, prevScale2 * Math.exp(delta2)), MAX_SCALE);
const f2 = newScale2 / prevScale2;

pan = {
  x: mouseX - (mouseX - pan.x) * f2,
  y: mouseY - (mouseY - pan.y) * f2,
};
scale = newScale2;
console.log("Scale:", scale.toFixed(2), "Pan:", pan.x.toFixed(2), pan.y.toFixed(2));
console.log("World point 100,100 at screen:", (100 * scale + pan.x).toFixed(2));
