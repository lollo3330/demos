console.log(`script loaded`);

const settings = Object.freeze({
  idleColor: 'hsl(235, 55%, 10%)', // must match the 0% keyframe stop in index.html

  maxHoldMs: 2000,
  growMs: 90,
  pauseMs: 450,
  resetMs: 1400,

  minScale: 0.4,
  maxScale: 3.0,
  curvePower: 2, // >1 = wind builds slowly then rushes near the end of the hold
});

const thing = /** @type {HTMLElement} */ (document.querySelector(`#thing`));
const body = document.body;

/** @param {number} ratio @param {number} power @returns {number} */
const easeIn = (ratio, power) => Math.pow(ratio, power);

/** @param {number} a @param {number} b @param {number} ratio @returns {number} */
const lerp = (a, b, ratio) => a + (b - a) * ratio;

/** @param {number} n @returns {number} */
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Converts an rgb() triple to HSL lightness percentage (0-100), just to
 * decide whether a light or dark ring reads better against it.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
function rgbToLightness(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return ((max + min) / 2) * 100;
}

/**
 * A stroke + shadow combo that stays visible against the ball's fill no
 * matter how bright or dark that fill is (since the fill always exactly
 * matches the background) — this is the only thing that separates the
 * ball's silhouette from the screen behind it.
 * @param {number} lightness
 * @returns {string}
 */
function ringFor(lightness) {
  return lightness > 55
    ? `0 0 0 2px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.28)`
    : `0 0 0 2px rgba(255,255,255,0.3), 0 8px 24px rgba(0,0,0,0.45)`;
}

let keydownAt = 0;

/** @type {ReturnType<typeof setTimeout> | null} */
let resetTimer = null;

function setup() {
  if (!thing) {
    console.error(`#thing element not found in the DOM!`);
    return;
  }

  body.style.backgroundColor = settings.idleColor;

  // The ball starts life already matching the screen's idle color exactly —
  // only the ring/shadow marks its edge.
  thing.style.background = settings.idleColor;
  thing.style.boxShadow = ringFor(10);

  document.addEventListener(`keydown`, (event) => {
    if (event.code !== `Space`) return;
    event.preventDefault();
    if (event.repeat) return;

    if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }

    keydownAt = performance.now();

    // Holding the key is the hand on the fan switch. The screen and the
    // ball both run the exact same keyframe animation, started at the same
    // instant, so they move through the blue gradient in perfect lockstep —
    // no JS polling needed, it's just two elements animating identically.
    body.style.animation = `none`;
    thing.style.transition = `none`;
    thing.style.animation = `none`;
    void body.offsetWidth;

    body.style.animation = `charge-gradient ${settings.maxHoldMs}ms linear forwards`;
    thing.style.animation = `charge-gradient ${settings.maxHoldMs}ms linear forwards`;
    thing.style.transition = `box-shadow ${settings.maxHoldMs}ms linear, transform ${settings.growMs}ms ease-out, opacity 120ms linear`;
    thing.style.boxShadow = ringFor(88); // roughly where the gradient ends up, for the ring's transition target
    thing.style.transform = `scale(${settings.minScale})`;
    thing.style.opacity = `0.55`;
  });

  document.addEventListener(`keyup`, (event) => {
    if (event.code !== `Space`) return;
    event.preventDefault();

    // Size is driven directly by how long you held: a short tap gives a big
    // gust, a long hold gives a small, spent puff of air.
    const holdMs = performance.now() - keydownAt;
    const holdRatio = clamp01(holdMs / settings.maxHoldMs);
    const curvedRatio = easeIn(holdRatio, settings.curvePower);
    const finalScale = lerp(settings.maxScale, settings.minScale, curvedRatio);

    // Read the screen's exact current color (mid-gradient) right now, so
    // the ball's color freezes as a true match instead of drifting on.
    const computed = getComputedStyle(body).backgroundColor;
    const match = computed.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
    const currentLightness = match ? rgbToLightness(+match[1], +match[2], +match[3]) : 10;

    console.log(`Held ${holdMs.toFixed(0)}ms, screen is ${computed} -> ball scale ${finalScale.toFixed(2)}`);

    // Stop both animations dead, freezing the exact matched color, instead
    // of letting them keep animating toward the end of the gradient.
    body.style.animation = `none`;
    body.style.transition = `none`;
    body.style.backgroundColor = computed;
    void body.offsetWidth;

    thing.style.animation = `none`;
    thing.style.transition = `none`;
    thing.style.background = computed;
    thing.style.boxShadow = ringFor(currentLightness);
    void thing.offsetWidth;

    thing.style.transition = `transform ${settings.growMs}ms ease-out, opacity 120ms ease-out`;
    void thing.offsetWidth;
    thing.style.transform = `scale(${finalScale})`;
    thing.style.opacity = `1`;

    resetTimer = setTimeout(() => {
      thing.style.transition = `transform ${settings.resetMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${settings.resetMs}ms cubic-bezier(0.16, 1, 0.3, 1), background-color ${settings.resetMs}ms ease-out, box-shadow ${settings.resetMs}ms ease-out`;
      void thing.offsetWidth;
      thing.style.transform = `scale(0)`;
      thing.style.opacity = `0`;
      thing.style.background = settings.idleColor;
      thing.style.boxShadow = ringFor(10);

      // The screen fades back to idle in step with the ball settling.
      body.style.transition = `background-color ${settings.resetMs}ms ease-out`;
      body.style.backgroundColor = settings.idleColor;
    }, settings.growMs + settings.pauseMs);
  });

  // Make sure the page actually has keyboard focus so Space is captured
  body.focus();
  body.addEventListener(`click`, () => body.focus());
}

setup();