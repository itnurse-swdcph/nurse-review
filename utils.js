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
