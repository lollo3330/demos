import { Points } from '@ixfx/geometry.js';
import * as Things from './thing.js';
import * as Util from './util.js';

const settings = Object.freeze({
  updateRateMs: 1,
  howManyThings: 5
});

/** 
 * @typedef {{
 *  things:Things.Thing[]
 * }} State
 */

/** @type {State} */
let state = Object.freeze({
  things: []
});


const use = () => {
  state.things.forEach(t => Things.use(t));
};

const update = () => {
  // Update things
  let things = state.things.map((t) => Things.update(t, state));

  // TODO: other state changes? eg to the 'world' state?

  // Save the new copy
  saveState({ things });

  // Loop!
  setTimeout(update, 10);
};


/**
 * Pointer is pressed
 * @param {PointerEvent} event 
 */
function onPointerDown(event) {
  let { things } = state;
  const target = event.target;

  // Relative point at which drag was started
  // ie. go from pixel x, y to scalar 0..1, 0..1
  const startedAt = Util.relativePoint(event.x, event.y);

  things = things.map((t) => {
    if (t.el !== target) return t; // this one wasn't clicked

    // Keep track of its dragged state and where it started
    return Things.onDragStart(t, startedAt);
  });
  saveState({ things });
}

/**
 * Pointer is up or has left the window. Stop the drag
 * @param {PointerEvent} event 
 */
function onPointerUp(event) {
  let things = state.things.map(t => Things.onDragDone(t));

  // Update our state
  saveState({ things });
}

/**
 * Pointer has moved.
 * This will fire if we're dragging or not
 * @param {PointerEvent} event 
 */
function onPointerMove(event) {
  // Get pointer position in relative terms
  const cursorDragNow = Util.relativePoint(event.x, event.y);

  // Map over array
  let things = state.things.map(t => {
    // Haven't started dragging, don't care
    if (Points.isPlaceholder(t.cursorDragStart)) return t;
    return Things.saveThingState(t, { cursorDragNow });
  });
  saveState({ things });
}

function setup() {
  document.addEventListener(`pointerdown`, onPointerDown);
  document.addEventListener(`pointermove`, onPointerMove);
  document.addEventListener(`pointerup`, onPointerUp);

  let count = settings.howManyThings;
  while (count > 0) {
    state.things.push(Things.create());
    count--;
  }
  setInterval(() => {
    update();
    use();
  }, settings.updateRateMs);
}

setup();


/**
 * Save state
 * @param {Partial<State>} s 
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
  return state;
}