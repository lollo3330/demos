import * as Random from '@ixfx/random.js';
import { Bipolar } from '@ixfx/numbers.js';
import * as Util from './util.js';
import { resolveFields } from '@ixfx/core.js';


const settings = Object.freeze({
  minimumDistance: 0.1
});


/**
 * Define our Thing
 * @typedef {{
 * el: HTMLElement
 * position: { x:number, y:number }
 * velocity: number
 * direction: number
 * }} Thing
 */


/**
 * Make visual updates based on thing's data
 * @param {Thing} thing
 */
export const use = (thing) => {
  const { position } = thing;

  Util.positionFromMiddle(thing.el, position);
};


/**
 * For a given Thing, compute its new state
 * @param {Thing} thing
 * @param {number} speed
 * @returns {Promise<Thing>}
 */
export const update = async (thing, speed) => {

  const state = await resolveFields(thing);

  const { position, velocity, direction } = state;

  // Accelerate movement towards current speed
  let newVelocity = velocity;

  // Move velocity closer to global speed
  newVelocity += (speed - velocity) * 0.05;

  // Move position based on velocity and direction
  let newY = position.y + newVelocity * direction;

  let newDirection = direction;

  // Bounce at top and bottom boundaries
  if (newY >= 1) {
    newY = 1;
    newDirection = -1;
  }

  if (newY <= 0) {
    newY = 0;
    newDirection = 1;
  }

  return Object.freeze({
    ...thing,

    position: {
      x: position.x,
      y: newY
    },

    velocity: newVelocity,
    direction: newDirection
  });
};


/**
 * Generates a Thing
 * @returns {Thing}
 */
export function generate() {

  // Create a copy of our proto-thing
  const protoThing = /** @type HTMLElement */(
    document.querySelector(`#proto-thing`)
  );

  const cloned = /** @type HTMLElement */(
    protoThing.cloneNode(true)
  );

  // Add to body
  cloned.id = ``;
  document.body.append(cloned);


  return {

    el: cloned,

    // Random initial position
    position: {
      x: Math.random(),
      y: Math.random()
    },

    // Start with no movement
    velocity: 0,

    // Random starting direction
    direction: Math.random() > 0.5 ? 1 : -1
  };
}



