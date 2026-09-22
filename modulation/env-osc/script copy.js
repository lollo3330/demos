import * as Numbers from '@ixfx/numbers.js';
import * as Things from './thing copy.js';

const settings = Object.freeze({
  sizeEm: 10,
  howManyThings: 10,

  // Maximum movement speed
  maxSpeed: 0.04,

  // How much each press increases momentum
  acceleration: 0.008,

  // How quickly momentum fades when not pressing
  friction: 0.98
});

/**
 * @typedef {{
 * things: Things.Thing[]
 * speed: number
 * lastPressTime: number
 * }} SketchState
 */

/** @type {SketchState} */
let state = {
  things: [],
  speed: 0,
  lastPressTime: 0
};


/**
 * Use state
 * @param {SketchState} state
 */
const use = (state) => {
  for (const t of state.things) {
    Things.use(t);
  }
};


const update = async () => {
  const { things, speed } = state;

  // Gradually slow down over time
  const newSpeed = speed * settings.friction;

  const promises = things.map(t =>
    Things.update(t, newSpeed)
  );

  const changedThings = await Promise.all(promises);

  saveState({
    things: changedThings,
    speed: newSpeed
  });

  use(state);

  window.requestAnimationFrame(update);
};


function generateThing() {
  const thing = Things.generate();

  saveState({
    things: [...state.things, thing]
  });

  return thing;
}


const setup = () => {

  window.addEventListener(`keydown`, event => {

    if (event.code !== `Space`) return;

    event.preventDefault();

    const now = performance.now();

    // Avoid triggering repeatedly while holding the key down
    if (event.repeat) return;

    // Time between presses
    const interval = now - state.lastPressTime;

    let newSpeed = state.speed;

    if (state.lastPressTime !== 0) {

      // Faster rhythm = larger acceleration
      // Shorter interval produces more energy
      const rhythmFactor = Math.max(
        0.2,
        Math.min(2, 500 / interval)
      );

      newSpeed += settings.acceleration * rhythmFactor;

    } else {
      // First press starts movement
      newSpeed = settings.acceleration;
    }

    // Prevent speed exceeding maximum
    newSpeed = Math.min(settings.maxSpeed, newSpeed);

    saveState({
      speed: newSpeed,
      lastPressTime: now
    });

  });


  // Create things
  for (const v of Numbers.count(settings.howManyThings)) {
    generateThing();
  }

  update();
};


setup();


/**
 * Update state
 * @param {Partial<SketchState>} s
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });

  return s;
}
