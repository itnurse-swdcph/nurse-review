import { FY_MONTHS } from "./constants.js";

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $all(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[char];
  });
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

export function formatThaiDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatThaiDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getFiscalYear(dateInput = new Date()) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  return date.getMonth() >= 9 ? year + 544 : year + 543;
}

export function fiscalYearLabel(value) {
  return `ปีงบประมาณ ${value || "-"}`;
}

export function debounce(fn, wait = 250) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), wait);
  };
}

export function safeJsonParse(value, fallback) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0E00-\u0E7F-]+/g, "");
}

export function toDateInput(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function buildRouteHash(route) {
  if (route.name === "unit-dashboard") {
    return `#/unit/${encodeURIComponent(route.unitName)}/dashboard`;
  }
  if (route.name === "unit-activity") {
    return `#/unit/${encodeURIComponent(route.unitName)}/activity/${route.activityId}`;
  }
  if (route.name === "reports") {
    return `#/reports/${route.scope || "organization"}`;
  }
  return "#/home";
}

export function parseHash(hashValue = window.location.hash) {
  const value = (hashValue || "#/home").replace(/^#/, "");
  const path = value.startsWith("/") ? value : `/${value}`;
  const parts = path.split("/").filter(Boolean);
  if (!parts.length || parts[0] === "home") {
    return { name: "home" };
  }
  if (parts[0] === "reports") {
    return { name: "reports", scope: parts[1] || "organization" };
  }
  if (parts[0] === "unit" && parts[1]) {
    const unitName = decodeURIComponent(parts[1]);
    if (!parts[2] || parts[2] === "dashboard") {
      return { name: "unit-dashboard", unitName };
    }
    if (parts[2] === "activity" && parts[3]) {
      return { name: "unit-activity", unitName, activityId: parts[3] };
    }
  }
  return { name: "home" };
}

export function paginate(items, currentPage, pageSize) {
  const safePageSize = Math.max(1, pageSize || 1);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(1, currentPage || 1), pageCount);
  const start = (safePage - 1) * safePageSize;
  return {
    page: safePage,
    pageCount,
    total: items.length,
    items: items.slice(start, start + safePageSize),
    start: items.length ? start + 1 : 0,
    end: Math.min(start + safePageSize, items.length),
  };
}

export function createFiscalMonthsPayload(source = {}) {
  return FY_MONTHS.reduce((payload, month) => {
    payload[month.key] = source[month.key] ?? "";
    return payload;
  }, {});
}

export async function readFilesAsBase64(files) {
  const normalized = Array.from(files || []);
  return Promise.all(
    normalized.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = String(reader.result || "").split(",")[1] || "";
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              base64,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB, before compression
const IMAGE_MAX_DIMENSION = 1600; // px, longest side after resize
const IMAGE_JPEG_QUALITY = 0.72;

/**
 * Validates a list of File objects for type/size before they are ever read
 * into memory as base64. Returns { validFiles, errors } so the caller can
 * surface per-file toast messages instead of silently failing later on the
 * server (or worse, hanging the save request on a huge payload).
 */
export function validateFiles(files, { maxFiles = 5, maxSizeBytes = MAX_FILE_SIZE_BYTES } = {}) {
  const incoming = Array.from(files || []);
  const validFiles = [];
  const errors = [];

  incoming.slice(0, maxFiles).forEach((file) => {
    const isAllowedType = !file.type || ALLOWED_MIME_TYPES.includes(file.type);
    if (!isAllowedType) {
      errors.push(`ไฟล์ "${file.name}" เป็นประเภทที่ไม่รองรับ`);
      return;
    }
    if (file.size > maxSizeBytes) {
      errors.push(`ไฟล์ "${file.name}" มีขนาดเกิน ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }
    validFiles.push(file);
  });

  return { validFiles, errors };
}

/**
 * Resizes/compresses image files on the client before upload so large
 * camera photos (often 5-10MB) don't get shipped as bloated base64 JSON
 * through the GAS request bridge, which is what was causing uploads to
 * feel stuck. Non-image files (PDF, Word, Excel) pass through untouched.
 */
export async function compressImageIfNeeded(file) {
  if (!file.type || !file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") {
    // Skip HEIC/HEIF and non-images: canvas re-encoding isn't reliable for HEIC in-browser.
    return file;
  }

  const bitmap = await createImageBitmapSafe(file);
  if (!bitmap) {
    return file;
  }

  const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", IMAGE_JPEG_QUALITY));
  if (!blob || blob.size >= file.size) {
    // Compression didn't help (e.g. already small); keep the original.
    return file;
  }

  const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
}

async function createImageBitmapSafe(file) {
  try {
    if (window.createImageBitmap) {
      return await window.createImageBitmap(file);
    }
  } catch (error) {
    // Fall through to the <img> based fallback below.
  }
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
    return img;
  } catch (error) {
    return null;
  }
}

export async function compressImagesIfNeeded(files) {
  return Promise.all(files.map((file) => compressImageIfNeeded(file)));
}
