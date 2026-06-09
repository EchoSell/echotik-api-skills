import { apiCatalog, regionMap, typeMap } from "./catalog.mjs";

const scenarios = [
  {
    id: "find-creators",
    name: "Find Creators",
    keywords: ["find creators", "influencer", "blogger", "kol", "commerce creator", "follower growth", "ranking", "leaderboard", "top creators", "category creators"],
    endpointIds: ["influencer-ranklist", "influencer-list", "influencer-trend", "influencer-detail", "realtime-influencer-detail", "influencer-product-list", "influencer-category-name"],
    requiredInputs: ["keyword or category, or a clearly stated ranking goal"],
    optionalInputs: ["market", "creator size preference", "whether realtime is needed", "time range", "requested size"],
    defaults: { size: 10 },
    reasoning: "Creator requests should prefer the creator rank list or creator list. For Top-N, follower-growth, and leaderboard questions, prioritize the rank-list endpoint."
  },
  {
    id: "creator-detail",
    name: "View Creator Detail",
    keywords: ["creator detail", "creator profile", "creator's detail", "influencer detail", "view this creator", "show me this creator", "creator information"],
    endpointIds: ["influencer-detail", "realtime-influencer-detail"],
    requiredInputs: ["user_id or unique_id"],
    optionalInputs: ["data mode: realtime or EchoTik offline"],
    defaults: {},
    reasoning: "Creator detail exists in both offline and realtime modes, so the user must choose the preferred mode before execution."
  },
  {
    id: "creator-video-performance",
    name: "Analyze Creator Video Performance",
    keywords: ["creator videos", "video performance", "recent videos", "influencer videos", "what this creator posted", "recent video performance", "video metrics"],
    endpointIds: ["influencer-video-list", "realtime-influencer-video-list", "influencer-detail"],
    requiredInputs: ["user_id or unique_id"],
    optionalInputs: ["data mode: realtime or EchoTik offline", "product_id"],
    defaults: {},
    reasoning: "Creator video lists exist in both offline and realtime modes, so ask the user first. The offline variant is better for GMV and sales enrichment."
  },
  {
    id: "creator-live-history",
    name: "View Creator Live History",
    keywords: ["creator live history", "historical live sessions", "creator livestreams", "past live sessions"],
    endpointIds: ["influencer-live-list", "influencer-detail"],
    requiredInputs: ["user_id"],
    optionalInputs: ["time range"],
    defaults: {},
    reasoning: "Creator live-history requests should prefer the offline live-list endpoint."
  },
  {
    id: "creator-followers",
    name: "View Creator Followers",
    keywords: ["creator followers", "follower list", "who follows this creator", "audience list"],
    endpointIds: ["realtime-influencer-follower-list", "influencer-detail"],
    requiredInputs: ["user_id"],
    optionalInputs: ["pagination or offset preference"],
    defaults: {},
    reasoning: "Follower-list requests should use the realtime follower-list endpoint and paginate with min_time."
  },
  {
    id: "creator-following",
    name: "View Creator Following",
    keywords: ["creator following", "following list", "who this creator follows"],
    endpointIds: ["realtime-influencer-following-list", "influencer-detail"],
    requiredInputs: ["user_id"],
    optionalInputs: ["pagination or offset preference"],
    defaults: {},
    reasoning: "Following-list requests should use the realtime following-list endpoint and paginate with min_time."
  },
  {
    id: "creator-region",
    name: "Resolve Creator Region",
    keywords: ["creator region", "creator country", "where is this creator based", "creator location"],
    endpointIds: ["realtime-influencer-region", "realtime-influencer-video-list", "influencer-detail"],
    requiredInputs: ["unique_id or user_id"],
    optionalInputs: [],
    defaults: {},
    reasoning: "Creator region should use the realtime region endpoint first, then fall back to realtime video-list if region lookup fails."
  },
  {
    id: "creator-qrcode",
    name: "Generate Creator QR Code",
    keywords: ["creator qr code", "homepage qr", "profile qr code"],
    endpointIds: ["realtime-influencer-generate-qrcode"],
    requiredInputs: ["user_id"],
    optionalInputs: [],
    defaults: {},
    reasoning: "Creator homepage QR-code requests should use the dedicated realtime QR endpoint."
  },
  {
    id: "creator-milestones",
    name: "View Creator Milestones",
    keywords: ["creator milestones", "milestone insight", "creator achievements", "follower milestones"],
    endpointIds: ["realtime-influencer-milestones"],
    requiredInputs: ["user_id"],
    optionalInputs: [],
    defaults: {},
    reasoning: "Creator milestone requests should use the dedicated realtime milestones endpoint."
  },
  {
    id: "search-creators",
    name: "Search Creators",
    keywords: ["search creators", "creator search", "search influencers", "influencer search"],
    endpointIds: ["realtime-influencer-search", "universal-search"],
    requiredInputs: ["keyword"],
    optionalInputs: ["market", "pagination preference"],
    defaults: {},
    reasoning: "Explicit creator-search intent should prefer realtime creator search and use universal search only as fallback."
  },
  {
    id: "find-products",
    name: "Find Winning Products",
    keywords: ["winning product", "product", "item", "product sourcing", "hot sale", "sku"],
    endpointIds: ["product-category-l1", "product-category-l2", "product-category-l3", "product-ranklist", "product-list", "product-trend", "product-detail", "extract-product-id", "product-influencer-list", "product-video-list", "product-live-list"],
    requiredInputs: ["keyword or category"],
    optionalInputs: ["market", "time range", "sorting preference"],
    defaults: { size: 10 },
    reasoning: "Start with product list, product rank list, and category resolution. Convert category names into category IDs before category-sensitive product calls."
  },
  {
    id: "search-products",
    name: "Search Products",
    keywords: ["search products", "product search", "search items"],
    endpointIds: ["realtime-product-search", "universal-search", "product-detail"],
    requiredInputs: ["keyword"],
    optionalInputs: ["market", "pagination preference"],
    defaults: {},
    reasoning: "Explicit product-search intent should prefer realtime product search. Use product detail after search when richer fields are needed."
  },
  {
    id: "image-search-products",
    name: "Search Products By Image",
    keywords: ["search product by image", "image search products", "photo search products"],
    endpointIds: ["realtime-product-photo-search", "realtime-product-photo-search-page"],
    requiredInputs: ["image_base64"],
    optionalInputs: ["pagination preference"],
    defaults: {},
    reasoning: "Image-based product discovery should use product photo search first and then the pagination endpoint for more results."
  },
  {
    id: "product-detail",
    name: "View Product Detail",
    keywords: ["product detail", "product profile", "show me this product", "view this product", "item detail"],
    endpointIds: ["extract-product-id", "product-detail", "realtime-product-detail"],
    requiredInputs: ["product_id or product share link"],
    optionalInputs: ["data mode: realtime or EchoTik offline", "region if realtime is chosen"],
    defaults: {},
    reasoning: "Product detail exists in both offline and realtime modes. Resolve share links first, then ask the user to choose the preferred mode."
  },
  {
    id: "product-comments",
    name: "View Product Comments",
    keywords: ["product comments", "product reviews", "comments for this product", "reviews for this product"],
    endpointIds: ["extract-product-id", "product-comment", "realtime-product-comment"],
    requiredInputs: ["product_id or product share link"],
    optionalInputs: ["data mode: realtime or EchoTik offline", "region if realtime is chosen", "pagination preference"],
    defaults: {},
    reasoning: "Product comments exist in both offline and realtime modes. Resolve share links first, then ask the user which mode they want."
  },
  {
    id: "analyze-shop",
    name: "Analyze a Shop",
    keywords: ["shop", "store", "seller", "merchant"],
    endpointIds: ["seller-category-l1", "seller-category-l2", "seller-category-l3", "seller-list", "seller-ranklist", "seller-trend", "seller-detail", "seller-product-list", "realtime-seller-product-list", "seller-influencer-list", "seller-video-list", "seller-live-list"],
    requiredInputs: ["shop name, seller_id, or share information"],
    optionalInputs: ["market", "whether to include related creators"],
    defaults: { size: 10 },
    reasoning: "Resolve the seller first, then expand into products, creators, videos, live sessions, and ranking or trend context as needed."
  },
  {
    id: "shop-detail",
    name: "View Shop Detail",
    keywords: ["shop detail", "seller detail", "store detail", "shop profile", "store profile"],
    endpointIds: ["seller-detail"],
    requiredInputs: ["seller_id"],
    optionalInputs: [],
    defaults: {},
    reasoning: "Shop detail requests should use the offline seller-detail endpoint first."
  },
  {
    id: "shop-product-list",
    name: "View Shop Product List",
    keywords: ["shop products", "seller products", "store products", "shop inventory", "what this shop sells"],
    endpointIds: ["seller-product-list", "realtime-seller-product-list"],
    requiredInputs: ["seller_id"],
    optionalInputs: ["data mode: realtime or EchoTik offline", "region if realtime is chosen", "pagination preference"],
    defaults: {},
    reasoning: "Shop product-list requests exist in both offline and realtime modes, so the user must choose the preferred mode before execution."
  },
  {
    id: "find-videos",
    name: "Find Videos",
    keywords: ["find videos", "video list", "commerce videos", "ai videos", "ad videos", "top videos", "video ranking"],
    endpointIds: ["product-category-l1", "product-category-l2", "product-category-l3", "video-list", "video-ranklist", "video-trend", "video-product-list"],
    requiredInputs: ["keyword, category, or a clearly stated video filtering goal"],
    optionalInputs: ["market", "time range", "sorting preference"],
    defaults: { size: 10 },
    reasoning: "Use the offline video library for large-scale discovery, and the video rank list for leaderboard-style requests."
  },
  {
    id: "search-videos",
    name: "Search Videos",
    keywords: ["search videos", "video search", "find videos by keyword"],
    endpointIds: ["realtime-video-search", "universal-search"],
    requiredInputs: ["keyword"],
    optionalInputs: ["market", "pagination preference"],
    defaults: {},
    reasoning: "Explicit video-search intent should prefer realtime video search and use universal search only as fallback."
  },
  {
    id: "video-detail",
    name: "View Video Detail",
    keywords: ["video detail", "video profile", "show me this video", "view this video"],
    endpointIds: ["video-detail", "realtime-video-detail", "video-trend", "realtime-video-trend-insight"],
    requiredInputs: ["video_id"],
    optionalInputs: ["data mode: realtime or EchoTik offline"],
    defaults: {},
    reasoning: "Video detail exists in both offline and realtime modes. Ask the user to choose first, and fall back to realtime detail if offline detail is empty."
  },
  {
    id: "analyze-video",
    name: "Analyze a Video",
    keywords: ["video", "viral", "why it performed", "comments", "views", "download video"],
    endpointIds: ["realtime-video-detail", "realtime-video-captions", "realtime-video-comment-insight", "realtime-video-trend-insight", "realtime-video-comments", "realtime-video-comment-replies", "realtime-video-downloadurl", "video-product-list"],
    requiredInputs: ["video_id or video link"],
    optionalInputs: ["whether to include comments", "whether to include download links", "whether to include attached products"],
    defaults: {},
    reasoning: "Video analysis usually requires multiple endpoints: detail, trend, comment insight, and attached products."
  },
  {
    id: "hashtag-videos",
    name: "Find Hashtag Videos",
    keywords: ["hashtag videos", "videos for hashtag", "hashtag related videos", "videos under hashtag"],
    endpointIds: ["realtime-hashtag-search", "realtime-hashtag-video-list"],
    requiredInputs: ["hashtag_id or hashtag text"],
    optionalInputs: ["pagination preference"],
    defaults: {},
    reasoning: "If only hashtag text is known, search the hashtag first to resolve hashtag_id, then fetch the associated video list."
  },
  {
    id: "search-hashtags",
    name: "Search Hashtags",
    keywords: ["search hashtags", "hashtag search", "find hashtags"],
    endpointIds: ["realtime-hashtag-search"],
    requiredInputs: ["keyword"],
    optionalInputs: ["market", "pagination preference"],
    defaults: {},
    reasoning: "Explicit hashtag-search intent should use realtime hashtag search."
  },
  {
    id: "search-music",
    name: "Search Music",
    keywords: ["search music", "music search", "find music"],
    endpointIds: ["realtime-music-search"],
    requiredInputs: ["keyword"],
    optionalInputs: ["market", "pagination preference"],
    defaults: {},
    reasoning: "Explicit music-search intent should use realtime music search."
  },
  {
    id: "search-live",
    name: "Search Live Sessions",
    keywords: ["live", "livestream", "live room"],
    endpointIds: ["realtime-live-search", "realtime-live-detail"],
    requiredInputs: ["keyword or live identifier"],
    optionalInputs: ["market"],
    defaults: {},
    reasoning: "Live-session data should prioritize realtime endpoints."
  },
  {
    id: "live-detail",
    name: "View Live Detail",
    keywords: ["live detail", "live room detail", "livestream detail", "show me this live room"],
    endpointIds: ["realtime-live-detail"],
    requiredInputs: ["room_id", "user_id"],
    optionalInputs: [],
    defaults: {},
    reasoning: "Live detail should use the realtime live-detail endpoint and only works while the room is actively live."
  }
];

const synonymRules = [
  { pattern: /(达人|创作者|博主|作者)/u, aliases: ["creator", "influencer"] },
  { pattern: /(商品|产品|货品)/u, aliases: ["product", "item"] },
  { pattern: /(店铺|小店|商家|店家)/u, aliases: ["shop", "seller", "store"] },
  { pattern: /(视频)/u, aliases: ["video", "videos"] },
  { pattern: /(直播间|直播)/u, aliases: ["live", "livestream", "live room"] },
  { pattern: /(粉丝)/u, aliases: ["followers", "audience"] },
  { pattern: /(关注)/u, aliases: ["following"] },
  { pattern: /(评论|评价)/u, aliases: ["comments", "reviews"] },
  { pattern: /(回复)/u, aliases: ["replies"] },
  { pattern: /(文案|脚本)/u, aliases: ["captions", "script"] },
  { pattern: /(搜索|查找|查询|检索)/u, aliases: ["search", "lookup", "find"] },
  { pattern: /(详情|资料)/u, aliases: ["detail", "profile"] },
  { pattern: /(报告|分析)/u, aliases: ["report", "analysis"] },
  { pattern: /(榜单|排行|排名)/u, aliases: ["ranking", "rank", "leaderboard", "top"] },
  { pattern: /(热门|爆款)/u, aliases: ["hottest", "popular", "hot", "winning"] },
  { pattern: /(最近|最新|近期)/u, aliases: ["recent", "latest"] },
  { pattern: /(涨粉)/u, aliases: ["follower growth"] },
  { pattern: /(增长)/u, aliases: ["growth"] },
  { pattern: /(类目|分类)/u, aliases: ["category"] },
  { pattern: /(实时)/u, aliases: ["realtime"] },
  { pattern: /(离线)/u, aliases: ["offline", "echotik"] },
  { pattern: /(一级类目)/u, aliases: ["l1 category"] },
  { pattern: /(二级类目)/u, aliases: ["l2 category"] },
  { pattern: /(三级类目)/u, aliases: ["l3 category"] },
  { pattern: /(带货)/u, aliases: ["commerce", "shoppable"] },
  { pattern: /(广告|投流)/u, aliases: ["ad"] },
  { pattern: /(话题|标签)/u, aliases: ["hashtag"] },
  { pattern: /(音乐)/u, aliases: ["music"] },
  { pattern: /(二维码)/u, aliases: ["qr code"] },
  { pattern: /(里程碑)/u, aliases: ["milestones", "achievement"] },
  { pattern: /(图片)/u, aliases: ["image", "photo"] },
  { pattern: /(分享链接)/u, aliases: ["share link", "url"] },
  { pattern: /(地区|国家|位置)/u, aliases: ["region", "country", "location"] },
  { pattern: /(美妆|彩妆|护肤)/u, aliases: ["beauty", "cosmetics", "makeup", "skincare"] },
  { pattern: /(女装)/u, aliases: ["women", "fashion", "clothing", "apparel"] },
  { pattern: /(男装)/u, aliases: ["men", "fashion", "clothing", "apparel"] },
  { pattern: /(鞋)/u, aliases: ["shoes"] },
  { pattern: /(箱包)/u, aliases: ["bags"] },
  { pattern: /(配饰)/u, aliases: ["accessories"] },
  { pattern: /(美国)/u, aliases: ["united states", "usa", "us"] },
  { pattern: /(英国)/u, aliases: ["united kingdom", "uk", "great britain"] },
  { pattern: /(越南)/u, aliases: ["vietnam", "vn"] },
  { pattern: /(印尼)/u, aliases: ["indonesia", "id"] },
  { pattern: /(泰国)/u, aliases: ["thailand", "th"] },
  { pattern: /(菲律宾)/u, aliases: ["philippines", "ph"] },
  { pattern: /(马来西亚)/u, aliases: ["malaysia", "my"] },
  { pattern: /(新加坡)/u, aliases: ["singapore", "sg"] },
  { pattern: /(巴西)/u, aliases: ["brazil", "br"] },
  { pattern: /(墨西哥)/u, aliases: ["mexico", "mx"] }
];

function normalizeRequestText(text) {
  const source = text || "";
  const lower = source.toLowerCase();
  const aliases = [];

  for (const rule of synonymRules) {
    if (rule.pattern.test(source) || rule.pattern.test(lower)) {
      aliases.push(...rule.aliases);
    }
  }

  if (source.includes("#")) aliases.push("hashtag");
  if (/(近14日|近14天|14日)/u.test(source)) aliases.push("14 days");
  if (/(近7日|近7天|7日)/u.test(source)) aliases.push("7 days");
  if (/(近30日|近30天|30日)/u.test(source)) aliases.push("30 days");
  if (/(近180日|近180天|180日)/u.test(source)) aliases.push("180 days");
  if (/(日榜)/u.test(source)) aliases.push("daily");
  if (/(周榜)/u.test(source)) aliases.push("weekly");
  if (/(月榜)/u.test(source)) aliases.push("monthly");
  if (/(前|top)\s*\d{1,3}/iu.test(source)) aliases.push("top");

  return `${lower} ${aliases.join(" ")}`
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalizeRequestText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreScenario(request, scenario) {
  const lower = normalizeRequestText(request);
  let score = 0;
  for (const keyword of scenario.keywords) {
    // Match against the raw request (preserves CJK) and the normalized lower-cased
    // text (covers bilingual aliases) so both English and Chinese keywords score.
    if (request.includes(keyword) || lower.includes(keyword.toLowerCase())) {
      score += keyword.length > 3 ? 4 : 3;
    }
  }
  return score;
}

function detectRegion(request) {
  const lower = normalizeRequestText(request);
  for (const [label, code] of Object.entries(regionMap)) {
    if (lower.includes(label.toLowerCase())) {
      return { label, code };
    }
  }
  return null;
}

function detectSessionLanguage(request) {
  return /\p{Script=Han}/u.test(request) ? "zh-CN" : "en-US";
}

function hasBroadProductCategoryHint(lower) {
  return /\b(beauty|cosmetics|makeup|skincare|women|women's|mens|men's|men|fashion|clothing|apparel|shoes|bags|accessories)\b/.test(lower);
}

function hasAiVideoHint(lower) {
  return /\bai\b/.test(lower);
}

function hasAdVideoHint(lower) {
  return /\bads?\b/.test(lower);
}

function inferSearchType(request) {
  if (normalizeRequestText(request).includes("exact")) {
    return 1;
  }
  return 0;
}

function detectEntityType(request) {
  const lower = normalizeRequestText(request);
  if (lower.includes("creator") || lower.includes("influencer")) return typeMap.influencer;
  if (lower.includes("product")) return typeMap.product;
  if (lower.includes("shop") || lower.includes("seller") || lower.includes("store")) return typeMap.seller;
  if (lower.includes("live")) return typeMap.live;
  if (lower.includes("video")) return typeMap.video;
  return null;
}

// Each discovery scenario has a natural entity type that should be used when the
// request text does not explicitly name one, so a shop search is never mislabeled
// as a video search just because no entity keyword matched.
const scenarioDefaultEntityType = {
  "find-creators": typeMap.influencer,
  "find-products": typeMap.product,
  "analyze-shop": typeMap.seller,
  "find-videos": typeMap.video,
  "search-live": typeMap.live
};

const DOCS_SOURCE = "https://opendocs.echotik.live/llms.txt";
const DEFAULT_PAGINATION_HINT =
  "Offline endpoints usually use page_num/page_size. Realtime endpoints should be paginated based on has_more, cursor, or next_cursor.";

function endpointById(id) {
  return apiCatalog.find((entry) => entry.id === id);
}

function formatEndpoint(entry) {
  return {
    id: entry.id,
    path: entry.path,
    method: entry.method,
    family: entry.family,
    mode: entry.mode,
    summary: entry.summary,
    docsUrl: entry.docsUrl,
    requiredParams: entry.requiredParams,
    recommendedParams: entry.recommendedParams,
    sourceNote: entry.sourceNote,
    dualModeGroup: entry.dualModeGroup || null,
    emptyFallbackId: entry.emptyFallbackId || null,
    paginationModel: entry.paginationModel || null,
    idResolution: entry.idResolution || null
  };
}

function needsModeChoice(scenario, request) {
  const lower = normalizeRequestText(request);
  return (
    scenario.id === "creator-detail" ||
    scenario.id === "creator-video-performance" ||
    scenario.id === "product-detail" ||
    scenario.id === "product-comments" ||
    scenario.id === "shop-product-list" ||
    scenario.id === "video-detail" ||
    lower.includes("creator detail") ||
    lower.includes("video list") ||
    lower.includes("product detail") ||
    lower.includes("product comments") ||
    lower.includes("shop products") ||
    lower.includes("video detail")
  );
}

function detectRequestedMode(request) {
  const lower = normalizeRequestText(request);
  if (lower.includes("realtime")) return "realtime";
  if (lower.includes("offline") || lower.includes("echotik")) return "offline";
  return null;
}

function shouldFallbackToRealtime(scenario) {
  return ["find-creators", "creator-detail", "creator-video-performance", "product-detail", "video-detail"].includes(scenario.id);
}

function buildSuggestedParams(request, scenario) {
  const params = {};
  const lower = normalizeRequestText(request);
  const region = detectRegion(request);
  if (region) {
    params.region = region.code;
  }

  if (scenario.id === "find-creators" || scenario.id === "find-products" || scenario.id === "analyze-shop" || scenario.id === "find-videos") {
    params.size = 10;
    params.searchType = inferSearchType(request);
  }

  if (scenario.id === "find-creators" || scenario.id === "find-products" || scenario.id === "analyze-shop" || scenario.id === "find-videos" || scenario.id === "search-live") {
    params.type = detectEntityType(request) ?? scenarioDefaultEntityType[scenario.id];
  }

  if (scenario.id === "find-products") {
    params.off_mark = 0;
  }

  if (lower.includes("recent") || lower.includes("latest")) {
    params.period = "recent";
  }

  if (lower.includes("weekly")) {
    params.rank_window = "week";
  } else if (lower.includes("monthly")) {
    params.rank_window = "month";
  } else if (lower.includes("daily")) {
    params.rank_window = "day";
  }

  if (lower.includes("7 days") || lower.includes("last 7 days")) {
    params.days = 7;
  } else if (lower.includes("30 days") || lower.includes("last 30 days")) {
    params.days = 30;
  } else if (lower.includes("180 days") || lower.includes("last 180 days")) {
    params.days = 180;
  }

  // Only treat a number as a result-set size when it is explicitly anchored to a
  // top/ranking phrase or a Chinese counter ("10个"). A bare number elsewhere
  // (e.g. "7 days", "2024") must not be misread as `size`.
  const topMatch = request.match(/(?:top|前)\s*(\d{1,3})\b/i) || request.match(/(\d{1,3})\s*个/);
  if (topMatch) {
    params.size = Number(topMatch[1]);
  }

  if (lower.includes("follower growth") || lower.includes("gained followers") || lower.includes("grew followers")) {
    params.rankIntent = "follower_growth";
    params.sort = "follower_growth_desc";
    params.rank_type = "followers";
  } else if (lower.includes("fastest growth") || lower.includes("fastest-growing")) {
    params.rankIntent = "growth";
    params.sort = "growth_desc";
  } else if (lower.includes("hottest") || lower.includes("most popular")) {
    params.sort = "hot_desc";
  }

  if (lower.includes("sales")) {
    params.rank_type = "sales";
  }

  if (lower.includes("category")) {
    params.needs_category_lookup = true;
  }

  if ((scenario.id === "find-products" || scenario.id === "analyze-shop" || scenario.id === "find-videos") && (params.needs_category_lookup || hasBroadProductCategoryHint(lower))) {
    params.needs_category_lookup = true;
    params.category_language = detectSessionLanguage(request);
    params.category_lookup_level = hasBroadProductCategoryHint(lower) ? "l1" : "progressive";
  }

  if (scenario.id === "find-videos") {
    if (hasAiVideoHint(lower)) {
      params.is_ai_video = true;
    }
    if (lower.includes("commerce") || lower.includes("shoppable")) {
      params.is_commerce_video = true;
    }
    if (hasAdVideoHint(lower)) {
      params.is_ad_video = true;
    }
  }

  if (["find-products", "product-detail", "product-comments"].includes(scenario.id) && /https?:\/\//i.test(request)) {
    params.resolve_product_id_from_share_link = true;
  }

  const requestedMode = detectRequestedMode(request);
  if (requestedMode) {
    params.preferred_mode = requestedMode;
  }

  return params;
}


// Ordered routing rules (first match wins). Each rule declares only what differs
// from the shared response shape: which scenario, when it applies, the surfaced
// alternatives, any executionPolicy overrides, and the pagination hint. Everything
// common is assembled by buildRouteResponse so a response-shape change is a one-line
// edit instead of an 18-branch sweep.
const routingRules = [
  {
    scenarioId: "creator-detail",
    match: (l) => (l.includes("detail") || l.includes("profile")) && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["Find Creators"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: true },
    paginationHint:
      "Offline endpoints usually use page_num/page_size. Realtime endpoints should be paginated based on has_more, cursor, or next_cursor."
  },
  {
    scenarioId: "creator-video-performance",
    match: (l) => (l.includes("video") || l.includes("videos")) && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["Find Creators", "Analyze a Video"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: true },
    paginationHint:
      "For realtime mode, inspect has_more, cursor, or next_cursor. For EchoTik offline mode, paginate from page_num=1."
  },
  {
    scenarioId: "search-creators",
    match: (l) => (l.includes("search") || l.includes("lookup")) && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["Find Creators"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Use realtime creator search first and paginate with offset. Use universal search only as fallback."
  },
  {
    scenarioId: "find-videos",
    match: (l) =>
      (l.includes("video") || l.includes("videos")) &&
      (l.includes("find") ||
        l.includes("list") ||
        l.includes("ranking") ||
        l.includes("rank") ||
        l.includes("top") ||
        hasAiVideoHint(l) ||
        hasAdVideoHint(l) ||
        l.includes("commerce")),
    alternatives: ["Analyze a Video"],
    policy: { modeChoiceRequired: false, preferredMode: "offline", fallbackToRealtimeOnEmpty: false },
    paginationHint:
      "Offline video discovery uses page_num/page_size. Use realtime trend endpoints only when the task needs recent per-video interaction movement."
  },
  {
    scenarioId: "image-search-products",
    match: (l) => (l.includes("image") || l.includes("photo")) && l.includes("product") && l.includes("search"),
    alternatives: ["Search Products"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Run photo search first, then use image_uri and box_detection with the page endpoint for more products."
  },
  {
    scenarioId: "search-products",
    match: (l, request) => (l.includes("search") || l.includes("lookup")) && l.includes("product") && !/https?:\/\//i.test(request),
    alternatives: ["Find Winning Products", "View Product Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Use realtime product search first and paginate with offset. Use product detail after search for richer fields."
  },
  {
    scenarioId: "product-detail",
    match: (l) => (l.includes("detail") || l.includes("profile")) && l.includes("product"),
    alternatives: ["Find Winning Products"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: true },
    paginationHint: "Offline product detail is a batch lookup. Realtime product detail requires an explicit region."
  },
  {
    scenarioId: "creator-milestones",
    match: (l) =>
      (l.includes("milestone") || l.includes("milestones") || l.includes("achievement")) &&
      (l.includes("creator") || l.includes("influencer")),
    alternatives: ["View Creator Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Creator milestones are a direct realtime lookup by user_id."
  },
  {
    scenarioId: "video-detail",
    match: (l) => (l.includes("detail") || l.includes("profile")) && l.includes("video"),
    alternatives: ["Analyze a Video", "Find Videos"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: true },
    paginationHint:
      "Prefer realtime 14-day trend for recent trend analysis. Offline video trend is suitable for longer history up to 180 days."
  },
  {
    scenarioId: "shop-detail",
    match: (l) => (l.includes("detail") || l.includes("profile")) && (l.includes("shop") || l.includes("seller") || l.includes("store")),
    alternatives: ["Analyze a Shop"],
    policy: { modeChoiceRequired: false, preferredMode: "offline", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Shop detail is a direct offline lookup by seller_id."
  },
  {
    scenarioId: "shop-product-list",
    match: (l) =>
      (l.includes("product") || l.includes("products") || l.includes("inventory")) &&
      (l.includes("shop") || l.includes("seller") || l.includes("store")),
    alternatives: ["Analyze a Shop", "Find Winning Products"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: false },
    paginationHint:
      "Offline seller product-list uses page_num/page_size. Realtime seller product-list may omit the first token and then uses next_scroll_param when has_more=true."
  },
  {
    scenarioId: "product-comments",
    match: (l) =>
      (l.includes("comment") || l.includes("comments") || l.includes("review") || l.includes("reviews")) && l.includes("product"),
    alternatives: ["Find Winning Products", "View Product Detail"],
    policy: { modeChoiceRequired: true, preferredMode: detectRequestedMode, fallbackToRealtimeOnEmpty: false },
    paginationHint: "For realtime product comments, start from offset=1 and use next_cursor when has_more=true."
  },
  {
    scenarioId: "hashtag-videos",
    match: (l) => (l.includes("hashtag") || l.includes("#")) && (l.includes("video") || l.includes("videos")),
    alternatives: ["Find Videos"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint:
      "If only hashtag text is known, resolve hashtag_id first through hashtag search and then request the hashtag video list."
  },
  {
    scenarioId: "search-videos",
    match: (l) => (l.includes("search") || l.includes("lookup")) && l.includes("video"),
    alternatives: ["Find Videos", "Analyze a Video"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Use realtime video search first and paginate with offset. Use universal search only as fallback."
  },
  {
    scenarioId: "search-hashtags",
    match: (l) => (l.includes("search") || l.includes("lookup")) && l.includes("hashtag"),
    alternatives: ["Find Hashtag Videos"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Hashtag search is a realtime keyword lookup and paginates with offset."
  },
  {
    scenarioId: "search-music",
    match: (l) => (l.includes("search") || l.includes("lookup")) && l.includes("music"),
    alternatives: [],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Music search is a realtime keyword lookup and paginates with offset."
  },
  {
    scenarioId: "creator-followers",
    match: (l) => l.includes("followers") && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["View Creator Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Use min_time as the next offset for follower-list pagination."
  },
  {
    scenarioId: "creator-following",
    match: (l) => l.includes("following") && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["View Creator Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Use min_time as the next offset for following-list pagination."
  },
  {
    scenarioId: "creator-region",
    match: (l) => (l.includes("region") || l.includes("country") || l.includes("location")) && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["View Creator Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint:
      "If the region endpoint fails, fall back to the first item from realtime influencer video-list and infer the region from that payload."
  },
  {
    scenarioId: "creator-qrcode",
    match: (l) => l.includes("qr code") && (l.includes("creator") || l.includes("influencer")),
    alternatives: ["View Creator Detail"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "No pagination is required for QR-code generation."
  },
  {
    scenarioId: "live-detail",
    match: (l) => (l.includes("detail") || l.includes("metrics")) && (l.includes("live room") || l.includes("livestream") || l.includes("live")),
    alternatives: ["Search Live Sessions"],
    policy: { modeChoiceRequired: false, preferredMode: "realtime", fallbackToRealtimeOnEmpty: false },
    paginationHint: "Realtime live detail works only while the room is actively live."
  }
];

function resolvePolicyValue(value, request) {
  return typeof value === "function" ? value(request) : value;
}

function buildRouteResponse(request, scenario, { alternatives, policy = {}, paginationHint }) {
  const endpoints = scenario.endpointIds.map(endpointById).filter(Boolean);
  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    reasoning: scenario.reasoning,
    suggestedParams: buildSuggestedParams(request, scenario),
    missingInputs: scenario.requiredInputs,
    optionalInputs: scenario.optionalInputs,
    alternatives,
    executionPolicy: {
      apiOnly: true,
      modeChoiceRequired: policy.modeChoiceRequired ?? false,
      preferredMode: resolvePolicyValue(policy.preferredMode, request) ?? null,
      fallbackToRealtimeOnEmpty: policy.fallbackToRealtimeOnEmpty ?? false,
      docsSource: DOCS_SOURCE,
      paginationHint: paginationHint ?? DEFAULT_PAGINATION_HINT
    },
    recommendedEndpoints: endpoints.map(formatEndpoint),
    searchQuery: tokenize(request).slice(0, 8).join(" ")
  };
}

export function routeRequest(request) {
  const lower = normalizeRequestText(request);

  const rule = routingRules.find((candidate) => candidate.match(lower, request));
  if (rule) {
    const scenario = scenarios.find((item) => item.id === rule.scenarioId);
    return buildRouteResponse(request, scenario, rule);
  }

  // Fallback: keyword-score every scenario and route to the best match.
  const ranked = scenarios
    .map((scenario) => ({ scenario, score: scoreScenario(request, scenario) }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0]?.score > 0 ? ranked[0].scenario : scenarios[0];
  const alternatives = ranked
    .filter((item) => item.scenario.id !== winner.id && item.score > 0)
    .slice(0, 2)
    .map((item) => item.scenario.name);

  return buildRouteResponse(request, winner, {
    alternatives,
    policy: {
      modeChoiceRequired: needsModeChoice(winner, request),
      preferredMode: detectRequestedMode(request),
      fallbackToRealtimeOnEmpty: shouldFallbackToRealtime(winner)
    },
    paginationHint:
      winner.id === "creator-video-performance"
        ? "For realtime mode, inspect has_more, cursor, or next_cursor. For EchoTik offline mode, paginate from page_num=1."
        : DEFAULT_PAGINATION_HINT
  });
}

export function searchDocs(query, limit = 8) {
  const normalizedQuery = normalizeRequestText(query);
  const tokens = tokenize(query);
  return apiCatalog
    .map((entry) => {
      const haystack = `${entry.id} ${entry.family} ${entry.summary} ${entry.keywords.join(" ")}`.toLowerCase();
      let score = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) {
          score += 2;
        }
      }
      for (const keyword of entry.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase()) || query.includes(keyword)) {
          score += 3;
        }
      }
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
