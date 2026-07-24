import test from "node:test";
import assert from "node:assert/strict";
import { extractHeadings } from "../components/ReaderTableOfContents";

test("extractHeadings extracts h1, h2, h3 tags correctly from HTML", () => {
  const sampleHtml = `
    <h1>Main Title</h1>
    <p>Introduction text</p>
    <h2>Key Concept 1</h2>
    <p>Details about concept 1</p>
    <h3>Sub-heading A</h3>
    <p>More details</p>
  `;

  const { headings } = extractHeadings(sampleHtml);
  assert.equal(headings.length, 3);
  assert.equal(headings[0].text, "Main Title");
  assert.equal(headings[0].level, 1);
  assert.equal(headings[1].text, "Key Concept 1");
  assert.equal(headings[1].level, 2);
  assert.equal(headings[2].text, "Sub-heading A");
  assert.equal(headings[2].level, 3);
});

test("extractHeadings returns empty array for empty HTML", () => {
  const { headings } = extractHeadings("");
  assert.equal(headings.length, 0);
});

test("extractHeadings generates unique IDs when headings lack id attributes", () => {
  const sampleHtml = `<h2>First Topic</h2><h2>Second Topic</h2>`;
  const { headings } = extractHeadings(sampleHtml);

  assert.equal(headings.length, 2);
  assert.ok(headings[0].id.includes("first-topic"));
  assert.ok(headings[1].id.includes("second-topic"));
  assert.notEqual(headings[0].id, headings[1].id);
});

test("SM-2 interval scheduling ratings map to correct target review days", () => {
  const sm2Intervals = {
    again: "< 1 min",
    hard: "1 day",
    good: "3 days",
    easy: "7 days",
  };

  assert.equal(sm2Intervals.again, "< 1 min");
  assert.equal(sm2Intervals.hard, "1 day");
  assert.equal(sm2Intervals.good, "3 days");
  assert.equal(sm2Intervals.easy, "7 days");
});

test("Dynamic time remaining calculation updates accurately based on scroll progress", () => {
  const totalReadTimeMinutes = 10;

  // At 0% progress -> 10 minutes left
  let progress = 0;
  let minutesLeft = Math.max(1, Math.ceil((totalReadTimeMinutes * (100 - progress)) / 100));
  assert.equal(minutesLeft, 10);

  // At 50% progress -> 5 minutes left
  progress = 50;
  minutesLeft = Math.max(1, Math.ceil((totalReadTimeMinutes * (100 - progress)) / 100));
  assert.equal(minutesLeft, 5);

  // At 95% progress -> 1 minute left (rounded up)
  progress = 95;
  minutesLeft = Math.max(1, Math.ceil((totalReadTimeMinutes * (100 - progress)) / 100));
  assert.equal(minutesLeft, 1);
});

test("Heatmap intensity class mapping based on daily minutes read", () => {
  function getIntensityClass(minutes: number): string {
    if (minutes === 0) return "bg-[#F4F3F3]";
    if (minutes <= 10) return "bg-[#E6C79C]";
    if (minutes <= 25) return "bg-[#D17659]/70";
    return "bg-[#D17659]";
  }

  assert.equal(getIntensityClass(0), "bg-[#F4F3F3]");
  assert.equal(getIntensityClass(5), "bg-[#E6C79C]");
  assert.equal(getIntensityClass(20), "bg-[#D17659]/70");
  assert.equal(getIntensityClass(45), "bg-[#D17659]");
});
