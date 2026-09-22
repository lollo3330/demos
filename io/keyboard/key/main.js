const circle = document.getElementById("circle");

let currentSize = 100;
let targetSize = 100;

let pressStartTime = 0;
let isHolding = false;

function animate() {

  if (isHolding) {
    const holdTime = performance.now() - pressStartTime;

    // Short press = big reaction
    // Long press = tiny reaction
    const reaction = 250 * Math.exp(-holdTime / 150);

    targetSize = 100 + reaction;

    // Slowly shrink while holding
    targetSize -= 0.3;

  } else {
    // Slowly return to normal after release
    targetSize += (100 - targetSize) * 0.01;
  }

  currentSize += (targetSize - currentSize) * 0.1;

  if (circle) {
    circle.style.width = `${currentSize}px`;
    circle.style.height = `${currentSize}px`;
  }

  requestAnimationFrame(animate);
}


document.addEventListener("keydown", (event) => {

  if (event.code !== "Space") return;
  if (event.repeat) return;

  pressStartTime = performance.now();
  isHolding = true;
});


document.addEventListener("keyup", (event) => {

  if (event.code !== "Space") return;

  isHolding = false;
});


animate();