const circle = document.getElementById("circle");

let currentSize = 100;
let targetSize = 100;

let isHolding = false;
let pressStartTime = 0;
let growthSpeed = 0;

function animate() {

  // Move toward target size
  currentSize += (targetSize - currentSize) * 0.1;

  if (circle) {
    circle.style.width = `${currentSize}px`;
    circle.style.height = `${currentSize}px`;
  }

  // While holding the spacebar
  if (isHolding) {

    const holdTime = performance.now() - pressStartTime;

    // Longer hold = slower growth
    growthSpeed = 3 / (1 + holdTime / 300);

    targetSize += growthSpeed;
    
    // Maximum size
    if (targetSize > 400) {
      targetSize = 400;
    }
  }

  // Slowly return to normal after release
  if (!isHolding && targetSize > 100) {
    targetSize += (100 - targetSize) * 0.01;
  }

  requestAnimationFrame(animate);
}


document.addEventListener("keydown", (event) => {

  if (event.code !== "Space") return;

  if (event.repeat) return;

  isHolding = true;
  pressStartTime = performance.now();

});


document.addEventListener("keyup", (event) => {

  if (event.code !== "Space") return;

  isHolding = false;

});


animate();