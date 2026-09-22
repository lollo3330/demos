import * as Numbers from '@ixfx/numbers.js';
import * as Things from './thing copy 4.js';


const settings = Object.freeze({
  howManyThings: 10,

  // Minimum movement
  baseSpeed: 0.00003,

  // Maximum movement
  maxSpeed: 0.08,

  // How much each Space press adds
  acceleration: 0.03,

  // How quickly speed fades
  friction: 0.98
});


/**
 * @typedef {{
 *   things: Things.Thing[],
 *   speed: number,
 *   lastPressTime: number
 * }} SketchState
 */


/** @type {SketchState} */
let state = {
  things: [],
  speed: 0,
  lastPressTime: 0
};


/**
 * The rhythm circle
 * @type {HTMLElement | null}
 */
const rhythmCircle = document.querySelector('#rhythm-circle');


/**
 * Update the visual appearance of the balls
 * @param {SketchState} currentState
 */
const use = (currentState) => {

  for (const t of currentState.things) {
    Things.use(t);
  }

};


/**
 * Update movement
 */
const update = async () => {

  const things = state.things;
  const speed = state.speed;

  // Gradually slow down
  const newSpeed =
    settings.baseSpeed +
    speed * settings.friction;


  const promises = things.map(
    /**
     * @param {Things.Thing} t
     */
    (t) => Things.update(t, newSpeed)
  );


  const changedThings = await Promise.all(promises);


  saveState({
    things: changedThings,
    speed: newSpeed
  });


  use(state);


  window.requestAnimationFrame(update);

};


/**
 * Create a new ball
 */
function generateThing() {

  const thing = Things.generate();


  saveState({
    things: [...state.things, thing]
  });


  return thing;

}


/**
 * Make the rhythm circle pulse
 * @param {number} size
 */
/**
 * Make the rhythm circle pulse with light
 * @param {number} size
 */
function pulseCircle(size) {

  if (rhythmCircle === null) return;

  rhythmCircle.style.transition =
    'transform 120ms cubic-bezier(0.2, 0.8, 0.3, 1), ' +
    'box-shadow 120ms ease-out';

  rhythmCircle.style.transform =
    'translate(-50%, -50%) scale(' + size + ')';

  rhythmCircle.style.boxShadow =
    '0 0 15px rgba(255,255,255,0.9), ' +
    '0 0 35px rgba(255,255,255,0.7), ' +
    '0 0 70px rgba(255,255,255,0.45), ' +
    '0 0 120px rgba(255,255,255,0.25)';

  setTimeout(() => {

    if (rhythmCircle === null) return;

    rhythmCircle.style.transition =
      'transform 500ms cubic-bezier(0.2, 0.8, 0.3, 1), ' +
      'box-shadow 500ms ease-out';

    rhythmCircle.style.transform =
      'translate(-50%, -50%) scale(1)';

    rhythmCircle.style.boxShadow =
      '0 0 10px rgba(255,255,255,0.5), ' +
      '0 0 25px rgba(255,255,255,0.25), ' +
      '0 0 50px rgba(255,255,255,0.1)';

  }, 120);

}

/**
 * Setup
 */
const setup = () => {

  window.addEventListener(
    'keydown',
    /**
     * @param {KeyboardEvent} event
     */
    (event) => {

      // Only respond to Spacebar
      if (event.code !== 'Space') return;


      event.preventDefault();


      // Don't repeatedly trigger while holding Space
      if (event.repeat) return;


      const now = performance.now();


      // Time since previous press
      const interval =
        now - state.lastPressTime;


      let newSpeed = state.speed;


      /*
       * FIRST PRESS
       */
      if (state.lastPressTime === 0) {

        newSpeed =
          settings.acceleration;


        // First pulse
        pulseCircle(1.3);

      }


      /*
       * FOLLOWING PRESSES
       */
      else {

        /*
         * Calculate rhythm.
         *
         * Short interval = faster rhythm
         * Long interval = slower rhythm
         */
        const rhythmFactor = Math.max(
          0.2,
          Math.min(2, 500 / interval)
        );


        /*
         * Make the balls faster
         * according to the rhythm
         */
        newSpeed =
          newSpeed +
          settings.acceleration *
          rhythmFactor;


        /*
         * Make the circle pulse
         * according to the same rhythm
         */
        const pulseSize =
          1 +
          rhythmFactor * 0.5;


        pulseCircle(pulseSize);

      }


      /*
       * Don't allow speed
       * to exceed maximum
       */
      newSpeed = Math.min(
        settings.maxSpeed,
        newSpeed
      );


      /*
       * Save the new speed
       * and press time
       */
      saveState({
        speed: newSpeed,
        lastPressTime: now
      });

    }
  );


  /*
   * Create the balls
   */
  for (
    const v of Numbers.count(settings.howManyThings)
  ) {

    generateThing();

  }


  /*
   * Start movement
   */
  update();

};


/**
 * Start everything
 */
setup();


/**
 * Save state
 * @param {Partial<SketchState>} newState
 */
function saveState(newState) {

  state = Object.freeze({
    ...state,
    ...newState
  });


  return newState;

}