import * as Util from './util.js';
import { resolveFields } from '@ixfx/core.js';


/**
 * @typedef {{
 *   el: HTMLElement
 *   position: { x:number, y:number }
 *   velocity: number
 * }} Thing
 */


/**
 * Draw the Thing
 * @param {Thing} thing
 */
export const use = (thing) => {
  const { position } = thing;

  Util.positionFromMiddle(
    thing.el,
    position
  );
};


/**
 * Update the Thing
 * @param {Thing} thing
 * @param {number} speed
 * @param {number} direction
 * @returns {Promise<Thing>}
 */
export const update = async (thing, speed, direction) => {

  const state = await resolveFields(thing);

  const { position, velocity } = state;

  // Each ball has its own speed
  let newVelocity = velocity;

  newVelocity +=
    (speed - velocity) * 0.05;

  // All balls use the same direction
  const newY =
    position.y + newVelocity * direction;

  // Keep the balls inside the screen
  const limitedY = Math.max(
    0,
    Math.min(1, newY)
  );

  return Object.freeze({
    ...thing,

    position: {
      x: position.x,
      y: limitedY
    },

    velocity: newVelocity
  });
};


/**
 * Generate a Thing
 * @returns {Thing}
 */
export function generate() {

  const protoThing = /** @type HTMLElement */ (
    document.querySelector(`#proto-thing`)
  );

  const cloned = /** @type HTMLElement */ (
    protoThing.cloneNode(true)
  );

  cloned.id = ``;

  document.body.append(cloned);

  return {

    el: cloned,

    // Random position
    position: {
      x: Math.random(),
      y: Math.random()
    },

    // Different speed for every ball
    velocity:
      0.005 + Math.random() * 0.015
  };
}