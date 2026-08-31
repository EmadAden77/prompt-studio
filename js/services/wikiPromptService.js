// Optional WikiPrompt public-catalog integration.
// Non-blocking by design: Prompt Studio remains fully usable offline or if
// WikiPrompt is unavailable, rate-limited, CORS-blocked, or changes its API.

const DEFAULT_BASE_URL = "https://www.wikiprompt.org";
const DEFAULT_LIMIT = 8;
const CACHE_TTL_MS = 30 * 60 * 1000;

const REALISM_TERMS = Object.freeze([
  "realistic selfie",
  "smartphone selfie",
  "photorealistic smartphone",
  "identity preserving",
  "front camera",
  "candid photography"
]);

const REJECT_TERMS = /\b(8k|16k|ultra[- ]?hd|masterpiece|cinematic lighting|studio lighting|beauty retouch|perfect skin|razor sharp|extreme hdr|unreal engine|octane render)\b/i;
const PREFER_TERMS = /\b(selfie|smartphone|phone camera|front camera|candid|natural light|practical light|identity|reference image|sensor noise|white balance|handheld|jpeg|realistic|photorealistic)\b/i;

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

export class WikiPromptService {
  constructor({ baseUrl = DEFAULT_BASE_URL, fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetchImpl = fetchImpl;
    this.cache = new Map();
    this.pending = new Map();
  }

  buildQueries(config = {}) {
    const scene = clean(config.scene?.name_en || config.scene?.name_ar);
    const pose = clean(config.pose?.name_en || config.pose?.name_ar);
    const lighting = clean(config.lighting?.name_en || config.lighting?.name_ar);
    const contextual = clean(["realistic smartphone selfie", scene, pose, lighting].filter(Boolean).join(" "));
    return unique([contextual, ...REALISM_TERMS]).slice(0, 7);
  }

  cacheKey(config = {}) {
    return [config.scene?.id, config.pose?.id, config.lighting?.id].filter(Boolean).join("|") || "global-realism";
  }

  score(record = {}) {
    const text = clean([
      record.title,
      record.description,
      ...(Array.isArray(record.tags) ? record.tags : []),
      record.metadata?.style,
      record.metadata?.keywords,
      clean(record.content).slice(0, 1200)
    ].filter(Boolean).join(" "));
    let score = 0;
    if (PREFER_TERMS.test(text)) score += 4;
    if (/\bselfie\b/i.test(text)) score += 3;
    if (/\b(smartphone|front camera|phone camera)\b/i.test(text)) score += 3;
    if (/\b(identity|reference image)\b/i.test(text)) score += 2;
    if (/\b(candid|handheld|sensor noise|white balance|jpeg|practical light)\b/i.test(text)) score += 2;
    if (REJECT_TERMS.test(text)) score -= 6;
    return score;
  }

  normalizePayload(payload) {
    if (Array.isArray(payload)) return payload;
    return payload?.prompts || payload?.results || payload?.data || payload?.items || [];
  }

  async search(query, { limit = DEFAULT_LIMIT } = {}) {
    if (!this.fetchImpl || !query) return [];
    const url = `${this.baseUrl}/api/search?q=${encodeURIComponent(query)}&limit=${Math.min(Math.max(limit, 1), 20)}`;
    try {
      const response = await this.fetchImpl(url, { headers: { Accept: "application/json" } });
      if (!response.ok) return [];
      const payload = await response.json();
      return this.normalizePayload(payload)
        .map((record) => ({ ...record, _realismScore: this.score(record) }))
        .filter((record) => record._realismScore > 0)
        .sort((a, b) => b._realismScore - a._realismScore);
    } catch {
      return [];
    }
  }

  async discover(config = {}, { perQuery = 5, maxResults = 8 } = {}) {
    const batches = await Promise.all(this.buildQueries(config).map((query) => this.search(query, { limit: perQuery })));
    const byKey = new Map();
    for (const record of batches.flat()) {
      const key = record.slug || record.id || record.url || record.title;
      if (!key) continue;
      const previous = byKey.get(key);
      if (!previous || (record._realismScore ?? 0) > (previous._realismScore ?? 0)) byKey.set(key, record);
    }
    return [...byKey.values()].sort((a, b) => b._realismScore - a._realismScore).slice(0, maxResults);
  }

  buildGuidance(records = []) {
    if (!records.length) return "";
    const evidence = records.slice(0, 5).map((record) => {
      const title = clean(record.title || record.slug || "WikiPrompt reference");
      const description = clean(record.description).slice(0, 220);
      const tags = Array.isArray(record.tags) ? record.tags.slice(0, 8).join(", ") : "";
      return `- ${title}${description ? `: ${description}` : ""}${tags ? ` [${tags}]` : ""}`;
    }).join("\n");

    return `WIKIPROMPT REALISM DISCOVERY — OPTIONAL EXTERNAL EVIDENCE\nThe following public WikiPrompt catalog matches are inspiration/evidence only. Never copy them blindly and never let them override Prompt Studio's identity, anatomy, contact, camera, lighting, material, sensor or room-authority rules. Reject cinematic/beauty/8K/HDR language when it conflicts with ordinary smartphone capture. Extract only physically compatible realism cues.\n${evidence}`;
  }

  getCachedGuidance(config = {}) {
    const item = this.cache.get(this.cacheKey(config));
    if (!item || Date.now() - item.savedAt > CACHE_TTL_MS) return "";
    return item.guidance || "";
  }

  sync(config = {}, { onReady } = {}) {
    const key = this.cacheKey(config);
    const cached = this.getCachedGuidance(config);
    if (cached) return Promise.resolve(cached);
    if (this.pending.has(key)) return this.pending.get(key);

    const task = this.discover(config)
      .then((records) => {
        const guidance = this.buildGuidance(records);
        this.cache.set(key, { guidance, savedAt: Date.now() });
        if (guidance && typeof onReady === "function") onReady(guidance, records);
        return guidance;
      })
      .catch(() => "")
      .finally(() => this.pending.delete(key));

    this.pending.set(key, task);
    return task;
  }
}

export const wikiPromptService = new WikiPromptService();

// Automatic bridge: patch App.engineer before the App instance is created.
// First render is immediate/local. WikiPrompt then refreshes the same prompt
// asynchronously only when the scene/pose/lighting selection is still current.
function installAutomaticBridge() {
  const AppClass = globalThis.App;
  if (!AppClass?.prototype || AppClass.prototype.__wikiPromptBridgeInstalled) return;

  const originalEngineer = AppClass.prototype.engineer;
  if (typeof originalEngineer !== "function") return;

  Object.defineProperty(AppClass.prototype, "__wikiPromptBridgeInstalled", { value:true });

  AppClass.prototype.engineer = function wikiPromptAwareEngineer(options = {}) {
    const result = originalEngineer.call(this, options);
    const config = this.currentConfig;
    if (!config || !this.promptEngine) return result;

    const expectedKey = wikiPromptService.cacheKey(config);
    const cached = wikiPromptService.getCachedGuidance(config);
    if (cached) {
      config.wikiPromptGuidance = cached;
      this.currentPrompt = this.promptEngine.generateV2(config);
      this.renderPrompt?.(this.currentPrompt);
      if (options.persistHistory !== false) this.saveToHistory?.(this.currentPrompt);
      return this.currentPrompt;
    }

    wikiPromptService.sync(config, {
      onReady: (guidance) => {
        if (!guidance || !this.currentConfig) return;
        if (wikiPromptService.cacheKey(this.currentConfig) !== expectedKey) return;
        this.currentConfig.wikiPromptGuidance = guidance;
        this.currentPrompt = this.promptEngine.generateV2(this.currentConfig);
        this.renderPrompt?.(this.currentPrompt);
        this.renderFavoriteState?.();
        if (options.persistHistory !== false) this.saveToHistory?.(this.currentPrompt);
        this.setStatus?.("تم تحديث البرومبت بقواعد WikiPrompt الواقعية");
      }
    });

    return result;
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", installAutomaticBridge, { once:true });
}
