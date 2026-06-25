import { ACTIVITY_12_MONTH_KEYS, ACTIVITY_MAP, AUTOSAVE_DEBOUNCE_MS } from "./constants.js";
import { clearCacheByPrefix, createStore, getCache, setCache } from "./store.js";
import {
  $,
  $all,
  buildRouteHash,
  clone,
  createFiscalMonthsPayload,
  debounce,
  escapeHtml,
  getFiscalYear,
  parseHash,
  readFilesAsBase64,
  wait,
} from "./utils.js";
import { GasApiClient } from "./api.js";
import {
  createEmptyRow,
  renderAppShell,
  renderConfirmModal,
  renderDynamicRow,
  renderFilePreviews,
  renderHomePage,
  renderIndicatorIssueModal,
  renderIndicatorModal,
  renderIndicatorValuesModal,
  renderParticipantRow,
  renderRecordDetailModal,
  renderRecordFormModal,
  renderReportModal,
  renderShellSkeleton,
  renderToast,
  renderActivityPickerModalV2,
  renderUnitPage,
  renderUnitPickerModalV2,
} from "./views.js";

const config = window.APP_CONFIG;
const appRoot = document.getElementById("appRoot");
const modalRoot = document.getElementById("modalRoot");
const toastRoot = document.getElementById("toastRoot");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingTitle = document.getElementById("loadingTitle");
const loadingMessage = document.getElementById("loadingMessage");

function createClientId(prefix = "id") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

class EnterpriseNurseApp {
  constructor(appConfig) {
    this.config = appConfig;
    this.store = createStore();
    this.api = new GasApiClient(appConfig);
    this.modalFiles = [];
    this.modalRetainedAttachments = [];
    this.draftSaver = debounce(() => this.saveDraftFromModal(), AUTOSAVE_DEBOUNCE_MS);
  }

  async init() {
    appRoot.innerHTML = renderShellSkeleton(this.config);
    this.bindEvents();
    await this.bootstrap();
  }

  bindEvents() {
    window.addEventListener("hashchange", () => this.handleRouteChange());
    appRoot.addEventListener("click", (event) => this.handleActionClick(event));
    modalRoot.addEventListener("click", (event) => this.handleModalClick(event));
    modalRoot.addEventListener("submit", (event) => this.handleModalSubmit(event));
    modalRoot.addEventListener("change", (event) => this.handleModalChange(event));
    modalRoot.addEventListener("input", () => this.draftSaver());
    modalRoot.addEventListener("dragover", (event) => this.handleDragOver(event));
    modalRoot.addEventListener("dragleave", (event) => this.handleDragLeave(event));
    modalRoot.addEventListener("drop", (event) => this.handleDrop(event));
    appRoot.addEventListener("change", (event) => this.handleAppChange(event));
    appRoot.addEventListener("input", (event) => this.handleAppInput(event));
  }

  async bootstrap() {
    this.showLoader("กำลังโหลดระบบ", "กำลังเชื่อมต่อข้อมูล");
    try {
      const bootstrap = await this.api.bootstrap({ fiscalYear: this.store.selectedFiscalYear || getFiscalYear() });
      this.store.bootstrap = bootstrap;
      this.store.selectedFiscalYear = bootstrap.currentFiscalYear || getFiscalYear();
      const route = parseHash();
      if (!window.location.hash) {
        this.navigate({ name: "home" }, true);
        return;
      }
      await this.applyRoute(route);
    } catch (error) {
      this.renderFatal(error);
    } finally {
      this.hideLoader();
    }
  }

  async handleRouteChange() {
    await this.applyRoute(parseHash());
  }

  async applyRoute(route) {
    if (!this.store.bootstrap) {
      return;
    }
    this.store.route = route;
    if (route.unitName) {
      this.store.selectedUnit = route.unitName;
    }

    if (route.name === "home") {
      this.renderHome();
      return;
    }

    if (!this.unitExists(route.unitName)) {
      this.navigate({ name: "home" }, true);
      return;
    }

    this.showLoader("กำลังโหลดแดชบอร์ด", `กำลังเตรียมข้อมูลของ ${route.unitName}`);
    try {
      const dashboardPromise = this.getUnitDashboard(route.unitName, this.store.selectedFiscalYear);
      const activityPromise = route.name === "unit-activity"
        ? route.activityId === "12"
          ? this.getActivity12(route.unitName, this.store.selectedFiscalYear)
          : this.getActivityRecords(route.unitName, route.activityId, this.store.selectedFiscalYear)
        : Promise.resolve(null);
      const [dashboard, activityData] = await Promise.all([dashboardPromise, activityPromise]);
      this.renderUnit(route, dashboard, activityData);
    } catch (error) {
      this.showToast(error.message, "error");
      this.renderFatal(error);
    } finally {
      this.hideLoader();
    }
  }

  renderHome() {
    appRoot.innerHTML = renderHomePage({
      config: this.config,
      bootstrap: this.store.bootstrap,
      fiscalYear: this.store.selectedFiscalYear,
    });
  }

  renderUnit(route, dashboard, activityData) {
    appRoot.innerHTML = renderUnitPage({
      config: this.config,
      bootstrap: this.store.bootstrap,
      route,
      fiscalYear: this.store.selectedFiscalYear,
      dashboard,
      activityData,
    });
  }

  renderFatal(error) {
    appRoot.innerHTML = renderAppShell({
      config: this.config,
      route: { name: "home" },
      bootstrap: this.store.bootstrap || {
        availableFiscalYears: [this.store.selectedFiscalYear || getFiscalYear()],
      },
      selectedUnit: "",
      fiscalYear: this.store.selectedFiscalYear || getFiscalYear(),
      content: `
        <section class="workspace workspace--home">
          <div class="empty-state">
            <h2>ไม่สามารถโหลดข้อมูลได้</h2>
            <p>${escapeHtml(error.message || "Unknown error")}</p>
            <button class="button" data-action="reload-page">ลองใหม่</button>
          </div>
        </section>
      `,
    });
  }

  navigate(route, replace = false) {
    const hash = buildRouteHash(route);
    if (replace) {
      history.replaceState(null, "", hash);
      this.applyRoute(route);
      return;
    }
    if (window.location.hash === hash) {
      this.applyRoute(route);
      return;
    }
    window.location.hash = hash;
  }

  async getUnitDashboard(unitName, fiscalYear, forceRefresh = false) {
    const cacheKey = `dashboard:${unitName}:${fiscalYear}`;
    if (!forceRefresh) {
      const cached = getCache(this.store, cacheKey);
      if (cached) {
        return cached;
      }
    }
    const data = await this.api.getDashboard(unitName, fiscalYear);
    return setCache(this.store, cacheKey, data);
  }

  async getActivityRecords(unitName, activityId, fiscalYear, forceRefresh = false) {
    const cacheKey = `records:${unitName}:${activityId}:${fiscalYear}`;
    if (!forceRefresh) {
      const cached = getCache(this.store, cacheKey);
      if (cached) {
        return cached;
      }
    }
    const result = await this.api.getActivityRecords(unitName, activityId, fiscalYear);
    const data = { ...result, allRecords: (result.records || []).slice(), searchValue: "", page: 1 };
    return setCache(this.store, cacheKey, data);
  }

  async getActivity12(unitName, fiscalYear, forceRefresh = false) {
    const cacheKey = `activity12:${unitName}:${fiscalYear}`;
    if (!forceRefresh) {
      const cached = getCache(this.store, cacheKey);
      if (cached) {
        return cached;
      }
    }
    const result = await this.api.getActivity12(unitName, fiscalYear);
    const data = this.decorateActivity12(result);
    return setCache(this.store, cacheKey, data);
  }

  decorateActivity12(result) {
    const valueMap = Object.fromEntries((result.values || []).map((item) => [item.indicatorId, item.payload || {}]));
    return {
      ...result,
      searchValue: "",
      valueMap,
      filteredCatalog: result.catalog || [],
    };
  }

  getCurrentActivityCacheKey() {
    const route = this.store.route;
    return route.activityId === "12"
      ? `activity12:${route.unitName}:${this.store.selectedFiscalYear}`
      : `records:${route.unitName}:${route.activityId}:${this.store.selectedFiscalYear}`;
  }

  getCurrentActivityData() {
    return getCache(this.store, this.getCurrentActivityCacheKey());
  }

  setCurrentActivityData(data) {
    return setCache(this.store, this.getCurrentActivityCacheKey(), data);
  }

  handleActionClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }
    const action = target.dataset.action;

    if (action === "reload-page") {
      window.location.reload();
      return;
    }
    if (action === "go-home") {
      this.navigate({ name: "home" });
      return;
    }
    if (action === "open-unit-picker") {
      this.openUnitPicker();
      return;
    }
    if (action === "open-activity-picker") {
      this.openActivityPicker();
      return;
    }
    if (action === "open-unit-dashboard") {
      this.navigate({ name: "unit-dashboard", unitName: target.dataset.unit });
      return;
    }
    if (action === "open-activity") {
      this.navigate({
        name: "unit-activity",
        unitName: target.dataset.unit,
        activityId: target.dataset.activity,
      });
      return;
    }
    if (action === "pick-unit") {
      this.closeModal();
      this.navigate({ name: "unit-dashboard", unitName: target.dataset.unit });
      return;
    }
    if (action === "confirm-pick-unit") {
      const unitSelect = $("#unitPickerSelect", modalRoot);
      const unitName = String(unitSelect?.value || "").trim();
      if (!unitName) {
        this.showToast("กรุณาเลือกหน่วยงานก่อนเข้าสู่ระบบ", "error");
        return;
      }
      this.closeModal();
      this.navigate({ name: "unit-dashboard", unitName });
      return;
    }
    if (action === "new-record") {
      this.openRecordModal(target.dataset.activity);
      return;
    }
    if (action === "edit-record" || action === "view-record" || action === "delete-record") {
      this.handleRecordAction(action, target.dataset.recordId, target.dataset.activity);
      return;
    }
    if (action === "change-activity-page") {
      this.updateActivityPage(Number(target.dataset.page || 1));
      return;
    }
    if (action === "new-indicator") {
      this.openIndicatorModal();
      return;
    }
    if (action === "edit-indicator" || action === "delete-indicator" || action === "edit-indicator-values") {
      this.handleIndicatorAction(action, target.dataset.indicatorId);
      return;
    }
    if (action === "new-indicator-issue" || action === "edit-indicator-issue" || action === "delete-indicator-issue") {
      this.handleIndicatorIssueAction(action, target.dataset.issueId);
      return;
    }
    if (action === "open-org-report") {
      this.openReport("__all__", "รายงานภาพรวมทั้งองค์กร");
      return;
    }
    if (action === "open-unit-report") {
      this.openReport(target.dataset.unit, `รายงานหน่วยงาน ${target.dataset.unit}`);
      return;
    }
  }

  handleAppChange(event) {
    const target = event.target;
    if (target.dataset.action === "change-fiscal-year") {
      this.store.selectedFiscalYear = Number(target.value);
      clearCacheByPrefix(this.store, "dashboard:");
      clearCacheByPrefix(this.store, "records:");
      clearCacheByPrefix(this.store, "activity12:");
      if (this.store.route.name === "home") {
        this.refreshHomeForYear();
      } else {
        this.applyRoute(this.store.route);
      }
      return;
    }
  }

  handleAppInput(event) {
    const target = event.target;
    if (target.dataset.action === "update-activity-search") {
      this.updateActivitySearch(target.value);
      return;
    }
    if (target.dataset.action === "update-activity12-search") {
      this.updateActivity12Filters({ searchValue: target.value });
    }
  }

  async refreshHomeForYear() {
    this.showLoader("กำลังเปลี่ยนปีงบประมาณ", "กำลังอัปเดตแดชบอร์ดภาพรวม");
    try {
      const bootstrap = await this.api.bootstrap({ fiscalYear: this.store.selectedFiscalYear });
      this.store.bootstrap = {
        ...bootstrap,
        currentFiscalYear: this.store.selectedFiscalYear,
      };
      this.renderHome();
    } catch (error) {
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }

  handleModalClick(event) {
    const overlay = event.target.closest(".modal-overlay");
    const actionTarget = event.target.closest("[data-action]");
    if (overlay && event.target === overlay && overlay.dataset.closeOverlay !== "false") {
      this.closeModal();
      return;
    }
    if (!actionTarget) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const action = actionTarget.dataset.action;
    if (action === "close-modal" || action === "close-modal-overlay") {
      this.closeModal();
      return;
    }
    if (action === "pick-activity") {
      const activityId = String(actionTarget.dataset.activity || "").trim();
      if (!activityId) {
        this.showToast("กรุณาเลือกกิจกรรม", "error");
        return;
      }
      this.closeModal();
      this.navigate({
        name: "unit-activity",
        unitName: this.store.route.unitName,
        activityId,
      });
      return;
    }
    if (action === "confirm-pick-unit") {
      const unitSelect = $("#unitPickerSelect", modalRoot);
      const unitName = String(unitSelect?.value || "").trim();
      if (!unitName) {
        this.showToast("กรุณาเลือกหน่วยงานก่อนเข้าสู่ระบบ", "error");
        return;
      }
      this.closeModal();
      this.navigate({ name: "unit-dashboard", unitName });
      return;
    }
    if (action === "add-participant-row") {
      this.appendParticipantRow();
      return;
    }
    if (action === "remove-participant-row") {
      actionTarget.closest(".participant-row")?.remove();
      this.draftSaver();
      return;
    }
    if (action === "add-record-row") {
      this.appendDynamicRow(actionTarget);
      return;
    }
    if (action === "activity3-next-step") {
      this.showActivity3Step(2);
      return;
    }
    if (action === "activity3-prev-step") {
      this.showActivity3Step(1);
      return;
    }
    if (action === "remove-record-row") {
      actionTarget.closest(".dynamic-row")?.remove();
      if (!ACTIVITY_MAP[this.store.route.activityId]?.modeField) {
        this.renumberDynamicRows();
      }
      this.draftSaver();
      return;
    }
    if (action === "remove-existing-file") {
      this.modalRetainedAttachments = this.modalRetainedAttachments.filter(
        (item) => (item.fileId || item.name) !== actionTarget.dataset.fileId,
      );
      this.refreshFilePreviewList();
      this.draftSaver();
      return;
    }
    if (action === "remove-new-file") {
      this.modalFiles.splice(Number(actionTarget.dataset.fileIndex), 1);
      this.refreshFilePreviewList();
      this.draftSaver();
      return;
    }
    if (action === "clear-record-draft") {
      this.clearDraftForModal();
      return;
    }
    if (action === "confirm-delete-record") {
      this.confirmDeleteRecord(actionTarget.dataset.recordId);
      return;
    }
    if (action === "confirm-delete-indicator") {
      this.confirmDeleteIndicator(actionTarget.dataset.indicatorId);
      return;
    }
    if (action === "confirm-delete-indicator-issue") {
      this.confirmDeleteIndicatorIssue(actionTarget.dataset.issueId);
      return;
    }
    if (action === "print-report") {
      window.print();
    }
  }

  async handleModalSubmit(event) {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form) {
      return;
    }
    const formType = form.dataset.formType;
    if (formType === "record") {
      await this.submitRecordForm(form);
      return;
    }
    if (formType === "indicator") {
      await this.submitIndicatorForm(form);
      return;
    }
    if (formType === "indicator-values") {
      await this.submitIndicatorValuesForm(form);
      return;
    }
    if (formType === "indicator-issue") {
      await this.submitIndicatorIssueForm(form);
    }
  }

  handleModalChange(event) {
    const target = event.target;
    if (target.dataset.fileInput !== undefined) {
      this.appendFiles(target.files);
      return;
    }
    if (target.dataset.rowTypeSelect !== undefined) {
      this.changeDynamicRowType(target);
      return;
    }
    if (target.dataset.activity3Mode !== undefined) {
      this.updateActivity3Mode(target.value);
    }
  }

  handleDragOver(event) {
    const dropzone = event.target.closest("[data-dropzone]");
    if (!dropzone) {
      return;
    }
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  }

  handleDragLeave(event) {
    const dropzone = event.target.closest("[data-dropzone]");
    if (!dropzone) {
      return;
    }
    dropzone.classList.remove("is-dragover");
  }

  handleDrop(event) {
    const dropzone = event.target.closest("[data-dropzone]");
    if (!dropzone) {
      return;
    }
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    this.appendFiles(event.dataTransfer?.files);
  }

  openUnitPicker() {
    modalRoot.innerHTML = renderUnitPickerModalV2(this.store.bootstrap.units || []);
  }

  openActivityPicker() {
    if (!this.store.route.unitName) {
      return;
    }
    modalRoot.innerHTML = renderActivityPickerModalV2({
      unitName: this.store.route.unitName,
      activityCounts: getCache(
        this.store,
        `dashboard:${this.store.route.unitName}:${this.store.selectedFiscalYear}`,
      )?.activityCounts || {},
    });
  }

  async handleRecordAction(action, recordId, activityId) {
    const data = await this.getActivityRecords(this.store.route.unitName, activityId, this.store.selectedFiscalYear);
    const record = (data.records || []).find((item) => item.recordId === recordId);
    if (!record) {
      this.showToast("ไม่พบข้อมูลรายการที่เลือก", "error");
      return;
    }
    if (action === "view-record") {
      modalRoot.innerHTML = renderRecordDetailModal({ definition: ACTIVITY_MAP[activityId], record });
      return;
    }
    if (action === "edit-record") {
      this.openRecordModal(activityId, record);
      return;
    }
    modalRoot.innerHTML = renderConfirmModal({
      title: "ยืนยันการลบรายการ",
      message: "ต้องการลบรายการบันทึกนี้ใช่หรือไม่",
      confirmAction: "confirm-delete-record",
      payload: { recordId },
    });
  }

  openRecordModal(activityId, record = null) {
    const definition = ACTIVITY_MAP[activityId];
    const draft = this.getDraftForRecord(activityId, record?.recordId);
    this.modalFiles = [];
    this.modalRetainedAttachments = clone(record?.attachments || draft?.attachments || []);
    modalRoot.innerHTML = renderRecordFormModal({
      config: this.config,
      unitName: this.store.route.unitName,
      fiscalYear: this.store.selectedFiscalYear,
      definition,
      record,
      draft,
      relatedRecords: this.getCurrentActivityData()?.records || [],
    });
    this.refreshFilePreviewList();
    if (activityId === "3") {
      this.showActivity3Step(1);
    }
  }

  appendParticipantRow() {
    const container = $("[data-participants-list]", modalRoot);
    if (!container) {
      return;
    }
    container.insertAdjacentHTML("beforeend", renderParticipantRow({ name: "" }, container.children.length));
    this.draftSaver();
  }

  appendDynamicRow(actionTarget = null) {
    const definition = ACTIVITY_MAP[this.store.route.activityId];
    const activePanel = actionTarget?.closest("[data-activity3-mode-panel]");
    const container = activePanel
      ? $("[data-dynamic-rows]", activePanel)
      : $("[data-dynamic-rows]", modalRoot);
    if (!container || !definition) {
      return;
    }
    const rowType = container.dataset.rowType || this.getActivity3Mode() || "";
    container.insertAdjacentHTML(
      "beforeend",
      renderDynamicRow(definition, createEmptyRow(definition, rowType), container.children.length),
    );
    this.draftSaver();
  }

  renumberDynamicRows() {
    const definition = ACTIVITY_MAP[this.store.route.activityId];
    const container = this.getActiveDynamicRowsContainer();
    if (!container || !definition) {
      return;
    }
    const rows = $all(".dynamic-row", container).map((rowElement) => {
      const rowType = this.getRowTypeFromElement(definition, rowElement);
      return this.getRowFields(definition, rowType).reduce((row, field) => {
        row[field.name] = $(`[name$="__${field.name}"]`, rowElement)?.value || "";
        return row;
      }, definition.rowTypes?.length ? { __rowType: rowType } : {});
    });
    container.innerHTML = rows.map((row, index) => renderDynamicRow(definition, row, index)).join("");
  }

  getActiveDynamicRowsContainer() {
    const containers = $all("[data-dynamic-rows]", modalRoot);
    return containers.find((container) => !container.closest(".hidden")) || containers[0];
  }

  showActivity3Step(step) {
    $all("[data-activity3-step]", modalRoot).forEach((element) => {
      const isHidden = element.dataset.activity3Step !== String(step);
      element.classList.toggle("hidden", isHidden);
      
      // Toggle required attribute based on step visibility
      $all("[data-required='true']", element).forEach((input) => {
        if (isHidden) {
          input.removeAttribute("required");
        } else {
          input.setAttribute("required", "");
        }
      });
    });

    // Control submit button visibility in footer
    const submitBtn = $("[type='submit']", modalRoot);
    if (submitBtn) {
      if (step === 1) {
        submitBtn.style.display = "none";
      } else {
        submitBtn.style.display = "";
      }
    }

    if (step === 2) {
      this.updateActivity3Mode(this.getActivity3Mode());
    }
  }

  updateActivity3Mode(mode) {
    const selectedMode = mode || "incident";
    $all("[data-activity3-mode-panel]", modalRoot).forEach((panel) => {
      const isHidden = panel.dataset.activity3ModePanel !== selectedMode;
      panel.classList.toggle("hidden", isHidden);

      // Toggle required attribute based on panel visibility
      $all("[data-required='true']", panel).forEach((input) => {
        if (isHidden) {
          input.removeAttribute("required");
        } else {
          input.setAttribute("required", "");
        }
      });
    });
    this.draftSaver();
  }

  getActivity3Mode() {
    return String($("[data-activity3-mode]", modalRoot)?.value || "");
  }

  changeDynamicRowType(selectElement) {
    const definition = ACTIVITY_MAP[this.store.route.activityId];
    const rowElement = selectElement.closest(".dynamic-row");
    const container = $("[data-dynamic-rows]", modalRoot);
    if (!definition || !rowElement || !container) {
      return;
    }
    const index = Number(rowElement.dataset.dynamicRow || 0);
    const rowType = String(selectElement.value || "");
    const nextRow = this.getRowFields(definition, rowType).reduce((row, field) => {
      row[field.name] = "";
      return row;
    }, { __rowType: rowType });
    rowElement.outerHTML = renderDynamicRow(definition, nextRow, index);
    this.renumberDynamicRows();
    this.draftSaver();
  }

  appendFiles(files) {
    const incomingFiles = Array.from(files || []);
    if (!incomingFiles.length) {
      return;
    }
    const maxFiles = Number(this.config.attachments.maxFiles || 5);
    const remaining = maxFiles - this.modalRetainedAttachments.length - this.modalFiles.length;
    if (remaining <= 0) {
      this.showToast(`แนบไฟล์ได้สูงสุด ${maxFiles} ไฟล์`, "error");
      return;
    }
    const limitedFiles = incomingFiles.slice(0, remaining);
    this.modalFiles.push(...limitedFiles);
    this.refreshFilePreviewList();
    this.draftSaver();
  }

  refreshFilePreviewList() {
    const preview = $("[data-file-preview-list]", modalRoot);
    if (!preview) {
      return;
    }
    preview.innerHTML = renderFilePreviews(this.modalRetainedAttachments, this.modalFiles);
  }

  serializeRecordForm(form) {
    const definition = ACTIVITY_MAP[form.dataset.activityId];
    const formData = new FormData(form);
    const participants = formData
      .getAll("participantName[]")
      .map((value) => ({ name: String(value || "").trim() }))
      .filter((item) => item.name);

    const meta = {};
    if (definition.modeField) {
      const value = String(formData.get(definition.modeField.name) || "").trim();
      if (value) {
        meta[definition.modeField.name] = value;
      }
    }
    (definition.summaryFields || []).forEach((field) => {
      const value = String(formData.get(field.name) || "").trim();
      if (value) {
        meta[field.name] = value;
      }
    });

    const selectedMode = meta[definition.modeField?.name] || "";
    const rowSelector = definition.modeField && selectedMode
      ? `[data-activity3-mode-panel="${selectedMode}"] .dynamic-row`
      : ".dynamic-row";
    const dynamicRows = $all(rowSelector, form).map((rowElement) => {
      const rowType = this.getRowTypeFromElement(definition, rowElement);
      return this.getRowFields(definition, rowType).reduce((row, field) => {
        const input = $(`[name$="__${field.name}"]`, rowElement);
        row[field.name] = input?.value?.trim?.() ?? String(input?.value || "").trim();
        return row;
      }, definition.rowTypes?.length ? { __rowType: rowType } : {});
    });

    dynamicRows.forEach((row, index) => {
      this.getRowFields(definition, row.__rowType).forEach((field) => {
        if (field.required && !row[field.name]) {
          throw new Error(`กรุณากรอก "${field.label}" ในรายการย่อยที่ ${index + 1}`);
        }
      });
    });

    return {
      recordId: form.dataset.recordId || createClientId("record"),
      createdAt: form.dataset.createdAt || new Date().toISOString(),
      unitName: this.store.route.unitName,
      activityId: definition.id,
      activityLabel: definition.title,
      fiscalYear: this.store.selectedFiscalYear,
      reviewDate: String(formData.get("reviewDate") || "").trim(),
      reviewLeader: String(formData.get("reviewLeader") || "").trim(),
      participants,
      meta,
      rows: dynamicRows.filter((row) => this.hasMeaningfulRowValue(row)),
      note: String(formData.get("note") || "").trim(),
      retainedAttachments: this.modalRetainedAttachments,
    };
  }

  getRowTypeFromElement(definition, rowElement) {
    if (definition.modeField) {
      return rowElement.closest("[data-row-type]")?.dataset.rowType || this.getActivity3Mode() || definition.modeField.options[0]?.value || "";
    }
    return definition.rowTypes?.length
      ? String($("[data-row-type-select]", rowElement)?.value || definition.rowTypes[0].key || "")
      : "";
  }

  getRowFields(definition, rowType = "") {
    if (!definition.rowTypes?.length) {
      return definition.rowFields || [];
    }
    return definition.rowTypes.find((type) => type.key === rowType)?.fields || definition.rowTypes[0].fields || [];
  }

  hasMeaningfulRowValue(row) {
    return Object.entries(row).some(([key, value]) => key !== "__rowType" && Boolean(value));
  }

  canSaveWithoutRows(payload) {
    if (payload.activityId !== "3" || payload.meta?.recordMode !== "summary") {
      return false;
    }
    return ["referCount", "referCause", "transferRequestCount", "transferRequestCause", "refusalCount", "refusalCause"]
      .some((key) => Boolean(payload.meta?.[key]));
  }

  async submitRecordForm(form) {
    let payload;
    try {
      payload = this.serializeRecordForm(form);
      if (!payload.reviewDate || !payload.reviewLeader) {
        const leaderLabel = ACTIVITY_MAP[payload.activityId]?.leaderLabel || "ผู้นำการทบทวน";
        throw new Error(`กรุณากรอกวันที่ทบทวนและ${leaderLabel}`);
      }
      if (!payload.rows.length && !this.canSaveWithoutRows(payload)) {
        throw new Error("กรุณาเพิ่มรายการย่อยอย่างน้อย 1 รายการ");
      }
      this.showLoader("กำลังบันทึกข้อมูล", "กำลังอัปโหลดไฟล์และบันทึกลงฐานข้อมูล");
      const newAttachments = await readFilesAsBase64(this.modalFiles);
      await this.api.saveActivityRecord({ ...payload, newAttachments });
      this.clearDraftForModal(true);
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      if (payload && this.isRequestTimeoutError(error) && await this.reconcileSavedRecord(payload)) {
        await this.finalizeRecoveredSave("บันทึกข้อมูลเรียบร้อยแล้ว");
        return;
      }
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }
  async confirmDeleteRecord(recordId) {
    try {
    this.showLoader("กำลังลบข้อมูล", "กรุณารอสักครู่");
      await this.api.deleteActivityRecord({ recordId });
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("ลบรายการเรียบร้อยแล้ว");
    } catch (error) {
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }

  handleIndicatorAction(action, indicatorId) {
    const data = this.getCurrentActivityData();
    const indicator = data?.catalog?.find((item) => item.indicatorId === indicatorId);
    if (!indicator) {
      return;
    }
    if (action === "edit-indicator") {
      modalRoot.innerHTML = renderIndicatorModal({ indicator, unitName: this.store.route.unitName });
      return;
    }
    if (action === "edit-indicator-values") {
      modalRoot.innerHTML = renderIndicatorValuesModal({
        indicator,
        valuePayload: data.valueMap?.[indicatorId] || createFiscalMonthsPayload(),
        fiscalYear: this.store.selectedFiscalYear,
      });
      return;
    }
    modalRoot.innerHTML = renderConfirmModal({
      title: "ยืนยันการลบเครื่องชี้วัด",
      message: "ต้องการลบเครื่องชี้วัดนี้ใช่หรือไม่",
      confirmAction: "confirm-delete-indicator",
      payload: { indicatorId },
    });
  }

  openIndicatorModal() {
    modalRoot.innerHTML = renderIndicatorModal({ indicator: null, unitName: this.store.route.unitName });
  }

  async submitIndicatorForm(form) {
    let payload;
    try {
      const formData = new FormData(form);
      this.showLoader("กำลังบันทึกเครื่องชี้วัด", "กำลังอัปเดตรายการกิจกรรมที่ 12");
      payload = {
        indicatorId: form.dataset.indicatorId || createClientId("indicator"),
        createdAt: form.dataset.createdAt || new Date().toISOString(),
        unitName: this.store.route.unitName,
        sectionKey: "",
        indicatorName: String(formData.get("indicatorName") || "").trim(),
        targetValue: String(formData.get("targetValue") || "").trim(),
        targetUnit: String(formData.get("targetUnit") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        sortOrder: Number(formData.get("sortOrder") || 0),
      };
      await this.api.saveIndicatorCatalog(payload);
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("บันทึกเครื่องชี้วัดเรียบร้อยแล้ว");
    } catch (error) {
      if (payload && this.isRequestTimeoutError(error) && await this.reconcileSavedIndicator(payload.indicatorId)) {
        await this.finalizeRecoveredSave("บันทึกเครื่องชี้วัดเรียบร้อยแล้ว");
        return;
      }
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }
  async submitIndicatorValuesForm(form) {
    let indicatorId = "";
    try {
      const data = this.getCurrentActivityData();
      const indicator = data?.catalog?.find((item) => item.indicatorId === form.dataset.indicatorId);
      if (!indicator) {
        throw new Error("ไม่พบเครื่องชี้วัด");
      }
      indicatorId = indicator.indicatorId;
      const formData = new FormData(form);
      const payload = createFiscalMonthsPayload(
        Object.fromEntries(ACTIVITY_12_MONTH_KEYS.map((key) => [key, String(formData.get(key) || "").trim()])),
      );
      payload.summary = String(formData.get("summary") || "").trim();
      payload.remark = String(formData.get("remark") || "").trim();
      this.showLoader("กำลังบันทึกผลตัวชี้วัด", "กำลังอัปเดตข้อมูลรายปีงบประมาณ");
      await this.api.saveIndicatorValues({
        unitName: this.store.route.unitName,
        fiscalYear: this.store.selectedFiscalYear,
        items: [
          {
            indicatorId: indicator.indicatorId,
            sectionKey: "",
            payload,
          },
        ],
      });
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("บันทึกผลตัวชี้วัดเรียบร้อยแล้ว");
    } catch (error) {
      if (indicatorId && this.isRequestTimeoutError(error) && await this.reconcileSavedIndicatorValues(indicatorId)) {
        await this.finalizeRecoveredSave("บันทึกผลตัวชี้วัดเรียบร้อยแล้ว");
        return;
      }
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }
  handleIndicatorIssueAction(action, issueId) {
    const data = this.getCurrentActivityData();
    if (action === "new-indicator-issue") {
      modalRoot.innerHTML = renderIndicatorIssueModal({ issue: null, indicators: data?.catalog || [] });
      return;
    }
    const issue = data?.issues?.find((item) => item.issueId === issueId);
    if (!issue) {
      return;
    }
    if (action === "edit-indicator-issue") {
      modalRoot.innerHTML = renderIndicatorIssueModal({ issue, indicators: data?.catalog || [] });
      return;
    }
    modalRoot.innerHTML = renderConfirmModal({
      title: "ยืนยันการลบประเด็นติดตาม",
      message: "ต้องการลบประเด็นนี้ใช่หรือไม่",
      confirmAction: "confirm-delete-indicator-issue",
      payload: { issueId },
    });
  }

  async submitIndicatorIssueForm(form) {
    let payload;
    try {
      const data = this.getCurrentActivityData();
      const formData = new FormData(form);
      const indicator = data?.catalog?.find((item) => item.indicatorId === formData.get("indicatorId"));
      if (!indicator) {
        throw new Error("กรุณาเลือกเครื่องชี้วัด");
      }
      this.showLoader("กำลังบันทึกประเด็นติดตาม", "กำลังอัปเดตข้อมูลกิจกรรมที่ 12");
      payload = {
        issueId: form.dataset.issueId || createClientId("issue"),
        createdAt: form.dataset.createdAt || new Date().toISOString(),
        unitName: this.store.route.unitName,
        fiscalYear: this.store.selectedFiscalYear,
        sectionKey: "",
        indicatorId: indicator.indicatorId,
        indicatorName: indicator.indicatorName,
        problem: String(formData.get("problem") || "").trim(),
        actionPlan: String(formData.get("actionPlan") || "").trim(),
        followUp: String(formData.get("followUp") || "").trim(),
      };
      await this.api.saveIndicatorIssue(payload);
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("บันทึกประเด็นติดตามเรียบร้อยแล้ว");
    } catch (error) {
      if (payload && this.isRequestTimeoutError(error) && await this.reconcileSavedIndicatorIssue(payload.issueId)) {
        await this.finalizeRecoveredSave("บันทึกประเด็นติดตามเรียบร้อยแล้ว");
        return;
      }
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }
  async confirmDeleteIndicatorIssue(issueId) {
    try {
      this.showLoader("กำลังลบประเด็นติดตาม", "กรุณารอสักครู่");
      await this.api.deleteIndicatorIssue({ issueId });
      this.closeModal();
      await this.refreshAfterMutation();
      this.showToast("ลบประเด็นติดตามเรียบร้อยแล้ว");
    } catch (error) {
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }

  async refreshAfterMutation() {
    const { route } = this.store;
    if (route.unitName) {
      clearCacheByPrefix(this.store, `dashboard:${route.unitName}:`);
      clearCacheByPrefix(this.store, `records:${route.unitName}:`);
      clearCacheByPrefix(this.store, `activity12:${route.unitName}:`);
    }
    clearCacheByPrefix(this.store, "dashboard:");

    const unitExists = route.unitName && this.store.bootstrap?.units?.some(u => u.unitName === route.unitName);
    if (route.unitName && !unitExists) {
      const orgBootstrap = await this.api.bootstrap({ fiscalYear: this.store.selectedFiscalYear });
      this.store.bootstrap = orgBootstrap;
    }

    await this.applyRoute(this.store.route);
  }

  updateActivityPage(page) {
    const data = this.getCurrentActivityData();
    if (!data) {
      return;
    }
    data.page = page;
    this.setCurrentActivityData(data);
    this.renderUnit(this.store.route, getCache(this.store, `dashboard:${this.store.route.unitName}:${this.store.selectedFiscalYear}`), data);
  }

  updateActivitySearch(value) {
    const rawData = getCache(this.store, `records:${this.store.route.unitName}:${this.store.route.activityId}:${this.store.selectedFiscalYear}`);
    if (!rawData) {
      return;
    }
    const searchValue = String(value || "").trim().toLowerCase();
    const sourceRecords = rawData.allRecords || rawData.records || [];
    rawData.allRecords = sourceRecords;
    rawData.searchValue = value;
    rawData.page = 1;
    rawData.records = searchValue
      ? sourceRecords.filter((record) => JSON.stringify(record).toLowerCase().includes(searchValue))
      : sourceRecords.slice();
    this.setCurrentActivityData(rawData);
    this.renderUnit(this.store.route, getCache(this.store, `dashboard:${this.store.route.unitName}:${this.store.selectedFiscalYear}`), rawData);
  }

  updateActivity12Filters(changes) {
    const data = this.getCurrentActivityData();
    if (!data) {
      return;
    }
    data.searchValue = changes.searchValue ?? data.searchValue;
    const searchValue = String(data.searchValue || "").trim().toLowerCase();
    data.filteredCatalog = (data.catalog || []).filter((indicator) => {
      const haystack = `${indicator.indicatorName} ${indicator.description} ${indicator.targetValue}`.toLowerCase();
      const matchesSearch = !searchValue || haystack.includes(searchValue);
      return matchesSearch;
    });
    this.setCurrentActivityData(data);
    this.renderUnit(this.store.route, getCache(this.store, `dashboard:${this.store.route.unitName}:${this.store.selectedFiscalYear}`), data);
  }

  isRequestTimeoutError(error) {
    return /timeout/i.test(String(error?.message || ""));
  }

  async reconcileSavedRecord(payload) {
    return this.retryReconcile(async () => {
      const data = await this.getActivityRecords(payload.unitName, payload.activityId, payload.fiscalYear, true);
      return (data?.records || []).some((record) => record.recordId === payload.recordId);
    });
  }

  async reconcileSavedIndicator(indicatorId) {
    return this.retryReconcile(async () => {
      const data = await this.getActivity12(this.store.route.unitName, this.store.selectedFiscalYear, true);
      return (data?.catalog || []).some((item) => item.indicatorId === indicatorId);
    });
  }

  async reconcileSavedIndicatorValues(indicatorId) {
    return this.retryReconcile(async () => {
      const data = await this.getActivity12(this.store.route.unitName, this.store.selectedFiscalYear, true);
      return Boolean(data?.valueMap?.[indicatorId] || (data?.values || []).find((item) => item.indicatorId === indicatorId));
    });
  }

  async reconcileSavedIndicatorIssue(issueId) {
    return this.retryReconcile(async () => {
      const data = await this.getActivity12(this.store.route.unitName, this.store.selectedFiscalYear, true);
      return (data?.issues || []).some((item) => item.issueId === issueId);
    });
  }

  async retryReconcile(checkSaved) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) {
        await wait(1500);
      }
      if (await checkSaved()) {
        return true;
      }
    }
    return false;
  }

  async finalizeRecoveredSave(successMessage) {
    this.clearDraftForModal(true);
    this.closeModal();
    await this.refreshAfterMutation();
    this.showToast(successMessage);
  }

  async openReport(scope, scopeLabel) {
    try {
      this.showLoader("กำลังสร้างรายงาน", "กำลังประมวลผลข้อมูลสำหรับรายงานสำหรับพิมพ์");
      const bundle = await this.api.getReportBundle(scope, this.store.selectedFiscalYear);
      modalRoot.innerHTML = renderReportModal({ bundle, scopeLabel });
    } catch (error) {
      this.showToast(error.message, "error");
    } finally {
      this.hideLoader();
    }
  }

  closeModal() {
    modalRoot.innerHTML = "";
    this.modalFiles = [];
    this.modalRetainedAttachments = [];
  }

  showLoader(title, message) {
    loadingTitle.textContent = title;
    loadingMessage.textContent = message;
    loadingOverlay.classList.remove("hidden");
  }

  hideLoader() {
    loadingOverlay.classList.add("hidden");
  }

  showToast(message, tone = "success") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderToast(message, tone);
    const toast = wrapper.firstElementChild;
    toastRoot.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3600);
  }

  unitExists(unitName) {
    return (this.store.bootstrap.units || []).some((item) => item.unitName === unitName);
  }

  getDraftKey(activityId, recordId = "") {
    return `draft:${this.store.route.unitName}:${activityId}:${recordId || "new"}`;
  }

  getDraftForRecord(activityId, recordId = "") {
    const raw = window.localStorage.getItem(this.getDraftKey(activityId, recordId));
    return raw ? JSON.parse(raw) : null;
  }

  clearDraftForModal(silent = false) {
    const form = $("#recordForm", modalRoot);
    if (!form) {
      return;
    }
    const activityId = form.dataset.activityId;
    const recordId = form.dataset.recordId || "";
    window.localStorage.removeItem(this.getDraftKey(activityId, recordId));
    if (!silent) {
      this.showToast("ล้าง Draft เรียบร้อยแล้ว");
    }
  }

  saveDraftFromModal() {
    const form = $("#recordForm", modalRoot);
    if (!form) {
      return;
    }
    try {
      const payload = this.serializeRecordForm(form);
      payload.attachments = this.modalRetainedAttachments;
      window.localStorage.setItem(this.getDraftKey(payload.activityId, payload.recordId), JSON.stringify(payload));
    } catch (error) {
      // ignore incomplete draft states
    }
  }
}

const app = new EnterpriseNurseApp(config);
document.addEventListener("DOMContentLoaded", () => app.init());



