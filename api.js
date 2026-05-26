function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("Request timeout")), ms);
    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export class GasApiClient {
  constructor(config) {
    this.baseUrl = config.apiBaseUrl;
    this.timeoutMs = config.requestTimeoutMs || 45000;
  }

  async bootstrap(params = {}) {
    return this.get("bootstrap", params);
  }

  async getDashboard(unitName, fiscalYear) {
    return this.get("getDashboard", { unitName, fiscalYear });
  }

  async getActivityRecords(unitName, activityId, fiscalYear) {
    return this.get("getActivityRecords", { unitName, activityId, fiscalYear });
  }

  async getActivity12(unitName, fiscalYear) {
    return this.get("getActivity12", { unitName, fiscalYear });
  }

  async getReportBundle(unitName, fiscalYear) {
    return this.get("getReportBundle", { unitName, fiscalYear });
  }

  async saveActivityRecord(payload) {
    return this.post("saveActivityRecord", payload);
  }

  async deleteActivityRecord(payload) {
    return this.post("deleteActivityRecord", payload);
  }

  async saveIndicatorCatalog(payload) {
    return this.post("saveIndicatorCatalog", payload);
  }

  async deleteIndicatorCatalog(payload) {
    return this.post("deleteIndicatorCatalog", payload);
  }

  async saveIndicatorValues(payload) {
    return this.post("saveIndicatorValues", payload);
  }

  async saveIndicatorIssue(payload) {
    return this.post("saveIndicatorIssue", payload);
  }

  async deleteIndicatorIssue(payload) {
    return this.post("deleteIndicatorIssue", payload);
  }

  async get(action, params = {}) {
    return withTimeout(this.jsonpRequest(action, params), this.timeoutMs);
  }

  async post(action, payload = {}) {
    return withTimeout(this.bridgeRequest(action, payload), this.timeoutMs);
  }

  jsonpRequest(action, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `__gasJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const query = new URLSearchParams({
        action,
        callback: callbackName,
        requestId: callbackName,
        ...Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
        ),
      });

      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (packet) => {
        cleanup();
        if (!packet?.success) {
          reject(new Error(packet?.error || "Request failed"));
          return;
        }
        resolve(packet.data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("ไม่สามารถเชื่อมต่อ GAS API ได้"));
      };

      script.src = `${this.baseUrl}?${query.toString()}`;
      document.body.appendChild(script);
    });
  }

  bridgeRequest(action, payload = {}) {
    return new Promise((resolve, reject) => {
      const iframeName = `gasBridge_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const iframe = document.createElement("iframe");
      const form = document.createElement("form");
      const payloadInput = document.createElement("input");
      const actionInput = document.createElement("input");
      const transportInput = document.createElement("input");

      const cleanup = () => {
        window.removeEventListener("message", handleMessage);
        iframe.remove();
        form.remove();
      };

      const handleMessage = (event) => {
        if (event.source !== iframe.contentWindow) {
          return;
        }
        cleanup();
        if (!event.data?.success) {
          reject(new Error(event.data?.error || "Request failed"));
          return;
        }
        resolve(event.data.data);
      };

      iframe.name = iframeName;
      iframe.className = "hidden";
      document.body.appendChild(iframe);

      form.method = "POST";
      form.action = this.baseUrl;
      form.target = iframeName;
      form.className = "hidden";

      actionInput.name = "action";
      actionInput.value = action;
      form.appendChild(actionInput);

      transportInput.name = "transport";
      transportInput.value = "postMessage";
      form.appendChild(transportInput);

      payloadInput.name = "payload";
      payloadInput.value = JSON.stringify(payload);
      form.appendChild(payloadInput);

      document.body.appendChild(form);
      window.addEventListener("message", handleMessage);
      form.submit();
    });
  }
}
