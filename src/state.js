/**
 * @author Anthony Altieri on 6/3/17.
 */

let state = {
  currentLine: -1,
};

export function init() {
  let savedState = window.localStorage.getItem('flybyState');
  if (savedState !== null) {
    state = { ...state, savedState };
  }
}

export function setCurrentLine(lineNumber) {
  state.currentLine = lineNumber;
}

export function getCurrentLine() {
  return state.currentLine;
}

export function isCurrentLineSet() {
  return state.currentLine !== -1;
}

export function getState() {
  return state;
}

