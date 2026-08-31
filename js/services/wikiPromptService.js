// WikiPrompt realism integration for the static GitHub Pages app.
// Uses a same-origin metadata cache first, with a tiny embedded metadata fallback
// so the prompt generator keeps working even when a mobile browser/CDN blocks JSON fetches.
// Third-party prompt bodies are not redistributed by this module.

const LOCAL_DATASET_URL = new URL("../../data/wikiprompt-realism.json", import.meta.url).href;
const CACHE_TTL_MS = 30 * 60 * 1000;

const EMBEDDED_FALLBACK_RECORDS = Object.freeze([
  {
    slug:"realistic-selfie-image-prompt-generator-system-prompt",
    title:"Realistic selfie image-prompt generator system prompt",
    description:"Activity-driven realistic smartphone and lifestyle prompt methodology emphasizing contextual consistency, authentic imperfections, natural actions, simple camera language and physically appropriate scene details.",
    tags:["realistic-photography", "selfie-prompts", "lifestyle-photography", "authenticity", "smartphone", "activity-driven", "natural"]
  },
  {
    slug:"casual-living-room-selfie-identity-preserving-prompt",
    title:"Casual living-room selfie identity-preserving prompt",
    description:"Identity-preserving candid smartphone selfie guidance using relaxed posture, eye-level arm-length perspective, natural daylight, realistic skin texture, fabric folds and subtle imperfections.",
    tags:["photography", "selfie", "identity-reference", "natural-light", "candid", "smartphone", "photorealistic"]
  },
  {
    slug:"authentic-handheld-selfie-vlog-day-off-video-with-korean-dia",
    title:"Authentic handheld selfie-vlog day-off",
    description:"Handheld front-camera realism reference emphasizing identity consistency, everyday casual context, natural light and deliberately imperfect camera behavior.",
    tags:["selfie-vlog", "handheld-camera", "authentic", "photorealistic", "natural-light", "identity"]
  }
]);

const REJECT_TERMS = /\b(8k|16k|ultra[- ]?hd|masterpiece|cinematic lighting|studio lighting|beauty retouch|perfect skin|razor sharp|extreme hdr|unreal engine|octane render)\b/i;
const PREFER_TERMS = /\b(selfie|smartphone|phone camera|front camera|candid|natural light|practical light|identity|reference image|sensor noise|white balance|handheld|jpeg|realistic|photorealistic|authentic|photography|imperfection)\b/i;

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function recordText(record = {}) {
  return clean([
    record.title,
    record.description,
    record.category,
    record.model,
    ...(Array.isArray(record.tags) ? record.tags : []),
    record.metadata?.style,
    ...(Array.isArray(record.metadata?.keywords) ? record.metadata.keywords : [record.metadata?.keywords])
  ].filter(Boolean).join(" "));
}

function configText(config = {}) {
  return clean([
    config.scene?.id, config.scene?.name_en, config.scene?.name_ar, config.scene,
    config.pose?.id, config.pose?.name_en, config.pose?.name_ar, config.pose,
    config.lighting?.id, config.lighting?.name_en, config.lighting?.name_ar, config.lighting,
    config.mode, config.composition, config.selfieAngle,
    "realistic photorealistic smartphone selfie front camera identity reference candid photography natural practical light"
  ].filter(Boolean).join(" ")).toLowerCase();
}

export class WikiPromptService {
  constructor({ fetchImpl = globalThis.fetch, localUrl = LOCAL_DATASET_URL } = {}) {
    this.fetchImpl = fetchImpl;
    this.localUrl = localUrl;
    this.cache = new Map();
    this.pending = new Map();
    this.localRecords = null;
    this.localSource = null;
    this.lastStatus = { state:"idle", message:"WikiPrompt local cache not checked yet", at:null };
  }

  setStatus(state, message, details = null) {
    this.lastStatus = { state, message, details, at:new Date().toISOString() };
    return this.lastStatus;
  }

  getStatus() { return { ...this.lastStatus }; }

  cacheKey(config = {}) {
    return [config.scene?.id || config.scene, config.pose?.id || config.pose, config.lighting?.id || config.lighting].filter(Boolean).join("|") || "global-realism";
  }

  useEmbeddedFallback(reason, details = {}) {
    this.localRecords = EMBEDDED_FALLBACK_RECORDS.map((record) => ({ ...record }));
    this.localSource = "embedded-fallback";
    this.setStatus(
      "local-fallback",
      `WikiPrompt embedded fallback active: ${reason}`,
      { ...details, count:this.localRecords.length, source:this.localSource }
    );
    return this.localRecords;
  }

  score(record = {}, config = {}) {
    const text = recordText(record);
    const context = configText(config);
    const lower = text.toLowerCase();
    let score = 0;

    if (PREFER_TERMS.test(text)) score += 5;
    if (/\b(selfie|selfie-vlog|selfie prompts?)\b/i.test(text)) score += 5;
    if (/\b(smartphone|front camera|phone camera|handheld|arm[- ]length)\b/i.test(text)) score += 4;
    if (/\b(identity|reference|identity-preserving|identity-reference)\b/i.test(text)) score += 3;
    if (/\b(candid|natural|authentic|imperfection|photography|photorealistic|realistic)\b/i.test(text)) score += 3;

    const contextTokens = context.split(/[^a-z0-9\u0600-\u06ff-]+/i).filter((word) => word.length >= 4);
    const overlap = new Set(contextTokens.filter((word) => lower.includes(word))).size;
    score += Math.min(overlap, 6);

    if (REJECT_TERMS.test(text)) score -= 8;
    return score;
  }

  async loadLocalRecords() {
    if (this.localRecords) return this.localRecords;
    if (!this.fetchImpl) {
      return this.useEmbeddedFallback("fetch unavailable", { url:this.localUrl });
    }
    try {
      const response = await this.fetchImpl(this.localUrl, { cache:"no-cache", headers:{ Accept:"application/json" } });
      if (!response.ok) {
        return this.useEmbeddedFallback(`HTTP ${response.status}`, { status:response.status, url:this.localUrl });
      }
      const payload = await response.json();
      const records = Array.isArray(payload?.records) ? payload.records : [];
      if (!records.length) {
        return this.useEmbeddedFallback("local JSON empty", { updated_at:payload?.updated_at || null, url:this.localUrl });
      }
      this.localRecords = records;
      this.localSource = "same-origin-local-json";
      this.setStatus("local-ready", `WikiPrompt local cache ready: ${records.length} records`, { count:records.length, updated_at:payload?.updated_at || null, url:this.localUrl, source:this.localSource });
      return records;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("[WikiPrompt] local cache failed; using embedded fallback", error);
      return this.useEmbeddedFallback(message, { url:this.localUrl });
    }
  }

  async discover(config = {}, { maxResults = 8 } = {}) {
    const records = await this.loadLocalRecords();
    if (!records.length) return [];

    const scored = records
      .map((record) => ({ ...record, _realismScore:this.score(record, config) }))
      .sort((a, b) => b._realismScore - a._realismScore);

    let ranked = scored.filter((record) => record._realismScore > 0).slice(0, maxResults);
    let fallback = false;
    if (!ranked.length) {
      fallback = true;
      ranked = scored.filter((record) => !REJECT_TERMS.test(recordText(record))).slice(0, Math.min(maxResults, 5));
    }

    const embedded = this.localSource === "embedded-fallback";
    this.setStatus(
      ranked.length ? (embedded ? "local-fallback" : "local-ready") : "empty",
      ranked.length ? `WikiPrompt ${embedded ? "embedded fallback" : "local discovery"} ready: ${ranked.length} matches${fallback ? " (general realism fallback)" : ""}` : "WikiPrompt cache produced no usable matches",
      { count:ranked.length, fallback, source:this.localSource || "unknown" }
    );
    return ranked;
  }

  buildGuidance(records = []) {
    if (!records.length) return "";
    const evidence = records.slice(0, 5).map((record) => {
      const title = clean(record.title || record.slug || "WikiPrompt reference");
      const description = clean(record.description).slice(0, 260);
      const tags = Array.isArray(record.tags) ? record.tags.slice(0, 8).join(", ") : "";
      return `- ${title}${description ? `: ${description}` : ""}${tags ? ` [${tags}]` : ""}`;
    }).join("\n");
    return `WIKIPROMPT REALISM DISCOVERY — LOCAL SAME-ORIGIN EVIDENCE\nThe following locally cached or embedded WikiPrompt metadata is inspiration/evidence only. Never let it override Prompt Studio's identity, anatomy, contact, camera, lighting, material, sensor or room-authority rules. Reject cinematic/beauty/8K/HDR language when it conflicts with ordinary smartphone capture. Extract only physically compatible realism cues.\n${evidence}`;
  }

  getCachedGuidance(config = {}) {
    const item = this.cache.get(this.cacheKey(config));
    if (!item || Date.now() - item.savedAt > CACHE_TTL_MS) return "";
    return item.guidance || "";
  }

  sync(config = {}) {
    const key = this.cacheKey(config);
    const cached = this.getCachedGuidance(config);
    if (cached) {
      this.setStatus("cache", "WikiPrompt guidance loaded from local memory cache", { key, source:this.localSource || "memory" });
      return Promise.resolve(cached);
    }
    if (this.pending.has(key)) return this.pending.get(key);
    this.setStatus("loading", "Loading WikiPrompt realism metadata", { key, url:this.localUrl });
    const task = this.discover(config)
      .then((records) => {
        const guidance = this.buildGuidance(records);
        this.cache.set(key, { guidance, savedAt:Date.now() });
        if (guidance) {
          const embedded = this.localSource === "embedded-fallback";
          this.setStatus(
            embedded ? "synced-fallback" : "synced",
            embedded ? "WikiPrompt guidance synchronized from embedded fallback" : "WikiPrompt local guidance synchronized",
            { key, count:records.length, source:this.localSource || "unknown" }
          );
        }
        return guidance;
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.setStatus("error", `WikiPrompt synchronization failed: ${message}`, { key, url:this.localUrl });
        console.warn("[WikiPrompt] synchronization failed", error);
        return "";
      })
      .finally(() => this.pending.delete(key));
    this.pending.set(key, task);
    return task;
  }
}

export const wikiPromptService = new WikiPromptService();
