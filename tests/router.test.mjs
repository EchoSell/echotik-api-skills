import test from "node:test";
import assert from "node:assert/strict";
import { routeRequest, searchDocs } from "../mcp/router.mjs";
import { typeMap } from "../mcp/catalog.mjs";

test("routes creator request to creator scenario", () => {
  const result = routeRequest("Find beauty creators in the United States who are strong at commerce");
  assert.equal(result.scenarioId, "find-creators");
  assert.equal(result.suggestedParams.region, "US");
  assert.ok(result.recommendedEndpoints.length > 0);
});

test("routes top follower growth request to influencer ranklist intent", () => {
  const result = routeRequest("Show me the top 10 creators in the United States with the fastest recent follower growth");
  assert.equal(result.scenarioId, "find-creators");
  assert.equal(result.suggestedParams.region, "US");
  assert.equal(result.suggestedParams.size, 10);
  assert.equal(result.suggestedParams.rankIntent, "follower_growth");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "influencer-ranklist"));
});

test("routes Chinese creator growth request to influencer ranking workflow", () => {
  const result = routeRequest("帮我查看一下美国最近涨粉最多的达人是哪10个");
  assert.equal(result.scenarioId, "find-creators");
  assert.equal(result.suggestedParams.region, "US");
  assert.equal(result.suggestedParams.size, 10);
  assert.equal(result.suggestedParams.rankIntent, "follower_growth");
});

test("routes video analysis request to video scenario", () => {
  const result = routeRequest("Analyze why this video performed so well and include comment signals");
  assert.equal(result.scenarioId, "analyze-video");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-video-comment-insight"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-video-captions"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-video-comment-replies"));
});

test("video discovery request routes to offline video library", () => {
  const result = routeRequest("Find AI commerce videos in the United States");
  assert.equal(result.scenarioId, "find-videos");
  assert.equal(result.suggestedParams.region, "US");
  assert.equal(result.suggestedParams.is_ai_video, true);
  assert.equal(result.suggestedParams.is_commerce_video, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "video-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "video-ranklist"));
});

test("video detail request requires user mode choice", () => {
  const result = routeRequest("Show me this video detail");
  assert.equal(result.scenarioId, "video-detail");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "video-detail"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-video-detail"));
});

test("hashtag video request resolves hashtag before fetching videos", () => {
  const result = routeRequest("Show me videos for this hashtag");
  assert.equal(result.scenarioId, "hashtag-videos");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-hashtag-search"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-hashtag-video-list"));
});

test("video search request prefers realtime search", () => {
  const result = routeRequest("Search videos in the United States");
  assert.equal(result.scenarioId, "search-videos");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-video-search"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "universal-search"));
});

test("hashtag search request prefers realtime hashtag search", () => {
  const result = routeRequest("Search hashtags in the United States");
  assert.equal(result.scenarioId, "search-hashtags");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.deepEqual(result.recommendedEndpoints.map((entry) => entry.id), ["realtime-hashtag-search"]);
});

test("music search request prefers realtime music search", () => {
  const result = routeRequest("Search music in the United States");
  assert.equal(result.scenarioId, "search-music");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.deepEqual(result.recommendedEndpoints.map((entry) => entry.id), ["realtime-music-search"]);
});

test("live detail request uses realtime live detail", () => {
  const result = routeRequest("Show me this live room detail");
  assert.equal(result.scenarioId, "live-detail");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.deepEqual(result.recommendedEndpoints.map((entry) => entry.id), ["realtime-live-detail"]);
});

test("creator detail request requires user mode choice", () => {
  const result = routeRequest("Show me this creator's detail");
  assert.equal(result.scenarioId, "creator-detail");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "influencer-detail"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-detail"));
});

test("creator video request requires user mode choice", () => {
  const result = routeRequest("Show me how this creator's recent videos are performing");
  assert.equal(result.scenarioId, "creator-video-performance");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "influencer-video-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-video-list"));
});

test("creator followers request uses realtime follower list with min_time pagination", () => {
  const result = routeRequest("Show me this creator's followers");
  assert.equal(result.scenarioId, "creator-followers");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.match(result.executionPolicy.paginationHint, /min_time/i);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-follower-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.paginationModel === "min_time"));
});

test("Chinese creator followers request uses realtime follower list", () => {
  const result = routeRequest("帮我看这个达人的粉丝列表");
  assert.equal(result.scenarioId, "creator-followers");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
});

test("creator region request exposes unique_id resolution and video fallback", () => {
  const result = routeRequest("Which country is this creator from?");
  assert.equal(result.scenarioId, "creator-region");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.match(result.executionPolicy.paginationHint, /fall back/i);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-region"));
  assert.ok(result.recommendedEndpoints.some((entry) => /resolve unique_id/i.test(entry.idResolution || "")));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-video-list"));
});

test("creator qr request uses dedicated realtime qr endpoint", () => {
  const result = routeRequest("Generate a QR code for this creator");
  assert.equal(result.scenarioId, "creator-qrcode");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.deepEqual(
    result.recommendedEndpoints.map((entry) => entry.id),
    ["realtime-influencer-generate-qrcode"]
  );
});

test("creator milestone request uses realtime milestones endpoint", () => {
  const result = routeRequest("Show me this creator's milestones");
  assert.equal(result.scenarioId, "creator-milestones");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.deepEqual(result.recommendedEndpoints.map((entry) => entry.id), ["realtime-influencer-milestones"]);
});

test("creator search request prefers realtime search", () => {
  const result = routeRequest("Search creators in the United States");
  assert.equal(result.scenarioId, "search-creators");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-influencer-search"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "universal-search"));
});

test("product discovery request applies off_mark and category lookup defaults", () => {
  const result = routeRequest("Find beauty products in the United States");
  assert.equal(result.scenarioId, "find-products");
  assert.equal(result.suggestedParams.region, "US");
  assert.equal(result.suggestedParams.off_mark, 0);
  assert.equal(result.suggestedParams.needs_category_lookup, true);
  assert.equal(result.suggestedParams.category_lookup_level, "l1");
  assert.equal(result.suggestedParams.category_language, "en-US");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "product-category-l1"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "product-ranklist"));
});

test("product detail request requires user mode choice", () => {
  const result = routeRequest("Show me this product detail");
  assert.equal(result.scenarioId, "product-detail");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "product-detail"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-product-detail"));
});

test("product share-link requests signal product_id resolution first", () => {
  const result = routeRequest("Show me this product detail https://www.tiktok.com/t/ZT-demo");
  assert.equal(result.scenarioId, "product-detail");
  assert.equal(result.suggestedParams.resolve_product_id_from_share_link, true);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "extract-product-id"));
});

test("product search request prefers realtime search", () => {
  const result = routeRequest("Search products in the United States");
  assert.equal(result.scenarioId, "search-products");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-product-search"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "universal-search"));
});

test("image product search request uses photo search plus pagination endpoint", () => {
  const result = routeRequest("Search product by image");
  assert.equal(result.scenarioId, "image-search-products");
  assert.equal(result.executionPolicy.preferredMode, "realtime");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-product-photo-search"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-product-photo-search-page"));
});

test("product comments request requires user mode choice and exposes realtime pagination", () => {
  const result = routeRequest("Show me the comments for this product");
  assert.equal(result.scenarioId, "product-comments");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.match(result.executionPolicy.paginationHint, /next_cursor/i);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "product-comment"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-product-comment"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.paginationModel === "next_cursor"));
});

test("shop discovery request inherits category lookup rules", () => {
  const result = routeRequest("Find beauty shops in the United States");
  assert.equal(result.scenarioId, "analyze-shop");
  assert.equal(result.suggestedParams.region, "US");
  assert.equal(result.suggestedParams.needs_category_lookup, true);
  assert.equal(result.suggestedParams.category_lookup_level, "l1");
  assert.equal(result.suggestedParams.category_language, "en-US");
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "seller-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "seller-category-l1"));
});

test("shop product-list request requires user mode choice", () => {
  const result = routeRequest("Show me this shop's products");
  assert.equal(result.scenarioId, "shop-product-list");
  assert.equal(result.executionPolicy.modeChoiceRequired, true);
  assert.match(result.executionPolicy.paginationHint, /next_scroll_param/i);
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "seller-product-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.id === "realtime-seller-product-list"));
  assert.ok(result.recommendedEndpoints.some((entry) => entry.paginationModel === "next_scroll_param"));
});

test("shop detail request prefers seller detail", () => {
  const result = routeRequest("Show me this shop detail");
  assert.equal(result.scenarioId, "shop-detail");
  assert.equal(result.executionPolicy.modeChoiceRequired, false);
  assert.deepEqual(result.recommendedEndpoints.map((entry) => entry.id), ["seller-detail"]);
});

test("searchDocs finds product endpoints", () => {
  const results = searchDocs("product creators", 5);
  assert.ok(results.some((entry) => entry.id === "product-influencer-list"));
});

test("searchDocs supports Chinese queries through bilingual normalization", () => {
  const results = searchDocs("商品 带货 达人", 5);
  assert.ok(results.some((entry) => entry.id === "product-influencer-list"));
});

test("a bare time-window number is not misread as a result-set size", () => {
  const result = routeRequest("Find beauty products in the United States from the last 7 days");
  assert.equal(result.scenarioId, "find-products");
  assert.equal(result.suggestedParams.days, 7);
  // size should keep the scenario default, not be overwritten by "7".
  assert.equal(result.suggestedParams.size, 10);
});

test("explicit top-N still sets the requested size", () => {
  const result = routeRequest("Find the top 25 beauty products in the United States");
  assert.equal(result.suggestedParams.size, 25);
});

test("shop discovery defaults the entity type to seller, not video", () => {
  const result = routeRequest("Find the best shops in the United States");
  assert.equal(result.scenarioId, "analyze-shop");
  assert.equal(result.suggestedParams.type, typeMap.seller);
});
