import { apiCatalog } from "./catalog.mjs";
import { callEchoTikApi } from "./client.mjs";

const endpointMap = new Map(apiCatalog.map((entry) => [entry.id, entry]));

const reportTemplates = {
  creator: {
    label: "Creator",
    defaultSections: ["overview", "trend", "videos", "promoted_products"],
    optionalSections: ["live_history", "followers", "following", "milestones", "region"],
    identifierHelp: "Use user_id or unique_id. If only one creator identifier is available, the workflow can resolve the missing creator ID during execution.",
    sections: {
      overview: {
        label: "Creator overview",
        description: "Profile-level creator metrics and metadata.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-influencer-detail" : "influencer-detail"),
        buildQuery: ({ context }) =>
          context.mode === "realtime"
            ? { unique_id: context.creator.unique_id || context.originalIdentifier }
            : { user_ids_or_unique_ids: context.originalIdentifier },
        fallbackEndpointId: "realtime-influencer-detail"
      },
      trend: {
        label: "Creator trend",
        description: "Historical creator trend snapshots.",
        resolveEndpoint: () => "influencer-trend",
        buildQuery: ({ context }) => ({ user_id: context.creator.user_id || context.originalIdentifier })
      },
      videos: {
        label: "Creator videos",
        description: "Recent creator video inventory and performance.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-influencer-video-list" : "influencer-video-list"),
        buildQuery: ({ context, pageSize }) =>
          context.mode === "realtime"
            ? { unique_id: context.creator.unique_id || context.originalIdentifier }
            : { user_id_or_unique_id: context.originalIdentifier, page_num: 1, page_size: pageSize },
        fallbackEndpointId: "realtime-influencer-video-list"
      },
      live_history: {
        label: "Creator live history",
        description: "Historical creator livestream records.",
        resolveEndpoint: () => "influencer-live-list",
        buildQuery: ({ context, pageSize }) => ({ user_id: context.creator.user_id || context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      promoted_products: {
        label: "Creator promoted products",
        description: "Products historically promoted by the creator.",
        resolveEndpoint: () => "influencer-product-list",
        buildQuery: ({ context, pageSize }) => ({ user_id: context.creator.user_id || context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      followers: {
        label: "Creator followers",
        description: "Realtime follower list sample.",
        resolveEndpoint: () => "realtime-influencer-follower-list",
        buildQuery: ({ context }) => ({ user_id: context.creator.user_id || context.originalIdentifier })
      },
      following: {
        label: "Creator following",
        description: "Realtime following list sample.",
        resolveEndpoint: () => "realtime-influencer-following-list",
        buildQuery: ({ context }) => ({ user_id: context.creator.user_id || context.originalIdentifier })
      },
      milestones: {
        label: "Creator milestones",
        description: "Realtime creator milestone insights.",
        resolveEndpoint: () => "realtime-influencer-milestones",
        buildQuery: ({ context }) => ({ user_id: context.creator.user_id || context.originalIdentifier })
      },
      region: {
        label: "Creator region",
        description: "Realtime creator region resolution.",
        resolveEndpoint: () => "realtime-influencer-region",
        buildQuery: ({ context }) => ({ unique_id: context.creator.unique_id || context.originalIdentifier })
      }
    }
  },
  product: {
    label: "Product",
    defaultSections: ["overview", "trend", "creator_links", "video_links"],
    optionalSections: ["comments", "live_links"],
    identifierHelp: "Use product_id when possible. Product share links can be resolved into product_id and region during execution.",
    sections: {
      overview: {
        label: "Product overview",
        description: "Product-level detail and commerce metrics.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-product-detail" : "product-detail"),
        buildQuery: ({ context }) =>
          context.mode === "realtime"
            ? { product_id: context.product.product_id || context.originalIdentifier, region: context.region }
            : { product_ids: context.product.product_id || context.originalIdentifier },
        requires: ({ context }) => (context.mode === "realtime" && !context.region ? ["region"] : []),
        fallbackEndpointId: "realtime-product-detail"
      },
      trend: {
        label: "Product trend",
        description: "Historical product sales and GMV snapshots.",
        resolveEndpoint: () => "product-trend",
        buildQuery: ({ context }) => ({ product_id: context.product.product_id || context.originalIdentifier })
      },
      comments: {
        label: "Product comments",
        description: "Product comment sample for review analysis.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-product-comment" : "product-comment"),
        buildQuery: ({ context, pageSize }) =>
          context.mode === "realtime"
            ? { product_id: context.product.product_id || context.originalIdentifier, region: context.region, offset: 1 }
            : { product_id: context.product.product_id || context.originalIdentifier, page_num: 1, page_size: pageSize },
        requires: ({ context }) => (context.mode === "realtime" && !context.region ? ["region"] : [])
      },
      creator_links: {
        label: "Product creator links",
        description: "Creators associated with the product.",
        resolveEndpoint: () => "product-influencer-list",
        buildQuery: ({ context, pageSize }) => ({ product_id: context.product.product_id || context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      video_links: {
        label: "Product video links",
        description: "Videos associated with the product.",
        resolveEndpoint: () => "product-video-list",
        buildQuery: ({ context, pageSize }) => ({ product_id: context.product.product_id || context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      live_links: {
        label: "Product live links",
        description: "Livestreams associated with the product.",
        resolveEndpoint: () => "product-live-list",
        buildQuery: ({ context, pageSize }) => ({ product_id: context.product.product_id || context.originalIdentifier, page_num: 1, page_size: pageSize })
      }
    }
  },
  seller: {
    label: "Seller",
    defaultSections: ["overview", "trend", "products", "creator_links"],
    optionalSections: ["video_links", "live_links"],
    identifierHelp: "Use seller_id for seller and shop report workflows.",
    sections: {
      overview: {
        label: "Seller overview",
        description: "Shop-level seller detail.",
        resolveEndpoint: () => "seller-detail",
        buildQuery: ({ context }) => ({ seller_id: context.originalIdentifier })
      },
      trend: {
        label: "Seller trend",
        description: "Historical shop trend snapshots.",
        resolveEndpoint: () => "seller-trend",
        buildQuery: ({ context }) => ({ seller_id: context.originalIdentifier })
      },
      products: {
        label: "Seller products",
        description: "Seller inventory sample.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-seller-product-list" : "seller-product-list"),
        buildQuery: ({ context, pageSize }) =>
          context.mode === "realtime"
            ? { seller_id: context.originalIdentifier, region: context.region }
            : { seller_id: context.originalIdentifier, page_num: 1, page_size: pageSize },
        requires: ({ context }) => (context.mode === "realtime" && !context.region ? ["region"] : [])
      },
      creator_links: {
        label: "Seller creator links",
        description: "Creators associated with the seller.",
        resolveEndpoint: () => "seller-influencer-list",
        buildQuery: ({ context, pageSize }) => ({ seller_id: context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      video_links: {
        label: "Seller video links",
        description: "Videos associated with the seller.",
        resolveEndpoint: () => "seller-video-list",
        buildQuery: ({ context, pageSize }) => ({ seller_id: context.originalIdentifier, page_num: 1, page_size: pageSize })
      },
      live_links: {
        label: "Seller live links",
        description: "Livestreams associated with the seller.",
        resolveEndpoint: () => "seller-live-list",
        buildQuery: ({ context, pageSize }) => ({ seller_id: context.originalIdentifier, page_num: 1, page_size: pageSize })
      }
    }
  },
  video: {
    label: "Video",
    defaultSections: ["overview", "trend", "comment_keywords", "attached_products"],
    optionalSections: ["captions", "comments"],
    identifierHelp: "Use video_id for video report workflows.",
    sections: {
      overview: {
        label: "Video overview",
        description: "Video-level detail and performance signals.",
        resolveEndpoint: ({ mode }) => (mode === "realtime" ? "realtime-video-detail" : "video-detail"),
        buildQuery: ({ context }) =>
          context.mode === "realtime"
            ? { video_id: context.originalIdentifier }
            : { video_ids: context.originalIdentifier },
        fallbackEndpointId: "realtime-video-detail"
      },
      trend: {
        label: "Video trend",
        description: "Short-horizon or historical trend view, depending on mode.",
        autoMode: "realtime",
        resolveEndpoint: ({ mode }) => (mode === "offline" ? "video-trend" : "realtime-video-trend-insight"),
        buildQuery: ({ context }) =>
          context.mode === "offline"
            ? { video_id: context.originalIdentifier }
            : { video_id: context.originalIdentifier }
      },
      captions: {
        label: "Video captions",
        description: "Realtime caption or script extraction.",
        resolveEndpoint: () => "realtime-video-captions",
        buildQuery: ({ context }) => ({ video_id: context.originalIdentifier })
      },
      comment_keywords: {
        label: "Video comment keywords",
        description: "Top comment keyword insight.",
        resolveEndpoint: () => "realtime-video-comment-insight",
        buildQuery: ({ context }) => ({ video_id: context.originalIdentifier })
      },
      comments: {
        label: "Video comments",
        description: "Realtime comment sample.",
        resolveEndpoint: () => "realtime-video-comments",
        buildQuery: ({ context, pageSize }) => ({ video_id: context.originalIdentifier, count: pageSize })
      },
      attached_products: {
        label: "Attached products",
        description: "Products associated with the video.",
        resolveEndpoint: () => "video-product-list",
        buildQuery: ({ context }) => ({ video_ids: context.originalIdentifier })
      }
    }
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getEndpoint(endpointId) {
  return endpointMap.get(endpointId);
}

function isEmptyContainer(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function isEmptyEchoTikData(result) {
  const payload = result?.data;
  if (!payload || typeof payload !== "object" || payload.code !== 0) {
    return false;
  }
  return isEmptyContainer(payload.data);
}

function pickFirstRecord(payload) {
  if (Array.isArray(payload)) return payload[0] || null;
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload.data)) return payload.data[0] || null;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.list)) return payload.data.list[0] || null;
    return payload.data;
  }
  return null;
}

function inferIdentifierType(entityType, identifier, identifierType) {
  if (identifierType) return identifierType;
  if (entityType === "creator") {
    return /^\d+$/.test(identifier) ? "user_id" : "unique_id";
  }
  if (entityType === "product" && /^https?:\/\//i.test(identifier)) {
    return "share_link";
  }
  return `${entityType}_id`;
}

async function resolveCreatorContext(context) {
  if (context.creator.user_id && context.creator.unique_id) {
    return context;
  }

  const result = await callEchoTikApi({
    path: "/api/v3/echotik/influencer/detail",
    method: "GET",
    query: { user_ids_or_unique_ids: context.originalIdentifier }
  });

  const record = pickFirstRecord(result.data);
  if (record) {
    context.creator.user_id = record.user_id || context.creator.user_id;
    context.creator.unique_id = record.unique_id || context.creator.unique_id;
    context.resolutionLog.push({
      type: "creator-id-resolution",
      sourceEndpointId: "influencer-detail",
      resolvedUserId: context.creator.user_id || null,
      resolvedUniqueId: context.creator.unique_id || null
    });
  }

  return context;
}

async function resolveProductContext(context) {
  if (context.identifierType !== "share_link") {
    return context;
  }

  const result = await callEchoTikApi({
    path: "/api/v3/realtime/extract_product_id",
    method: "GET",
    query: { url: context.originalIdentifier }
  });

  const record = pickFirstRecord(result.data);
  if (record) {
    context.product.product_id = record.product_id || record.item_id || context.product.product_id;
    context.region = context.region || record.region || null;
    context.resolutionLog.push({
      type: "product-share-link-resolution",
      sourceEndpointId: "extract-product-id",
      resolvedProductId: context.product.product_id || null,
      resolvedRegion: context.region || null
    });
  }

  return context;
}

async function prepareExecutionContext({ entityType, identifier, identifierType, mode, region }) {
  const context = {
    entityType,
    originalIdentifier: identifier,
    identifierType,
    mode,
    region: region || null,
    creator: {
      user_id: identifierType === "user_id" ? identifier : null,
      unique_id: identifierType === "unique_id" ? identifier : null
    },
    product: {
      product_id: identifierType === "product_id" ? identifier : null
    },
    resolutionLog: []
  };

  if (entityType === "creator") {
    return resolveCreatorContext(context);
  }

  if (entityType === "product") {
    return resolveProductContext(context);
  }

  return context;
}

function selectMode(mode, fallbackMode) {
  return mode === "auto" ? fallbackMode : mode;
}

function normalizeSections(template, includeSections) {
  const validSections = new Set([
    ...template.defaultSections,
    ...template.optionalSections
  ]);
  const requested = includeSections?.length
    ? includeSections.filter((section) => validSections.has(section))
    : [];
  const invalid = includeSections?.filter((section) => !validSections.has(section)) || [];

  return {
    requested,
    invalid
  };
}

function buildStepDefinition({ sectionKey, sectionConfig, template, context, pageSize, mode }) {
  const effectiveMode = selectMode(mode, sectionConfig.autoMode || "offline");
  const endpointId = sectionConfig.resolveEndpoint({ mode: effectiveMode });
  const endpoint = getEndpoint(endpointId);
  const sectionContext = { ...context, mode: effectiveMode };
  const missingRequirements = sectionConfig.requires ? sectionConfig.requires({ context: sectionContext }) : [];

  return {
    sectionKey,
    sectionLabel: sectionConfig.label,
    sectionDescription: sectionConfig.description,
    endpointId,
    endpoint,
    query: sectionConfig.buildQuery({ context: sectionContext, pageSize }),
    body: sectionConfig.buildBody ? sectionConfig.buildBody({ context: sectionContext, pageSize }) : undefined,
    fallbackEndpointId: sectionConfig.fallbackEndpointId || null,
    missingRequirements,
    mode: effectiveMode,
    templateLabel: template.label
  };
}

function formatPlannedStep(step) {
  return {
    section: step.sectionKey,
    sectionLabel: step.sectionLabel,
    description: step.sectionDescription,
    endpointId: step.endpointId,
    path: step.endpoint?.path || null,
    method: step.endpoint?.method || null,
    mode: step.mode,
    docsUrl: step.endpoint?.docsUrl || null,
    query: step.query,
    body: step.body,
    missingRequirements: step.missingRequirements
  };
}

export function planReportWorkflow({
  entityType,
  identifier,
  identifierType,
  includeSections,
  mode = "auto",
  region,
  pageSize = 10
}) {
  const template = reportTemplates[entityType];
  if (!template) {
    throw new Error(`Unsupported report entity type: ${entityType}`);
  }

  const inferredIdentifierType = inferIdentifierType(entityType, identifier, identifierType);
  const { requested, invalid } = normalizeSections(template, includeSections);
  const selectedSections = requested.length ? requested : template.defaultSections;
  const needsConfirmation = !includeSections || includeSections.length === 0;

  const context = {
    entityType,
    originalIdentifier: identifier,
    identifierType: inferredIdentifierType,
    region: region || null,
    creator: {
      user_id: inferredIdentifierType === "user_id" ? identifier : null,
      unique_id: inferredIdentifierType === "unique_id" ? identifier : null
    },
    product: {
      product_id: inferredIdentifierType === "product_id" ? identifier : null
    },
    resolutionLog: []
  };

  const plannedSteps = selectedSections.map((sectionKey) =>
    buildStepDefinition({
      sectionKey,
      sectionConfig: template.sections[sectionKey],
      template,
      context,
      pageSize,
      mode
    })
  );

  return {
    entityType,
    entityLabel: template.label,
    identifier,
    identifierType: inferredIdentifierType,
    mode,
    region: region || null,
    needsConfirmation,
    confirmationPrompt: needsConfirmation
      ? `Confirm which ${template.label.toLowerCase()} report sections should be executed before launching a multi-endpoint workflow.`
      : null,
    identifierHelp: template.identifierHelp,
    defaultSections: clone(template.defaultSections),
    optionalSections: clone(template.optionalSections),
    invalidSections: invalid,
    selectedSections,
    plannedSteps: plannedSteps.map(formatPlannedStep)
  };
}

export async function runReportWorkflow({
  entityType,
  identifier,
  identifierType,
  includeSections,
  mode = "auto",
  region,
  pageSize = 10,
  execute = false
}) {
  const plan = planReportWorkflow({
    entityType,
    identifier,
    identifierType,
    includeSections,
    mode,
    region,
    pageSize
  });

  if (!execute || plan.needsConfirmation) {
    return plan;
  }

  const template = reportTemplates[entityType];
  const executionContext = await prepareExecutionContext({
    entityType,
    identifier,
    identifierType: plan.identifierType,
    mode,
    region
  });

  const steps = plan.selectedSections.map((sectionKey) =>
    buildStepDefinition({
      sectionKey,
      sectionConfig: template.sections[sectionKey],
      template,
      context: executionContext,
      pageSize,
      mode
    })
  );

  const results = [];

  for (const step of steps) {
    if (step.missingRequirements.length > 0) {
      results.push({
        ...formatPlannedStep(step),
        status: "blocked",
        error: `Missing required inputs for execution: ${step.missingRequirements.join(", ")}`
      });
      continue;
    }

    try {
      let response = await callEchoTikApi({
        path: step.endpoint.path,
        method: step.endpoint.method,
        query: step.query,
        body: step.body
      });

      let fallbackUsed = false;
      let fallbackStillEmpty = false;
      if (step.fallbackEndpointId && isEmptyEchoTikData(response)) {
        const fallbackEndpoint = getEndpoint(step.fallbackEndpointId);
        if (fallbackEndpoint) {
          const fallbackStep = buildStepDefinition({
            sectionKey: step.sectionKey,
            sectionConfig: {
              ...template.sections[step.sectionKey],
              resolveEndpoint: () => step.fallbackEndpointId,
              fallbackEndpointId: null
            },
            template,
            context: executionContext,
            pageSize,
            mode: "realtime"
          });

          if (fallbackStep.missingRequirements.length === 0) {
            response = await callEchoTikApi({
              path: fallbackEndpoint.path,
              method: fallbackEndpoint.method,
              query: fallbackStep.query,
              body: fallbackStep.body
            });
            fallbackUsed = true;
            fallbackStillEmpty = isEmptyEchoTikData(response);
          }
        }
      }

      results.push({
        ...formatPlannedStep(step),
        status: "completed",
        fallbackUsed,
        fallbackStillEmpty,
        response
      });
    } catch (error) {
      results.push({
        ...formatPlannedStep(step),
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    ...plan,
    needsConfirmation: false,
    resolutionLog: executionContext.resolutionLog,
    results
  };
}
