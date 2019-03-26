"use strict";

function getLine() {
  return ((new Error().stack).split("at ")[2]).trim().split(":")[1];
}

module.exports.getLine = getLine;

function Fatal(err) {
  console.warn('Fatal error:', err)
  process.exit(1)
  return false
}