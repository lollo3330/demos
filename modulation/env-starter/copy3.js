

const settings = Object.freeze({
  thing: /** @type HTMLElement */(document.querySelector(`#thing`)),


  minHoldMs: 0,      // shortest press
  maxHoldMs: 2000,   // longest press

  maxScale: 3.0,     // final ball size for a very short press
  minScale: 0.1,    // final ball size for a very long press

  maxGrowMs: 80,   // time to reach final size for a short press
  minGrowMs: 80,    // time to reach final size for a long press 

  pauseMs: 500,       // how long to hold at final size before resetting
  resetMs: 3000,        // how long the shrink fo reset takes

  curvePower: 8       // how fast it goes from big to small depending on how long press
});

let keydownAt = 0;
   
/**
 * Curves ratio so shrinking accelerates as press gets longer
 * @param {number} ratio
 * @param {number} power
 * @returns {number}
 */
const easeIn = (ratio, power) => Math.pow(ratio, power);

/**
 * Maps a 0..1 ratio to a value between a and b (a at ratio 0, b at ratio 1)
 * @param {number} a
 * @param {number} b
 * @param {number} ratio
 * @returns {number}
 */

const lerp = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ ratio) => a + (b - a) * ratio;

function setup() {
  const { thing } = settings;
  console.log(`setup running, thing is:`, thing);

  if (!thing) {
    console.error(`#thing element not found in the DOM!`);
    return;
  }

  // Ball starts invisible - nothing exists yet
  thing.style.scale = `0%`;
  thing.style.transition = `scale 0ms linear`;

  document.addEventListener(`keydown`, (event) => {
    if (event.code !== `Space`) return;
    event.preventDefault(); // stop the page from scrolling on spacebar
    console.log(`keydown`, event.code);
    if (event.repeat) return; // ignore key-repeat while held
    keydownAt = performance.now();
  });

  document.addEventListener(`keyup`, (event) => {
    if (event.code !== `Space`) return;
    event.preventDefault();
    console.log(`keyup`, event.code);

    const heldMs = performance.now() - keydownAt;
    const clamped = Math.min(Math.max(heldMs, settings.minHoldMs), settings.maxHoldMs);
    const ratio = (clamped - settings.minHoldMs) / (settings.maxHoldMs - settings.minHoldMs);
    const curvedRatio = easeIn(ratio, settings.curvePower); 

    // Longer hold -> smaller final ball
    const finalScale = lerp(settings.maxScale, settings.minScale, ratio);
    // Longer hold -> shorter grow time -> appears faster
    const growMs = lerp(settings.maxGrowMs, settings.minGrowMs, ratio);

    console.log(`Held ${heldMs.toFixed(0)}ms -> scale ${finalScale.toFixed(2)}, grow ${growMs.toFixed(0)}ms`);

    // Set how long the transition to the new size should take
    thing.style.transition = `scale ${growMs}ms ease-out`;
    // Force the browser to register the new transition before changing scale
    void thing.offsetWidth;
    // Set the size itself - this is the point where the ball "appears"
    thing.style.scale = `${finalScale * 100}%`;
    thing.style.opacity = `1`;


     // After it's finished growing (plus a little pause to see it), shrink back to 0
  // so the ball "resets" and you can press spacebar again
  setTimeout(() => {
  // Slow, gentle easing that feels like it's settling rather than snapping away
  thing.style.transition = `scale ${settings.resetMs}ms ease-out, opacity ${settings.resetMs}ms ease-out`;
  void thing.offsetWidth;
  thing.style.scale = `0%`;
  thing.style.opacity = `0`;
}, growMs + settings.pauseMs);
  });
}

setup();