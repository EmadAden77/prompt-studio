export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export class ImageHandler {
  constructor({ maxBytes, acceptedTypes }) {
    this.maxBytes = maxBytes;
    this.acceptedTypes = acceptedTypes;
    this.objectUrls = new Map();
  }

  validate(file) {
    if (!file) return { valid: false, error: "ما تم اختيار ملف." };
    if (!this.acceptedTypes.includes(file.type)) {
      return { valid: false, error: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP أو AVIF." };
    }
    if (file.size > this.maxBytes) {
      return { valid: false, error: `حجم الصورة أكبر من الحد المسموح (${formatBytes(this.maxBytes)}).` };
    }
    return { valid: true };
  }

  createPreview(key, file) {
    this.revoke(key);
    const url = URL.createObjectURL(file);
    this.objectUrls.set(key, url);
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url
    };
  }

  revoke(key) {
    const url = this.objectUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    this.objectUrls.delete(key);
  }

  destroy() {
    [...this.objectUrls.keys()].forEach((key) => this.revoke(key));
  }
}
