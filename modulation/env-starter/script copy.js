import { elapsedToHumanString } from '@ixfx';
import { Envelopes } from '@ixfx/modulation.js';

const settings = Object.freeze({
  thing:/** @type HTMLElement */(document.querySelector(`#thing`)),
  sampleRateMs: 5,
  // Create the envelope
  envelope: new Envelopes.Adsr({
    attackBend: 1,
    attackDuration: 10 * 100,
    releaseLevel: 0,
    releaseDuration: 10 * 100,
    sustainLevel: 1
    // shouldLoop: true,
  })
});

/**
 * @typedef {{
 * envelopeValue: number
 * }} State
 */

/** @type State */
let state = Object.freeze({
  envelopeValue: 0
});

const update = () => {
  let { envelope } = settings;

  // Read value from envelope and set it to state
  let envelopeValue = envelope.value;
  // Set value to 0 if envelope has not been started
  if (Number.isNaN(envelopeValue)) envelopeValue = 0;

  use(saveState({
    envelopeValue
  }));
  window.requestAnimationFrame(update);
};

/**
 * Apply the state to visual properties etc...
 * @param {State} state
 */
const use = (state) => {
  const { envelopeValue } = state;
  const { thing } = settings;
  console.log(envelopeValue);
  const hsl1 = `hsl(${envelopeValue * 200}deg, 100%, 50%)`;
  const hsl2 = `hsl(100deg, 30%, ${envelopeValue * 100}%)`;
  document.body.style.background = hsl2;
  thing.style.scale = `${envelopeValue * 100}%`;
  thing.style.backgroundColor = hsl1;
};

function setup() {
  update();

  // Trigger envelope
 //settings.envelope.trigger();
 document.addEventListener(`keyup`, (event) => {
  if (event.repeat) return;
  console.log(`keydown`);
  settings.envelope.trigger(true);

 });

 document.addEventListener(`keydown`, () => {
  settings.envelope.release();
 });
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