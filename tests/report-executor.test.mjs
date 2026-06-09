import test from "node:test";
import assert from "node:assert/strict";
import { planReportWorkflow, runReportWorkflow } from "../mcp/report-executor.mjs";

test("creator report planning requests confirmation when sections are not explicitly selected", () => {
  const result = planReportWorkflow({
    entityType: "creator",
    identifier: "1234567890"
  });

  assert.equal(result.entityType, "creator");
  assert.equal(result.needsConfirmation, true);
  assert.deepEqual(result.defaultSections, ["overview", "trend", "videos", "promoted_products"]);
  assert.ok(result.plannedSteps.some((step) => step.endpointId === "influencer-detail"));
});

test("video trend planning prefers realtime trend insight in auto mode", () => {
  const result = planReportWorkflow({
    entityType: "video",
    identifier: "7483920348234",
    includeSections: ["trend"],
    mode: "auto"
  });

  assert.equal(result.needsConfirmation, false);
  assert.deepEqual(result.selectedSections, ["trend"]);
  assert.equal(result.plannedSteps[0].endpointId, "realtime-video-trend-insight");
});

test("product realtime comments planning surfaces region as a blocking requirement", () => {
  const result = planReportWorkflow({
    entityType: "product",
    identifier: "1732344693337788895",
    includeSections: ["comments"],
    mode: "realtime"
  });

  assert.equal(result.needsConfirmation, false);
  assert.equal(result.plannedSteps[0].endpointId, "realtime-product-comment");
  assert.deepEqual(result.plannedSteps[0].missingRequirements, ["region"]);
});

test("invalid requested sections are reported and dropped from the plan", () => {
  const result = planReportWorkflow({
    entityType: "creator",
    identifier: "1234567890",
    includeSections: ["overview", "not_a_section"]
  });

  assert.deepEqual(result.invalidSections, ["not_a_section"]);
  assert.deepEqual(result.selectedSections, ["overview"]);
  assert.equal(result.needsConfirmation, false);
});

test("product share links are inferred as a share_link identifier type", () => {
  const result = planReportWorkflow({
    entityType: "product",
    identifier: "https://www.tiktok.com/t/ZT-demo",
    includeSections: ["overview"],
    mode: "offline"
  });

  assert.equal(result.identifierType, "share_link");
});

test("execution marks fallbackStillEmpty when the realtime fallback also returns empty data", async () => {
  const originalFetch = global.fetch;
  const originalUsername = process.env.ECHOTIK_USERNAME;
  const originalPassword = process.env.ECHOTIK_PASSWORD;

  process.env.ECHOTIK_USERNAME = "demo";
  process.env.ECHOTIK_PASSWORD = "secret";

  // Both the offline overview endpoint and its realtime fallback return empty data.
  global.fetch = async () => ({
    ok: true,
    status: 200,
    async text() {
      return JSON.stringify({ code: 0, data: [] });
    }
  });

  try {
    const result = await runReportWorkflow({
      entityType: "video",
      identifier: "7483920348234",
      includeSections: ["overview"],
      mode: "offline",
      execute: true
    });

    const step = result.results[0];
    assert.equal(step.status, "completed");
    assert.equal(step.fallbackUsed, true);
    assert.equal(step.fallbackStillEmpty, true);
  } finally {
    global.fetch = originalFetch;
    if (originalUsername === undefined) delete process.env.ECHOTIK_USERNAME;
    else process.env.ECHOTIK_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ECHOTIK_PASSWORD;
    else process.env.ECHOTIK_PASSWORD = originalPassword;
  }
});
