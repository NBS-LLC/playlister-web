const notes = [
  // Major
  { name: "C", pitchClass: 0, mode: 1, camelotPosition: 8 },
  { name: "Db", pitchClass: 1, mode: 1, camelotPosition: 3 },
  { name: "D", pitchClass: 2, mode: 1, camelotPosition: 10 },
  { name: "Eb", pitchClass: 3, mode: 1, camelotPosition: 5 },
  { name: "E", pitchClass: 4, mode: 1, camelotPosition: 12 },
  { name: "F", pitchClass: 5, mode: 1, camelotPosition: 7 },
  { name: "Gb", pitchClass: 6, mode: 1, camelotPosition: 2 },
  { name: "G", pitchClass: 7, mode: 1, camelotPosition: 9 },
  { name: "Ab", pitchClass: 8, mode: 1, camelotPosition: 4 },
  { name: "A", pitchClass: 9, mode: 1, camelotPosition: 11 },
  { name: "Bb", pitchClass: 10, mode: 1, camelotPosition: 6 },
  { name: "B", pitchClass: 11, mode: 1, camelotPosition: 1 },
  // Minor
  { name: "Cm", pitchClass: 0, mode: 0, camelotPosition: 5 },
  { name: "Dbm", pitchClass: 1, mode: 0, camelotPosition: 12 },
  { name: "Dm", pitchClass: 2, mode: 0, camelotPosition: 7 },
  { name: "Ebm", pitchClass: 3, mode: 0, camelotPosition: 2 },
  { name: "Em", pitchClass: 4, mode: 0, camelotPosition: 9 },
  { name: "Fm", pitchClass: 5, mode: 0, camelotPosition: 4 },
  { name: "Gbm", pitchClass: 6, mode: 0, camelotPosition: 11 },
  { name: "Gm", pitchClass: 7, mode: 0, camelotPosition: 6 },
  { name: "Abm", pitchClass: 8, mode: 0, camelotPosition: 1 },
  { name: "Am", pitchClass: 9, mode: 0, camelotPosition: 8 },
  { name: "Bbm", pitchClass: 10, mode: 0, camelotPosition: 3 },
  { name: "Bm", pitchClass: 11, mode: 0, camelotPosition: 10 },
];

const camelotModes = ["A", "B"];

function getNote(pitchClass: number, mode: number) {
  return notes.find(
    (item) => item.pitchClass === pitchClass && item.mode === mode,
  );
}

export function getKeyName(pitchClass: number, mode: number) {
  return getNote(pitchClass, mode)?.name || "?";
}

export function getCamelotName(pitchClass: number, mode: number) {
  const camelotPosition = getNote(pitchClass, mode)?.camelotPosition;
  if (!camelotPosition) {
    return "?";
  }

  return `${camelotPosition}${camelotModes[mode]}`;
}
