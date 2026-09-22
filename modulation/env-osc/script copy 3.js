import * as Numbers from '@ixfx/numbers.js';
import * as Things from './thing copy 3.js';


const settings = Object.freeze({

  howManyThings: 10,

  // Minimum movement
  baseSpeed: 0.00003,

  // Maximum movement
  maxSpeed: 0.04,

  // How much each press increases movement
  acceleration: 0.008,

  // How quickly movement slows down
  friction: 0.98,

  // Time moving in one direction
  directionDuration: 2500
});


/**
 * @typedef {{
 *   things: Things.Thing[]
 *   speed: number
 *   direction: number
 *   directionStarted: number
 *   lastPressTime: number
 * }} SketchState
 */


/** @type {SketchState} */
let state = {

  things: [],

  speed: 0,

  // -1 = up
  // 1 = down
  direction: -1,

  directionStarted: performance.now(),

  lastPressTime: 0
};


/**
 * Draw the balls
 * @param {SketchState} currentState
 */
const use = (currentState) => {

  for (const thing of currentState.things) {
    Things.use(thing);
  }

};


/**
 * Update animation
 */
const update = async () => {

  const now = performance.now();

  const {
    things,
    speed
  } = state;


  // --------------------------------
  // CHANGE DIRECTION FOR ALL BALLS
  // --------------------------------

  if (
    now - state.directionStarted >
    settings.directionDuration
  ) {

    saveState({

      direction:
        state.direction * -1,

      directionStarted: now

    });

  }


  const direction = state.direction;


  // --------------------------------
  // SLOW DOWN
  // --------------------------------

  const newSpeed =
    settings.baseSpeed +
    speed * settings.friction;


  // --------------------------------
  // MOVE ALL BALLS
  // --------------------------------

  const promises = things.map(
    (thing) =>
      Things.update(
        thing,
        newSpeed,
        direction
      )
  );


  const changedThings =
    await Promise.all(promises);


  saveState({

    things: changedThings,

    speed: newSpeed

  });


  use(state);


  window.requestAnimationFrame(update);
};


/**
 * Create a ball
 */
function generateThing() {

  const thing =
    Things.generate();

  saveState({

    things: [
      ...state.things,
      thing
    ]

  });

  return thing;
}


/**
 * Setup
 */
const setup = () => {

  window.addEventListener(
    `keydown`,
    (event) => {

      if (event.code !== `Space`) return;

      event.preventDefault();

      // Don't repeatedly trigger
      // while holding Space
      if (event.repeat) return;


      const now =
        performance.now();


      const interval =
        now - state.lastPressTime;


      let newSpeed =
        state.speed;


      if (
        state.lastPressTime !== 0
      ) {

        const rhythmFactor =
          Math.max(
            0.2,
            Math.min(
              2,
              500 / interval
            )
          );


        newSpeed +=
          settings.acceleration *
          rhythmFactor;

      } else {

        newSpeed =
          settings.acceleration;

      }


      newSpeed =
        Math.min(
          settings.maxSpeed,
          newSpeed
        );


      saveState({

        speed: newSpeed,

        lastPressTime: now

      });

    }
  );


  // Create the balls
  for (
    const v of Numbers.count(
      settings.howManyThings
    )
  ) {

    generateThing();

  }


  update();
};


setup();


/**
 * Save state
 * @param {Partial<SketchState>} s
 */
function saveState(s) {

  state = Object.freeze({

    ...state,

    ...s

  });

  return s;
}