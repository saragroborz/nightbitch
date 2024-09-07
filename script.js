// Create a darker, complex sound using FMSynth for eerie textures
const synth = new Tone.FMSynth({
  harmonicity: 0.3,   // Lower harmonicity for more dissonance
  modulationIndex: 10, // Adds complexity to the modulation
  modulationType: "triangle",  // Modulation waveform for a darker sound
  oscillator: { type: "sine" },  // Simple sine wave for a smoother tone
  envelope: {
    attack: 1,   // Slow attack to give a long swell
    decay: 1.5,
    sustain: 0.3,  // Slightly higher sustain for more body
    release: 2     // Long release for lingering notes
  },
  modulationEnvelope: {
    attack: 0.5,
    decay: 1,
    sustain: 0.5,
    release: 2
  }
}).toDestination();

// Add effects
const reverb = new Tone.Reverb({ decay: 12, wet: 0.6 }).toDestination();  // Even longer reverb for more space
const delay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.7, wet: 0.5 }).toDestination();  // Delay for echo
const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.4 }).toDestination();  // Chorus for detune effect

synth.connect(reverb);
synth.connect(delay);
synth.connect(chorus);

// Use LFO to modulate the filter frequency for dynamic movement
const filter = new Tone.Filter(200, "lowpass").toDestination();
const lfo = new Tone.LFO("0.1hz", 50, 400).start(); // Slow LFO to modulate filter cutoff over time
lfo.connect(filter.frequency);
synth.connect(filter);

// Define darker, more dissonant chords
const chords = [
  ['A3', 'C4', 'Eb4', 'G4'], // A diminished
  ['B3', 'D4', 'F4', 'A4'],  // B diminished 7
  ['C4', 'Eb4', 'Gb4', 'Bb4'], // C diminished 7
  ['D3', 'F4', 'Ab4', 'C5'],  // D diminished
  ['E4', 'G4', 'Bb4', 'D5'],  // E minor 7
  ['F3', 'Ab4', 'C5', 'Eb5'], // F diminished 7
  ['G4', 'Bb4', 'Db5', 'F5']  // G half-diminished
];

// Get the image element for click interaction
const hoverImage = document.getElementById("hoverImage");

let playing = false; // Track if the music is playing

// Start the music on click
hoverImage.addEventListener('click', function(event) {
  if (!playing) {
    Tone.start(); // Ensure Tone.js context starts
    playing = true;
  }
});

hoverImage.addEventListener('mousemove', function(event) {
  if (playing) {
    // Get mouse position relative to the image
    const rect = hoverImage.getBoundingClientRect();
    const xPos = event.clientX - rect.left;  // Mouse X position
    const yPos = event.clientY - rect.top;   // Mouse Y position

    // Map Y position to chords (trigger a different chord depending on vertical position)
    const chordIndex = Math.floor(mapRange(yPos, 0, hoverImage.height, 0, chords.length));
    const chord = chords[chordIndex];

    // Play the selected chord with lower velocity for softness
    playChordWithRandomRhythm(chord, 0.15);  // Lower velocity for softer, darker tones

    // Map X position to reverb wet/dry mix
    const reverbMix = mapRange(xPos, 0, hoverImage.width, 0, 1);
    reverb.wet.value = reverbMix;

    // Map X position to modulation intensity for the chorus
    chorus.depth = mapRange(xPos, 0, hoverImage.width, 0.3, 0.8);
  }
});

// Possible durations for random rhythms
const possibleDurations = ['16n', '32n', '8t']; // Slower, triplet-based rhythms for a disjointed feel

// Function to play a chord with a randomized rhythm and lower volume
function playChordWithRandomRhythm(chord, velocity) {
  const startTime = Tone.now(); // Start immediately
  chord.forEach((note, index) => {
    const randomDuration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)]; // Random duration
    const randomOffset = Math.random() * 0.25; // Slight random delay for each note
    synth.triggerAttackRelease(note, randomDuration, startTime + randomOffset, velocity); // Play note with random duration and lower velocity
  });
}

// Helper function to map values from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
