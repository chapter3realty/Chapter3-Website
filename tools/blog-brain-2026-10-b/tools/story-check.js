#!/usr/bin/env node
/*
 * The machine part of the simple story test (voice/STORY-SIMPLE.md tests 4, 5 and 9), shared by every
 * batch and by score.js. Owner, 2026-10-11, on a story that asked the reader to count nights: "impossible
 * to understand". A reader holds about four things at once; a condition or a sum takes one of them.
 *
 * check(text) returns a list of problems; an empty list passes. text is the story with its tags removed,
 * starting at "Example:" for a labelled example.
 *
 * What it cannot check (a person must): one want, one problem, one fix; one timeline; no word to look up;
 * the cold retell. It counts numbers written as digits and as words, so "two weeks" and "90 nights" are
 * two numbers (STORY-RETELL-v13: the first version counted digits only and passed both as one).
 *
 *   node tools/story-check.js "Example: ..."
 */
"use strict";

const WORD_NUMBERS = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|dozen|half";
/* "one" as a pronoun or an article ("one of them", "the one they like", "no one") is not a count. */
const NOT_A_COUNT = /\b(?:no one|any ?one|every ?one|some ?one|the one|one of|one another|this one|that one|a one)\b/gi;

function sentences(text) {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+(?=[A-Z"])/).filter(Boolean);
}

function numbers(text) {
  const t = text.replace(/Chapter ?(?:3|III)\b/g, "").replace(NOT_A_COUNT, "");
  const digits = t.match(/\$?\d[\d,.]*%?/g) || [];
  const words = t.match(new RegExp(`\\b(?:${WORD_NUMBERS})\\b`, "gi")) || [];
  return digits.concat(words);
}

function check(text) {
  const problems = [];
  const body = String(text || "").replace(/^\s*Example:\s*/, "");
  const s = sentences(body);
  if (s.length < 4 || s.length > 6) problems.push(`runs ${s.length} sentences; a story runs 4 to 6`);
  const long = s.filter(x => x.split(/\s+/).length > 25);
  if (long.length) problems.push(`a sentence runs over 25 words: "${long[0].slice(0, 80)}"`);
  const cond = body.match(/\b(?:if|unless|except|would have|could have)\b/i);
  if (cond) problems.push(`holds a condition ("${cond[0]}"); conditions go in the plain text above the story`);
  /* Distinct values: "two weeks more" and "cut two weeks" are one number said twice. One number tied to
     the problem, plus one small count of people ("two grandsons"), is the most a reader holds without
     counting (STORY-SIMPLE test 4). */
  const n = [...new Set(numbers(body).map(x => x.toLowerCase().replace(/[$,%]/g, "")))];
  if (n.length > 2) problems.push(`holds ${n.length} different numbers (${n.slice(0, 4).join(", ")}); keep one the reader does nothing with`);
  /* A story about counting makes the reader count along (version 12: "counts the nights", "add up to"). */
  const tally = body.match(/\b(?:counts?|counted|counting|adds? up|added up|in total|totals?)\b/i);
  if (tally) problems.push(`asks the reader to count ("${tally[0]}"); give the result in words`);
  if (/\$\s?\d/.test(body)) problems.push("holds a price; prices go outside the story, from a verified row");
  return problems;
}

module.exports = { check, sentences, numbers };

if (require.main === module) {
  const p = check(process.argv.slice(2).join(" "));
  console.log(p.length ? p.map(x => `- ${x}`).join("\n") : "passes the machine part of the simple story test");
  process.exit(p.length ? 1 : 0);
}
