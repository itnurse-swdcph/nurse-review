(function() {
  const { apiBaseUrl, hospitalName, missionName, appName } = window.APP_CONFIG;
  const PAGE_SIZE = 10;
  const MONTHS = [
    { key: "oct", label: "ต.ค." },
    { key: "nov", label: "พ.ย." },
    { key: "dec", label: "ธ.ค." },
    { key: "jan", label: "ม.ค." },
    { key: "feb", label: "ก.พ." },
    { key: "mar", label: "มี.ค." },
    { key: "apr", label: "เม.ย." },
    { key: "may", label: "พ.ค." },
    { key: "jun", label: "มิ.ย." },
    { key: "jul", label: "ก.ค." },
    { key: "aug", label: "ส.ค." },
    { key: "sep", label: "ก.ย." },
  ];
  const SEVERITIES = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

  const ACTIVITY_DEFINITIONS = [
    {
      id: "1",
      shortTitle: "กิจกรรมที่ 1",
      title: "การทบทวนขณะดูแลผู้ป่วยขณะอยู่โรงพยาบาล C3-THER + H-E-L-P",
      fields: [
        { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date" },
        { name: "reviewMethod", label: "วิธีการทบทวน", type: "select", options: ["ทบทวนข้างเตียง", "Conference", "Grand Round", "Quality Round", "อื่น ๆ"] },
        { name: "summary", label: "สรุปเหตุการณ์", type: "textarea" },
        { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
      ],
    },
    {
      id: "2",
      shortTitle: "กิจกรรมที่ 2",
      title: "การทบทวนความคิดเห็น/คำร้องเรียนของผู้รับบริการ",
      fields: [
        { name: "eventDate", label: "วันที่รับเรื่อง", type: "date" },
        { name: "category", label: "ประเภท", type: "select", options: ["พฤติกรรมบริการ", "ระบบบริการ", "คุณภาพการดูแลรักษา", "สิ่งแวดล้อม/ความปลอดภัย", "สิทธิผู้ป่วยและจริยธรรม", "การสื่อสาร"] },
        { name: "topic", label: "สรุปประเด็น", type: "textarea" },
        { name: "resolution", label: "วิธีแก้ไข", type: "textarea" },
        { name: "result", label: "ผลการแก้ไข", type: "textarea" },
      ],
    },
    {
      id: "3",
      shortTitle: "กิจกรรมที่ 3",
      title: "การทบทวนการส่งต่อ/ขอย้าย/ปฏิเสธการรักษา",
      fields: [
        { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date" },
        { name: "transferType", label: "ประเภท", type: "select", options: ["ส่งต่อ", "ขอย้าย", "ปฏิเสธการรักษา"] },
        { name: "summary", label: "สรุปเหตุการณ์", type: "textarea" },
        { name: "issue", label: "ประเด็นสำคัญ", type: "textarea" },
        { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
      ],
    },
    {
      id: "4",
      shortTitle: "กิจกรรมที่ 4",
      title: "การทบทวนการตรวจรักษาโดยผู้ชำนาญกว่า/ผู้ที่มีคุณสมบัติไม่ครบ",
      fields: [
        { name: "eventDate", label: "วันที่ทบทวน", type: "date" },
        { name: "reviewType", label: "ลักษณะการทบทวน", type: "select", options: ["โดยผู้ชำนาญกว่า", "โดยผู้มีคุณสมบัติไม่ครบ", "กิจกรรมสุ่มตรวจ", "การปรับปรุงระบบ"] },
        { name: "topic", label: "สรุปเหตุการณ์", type: "textarea" },
        { name: "result", label: "ผลลัพธ์/แนวทางปรับปรุง", type: "textarea" },
      ],
    },
    {
      id: "5",
      shortTitle: "กิจกรรมที่ 5",
      title: "การค้นหาและป้องกันความเสี่ยง",
      fields: [
        { name: "riskName", label: "เรื่อง", type: "text" },
        { name: "incidentCount", label: "จำนวนครั้ง", type: "number" },
        { name: "riskType", label: "ประเภทความเสี่ยง", type: "select", options: ["ตาม Risk Profile", "ความเสี่ยงทางคลินิก", "ความเสี่ยงเฉพาะโรค", "ความเสี่ยงทั่วไป"] },
        { name: "correctiveAction", label: "วิธีแก้ไข", type: "textarea" },
        { name: "prevention", label: "วิธีป้องกัน", type: "textarea" },
        { name: "result", label: "ผลการแก้ไขป้องกัน", type: "textarea" },
      ],
    },
    {
      id: "6",
      shortTitle: "กิจกรรมที่ 6",
      title: "การป้องกันและเฝ้าระวังการติดเชื้อในโรงพยาบาล",
      fields: [
        { name: "eventDate", label: "วันที่ทบทวน", type: "date" },
        { name: "infectionCase", label: "อุบัติการณ์/ประเด็น", type: "textarea" },
        { name: "analysis", label: "วิเคราะห์สาเหตุ", type: "textarea" },
        { name: "improvement", label: "การปรับปรุง", type: "textarea" },
      ],
    },
    {
      id: "7",
      shortTitle: "กิจกรรมที่ 7",
      title: "การป้องกันและเฝ้าระวังความคลาดเคลื่อนทางยา",
      fields: [
        { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date" },
        { name: "issueType", label: "ประเด็น/รายการยา", type: "text" },
        { name: "severity", label: "ระดับความรุนแรง", type: "select", options: SEVERITIES },
        { name: "cause", label: "สาเหตุ/ปัญหา", type: "textarea" },
        { name: "action", label: "การแก้ไข/ป้องกัน", type: "textarea" },
      ],
    },
    {
      id: "8",
      shortTitle: "กิจกรรมที่ 8",
      title: "การทบทวนการดูแลผู้ป่วยจากเหตุการณ์สำคัญ",
      fields: [
        { name: "eventDate", label: "วันที่", type: "date" },
        { name: "caseSummary", label: "สรุปเหตุการณ์", type: "textarea" },
        { name: "keyCause", label: "ประเด็นสำคัญ", type: "textarea" },
        { name: "rcaAction", label: "การดำเนินการ (RCA)", type: "textarea" },
        { name: "doctorTeam", label: "ผู้ร่วมทบทวน/แพทย์", type: "text" },
      ],
    },
    {
      id: "9",
      shortTitle: "กิจกรรมที่ 9",
      title: "การทบทวนความสมบูรณ์ของการบันทึกเวชระเบียน",
      metaFields: [
        { name: "sampleCount", label: "จำนวนแฟ้ม", type: "number" },
        { name: "deadCount", label: "Dead", type: "number" },
        { name: "homeCount", label: "กลับบ้าน", type: "number" },
        { name: "refusalCount", label: "ไม่สมัครใจอยู่ต่อ", type: "number" },
      ],
      fields: [
        { name: "recordItem", label: "หัวข้อทบทวน", type: "text" },
        { name: "completeness", label: "% ความครบถ้วน", type: "number" },
        { name: "issue", label: "ปัญหา/การแก้ไข", type: "textarea" },
        { name: "result", label: "ผลการแก้ไข", type: "textarea" },
      ],
    },
    {
      id: "10",
      shortTitle: "กิจกรรมที่ 10",
      title: "การทบทวนการใช้ข้อมูลวิชาการ",
      fields: [
        { name: "eventDate", label: "วันที่ทบทวน", type: "date" },
        { name: "academicType", label: "ประเภท", type: "select", options: ["CPG", "Care Map", "WI", "คู่มือ", "Tracer", "Evidence Base", "อื่น ๆ"] },
        { name: "topic", label: "เรื่องที่ทบทวน", type: "text" },
        { name: "result", label: "ผลการดำเนินการ", type: "textarea" },
      ],
    },
    {
      id: "11",
      shortTitle: "กิจกรรมที่ 11",
      title: "การทบทวนการใช้ทรัพยากร",
      fields: [
        { name: "topic", label: "เรื่อง", type: "text" },
        { name: "reasonableness", label: "ความสมเหตุสมผล", type: "textarea" },
        { name: "prevention", label: "แนวทางป้องกัน/แก้ไข", type: "textarea" },
        { name: "reviewer", label: "ผู้ทบทวน", type: "text" },
      ],
    },
  ];

  const ACTIVITY_MAP = Object.fromEntries(ACTIVITY_DEFINITIONS.map((item) => [item.id, item]));
  const state = {
    bootstrap: null,
    globalDashboard: null,
    unitDashboard: null,
    selectedUnit: "",
    selectedFiscalYear: getFiscalYear(new Date()),
    route: { name: "home" },
    currentRecords: [],
    currentPage: 1,
    editingRecord: null,
    activity12: { catalog: [], values: [], issues: [] },
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    window.addEventListener("hashchange", handleHashChange);
    await bootstrap();
  }

  async function bootstrap() {
    showLoader("กำลังโหลด", "กำลังเชื่อมต่อระบบ");
    try {
      state.bootstrap = await apiGet("bootstrap");
      state.selectedFiscalYear = state.bootstrap.currentFiscalYear || state.selectedFiscalYear;
      const route = parseHash();
      if (route.name === "home" && !location.hash) {
        history.replaceState(null, "", "#/home");
        await applyRoute({ name: "home" });
      } else {
        await applyRoute(route);
      }
    } catch (error) {
      renderShell(renderHomeLayout(renderFatalState(error)));
      showErrorModal(error);
    } finally {
      hideLoader();
    }
  }

  async function handleHashChange() {
    await applyRoute(parseHash());
  }

  function parseHash() {
    const value = (location.hash || "#/home").replace(/^#/, "");
    const path = value.startsWith("/") ? value : `/${value}`;
    const parts = path.split("/").filter(Boolean);
    if (!parts.length || parts[0] === "home") {
      return { name: "home" };
    }
    if (parts[0] === "unit" && parts[1]) {
      const unitName = decodeURIComponent(parts[1]);
      if (parts[2] === "dashboard" || !parts[2]) {
        return { name: "unit-dashboard", unitName };
      }
      if (parts[2] === "activity" && parts[3]) {
        return { name: "unit-activity", unitName, activityId: parts[3] };
      }
    }
    return { name: "home" };
  }

  function navigate(route, replace = false) {
    const hash = routeToHash(route);
    if (replace) {
      history.replaceState(null, "", hash);
      applyRoute(route);
      return;
    }
    if (location.hash === hash) {
      applyRoute(route);
      return;
    }
    location.hash = hash;
  }

  function routeToHash(route) {
    if (route.name === "unit-dashboard") {
      return `#/unit/${encodeURIComponent(route.unitName)}/dashboard`;
    }
    if (route.name === "unit-activity") {
      return `#/unit/${encodeURIComponent(route.unitName)}/activity/${route.activityId}`;
    }
    return "#/home";
  }

  async function applyRoute(route) {
    if (!state.bootstrap) {
      return;
    }
    state.route = route;
    if (route.unitName) {
      state.selectedUnit = route.unitName;
    }
    if (route.name !== "unit-activity") {
      state.currentPage = 1;
    }

    if (route.name !== "home" && !unitExists(route.unitName)) {
      navigate({ name: "home" }, true);
      return;
    }

    showLoader("กำลังโหลด", "กำลังประมวลผลข้อมูล");
    try {
      if (route.name === "home") {
        state.selectedUnit = "";
        state.globalDashboard = await apiGet("getDashboard", { fiscalYear: state.selectedFiscalYear });
        renderShell(renderHomeLayout(renderHomeDashboard()));
        bindHomeEvents();
        return;
      }

      state.unitDashboard = await apiGet("getDashboard", {
        unitName: route.unitName,
        fiscalYear: state.selectedFiscalYear,
      });

      if (route.name === "unit-dashboard") {
        renderShell(renderUnitLayout(route, renderUnitDashboard()));
        bindUnitEvents(route);
        return;
      }

      if (route.name === "unit-activity" && route.activityId === "12") {
        state.activity12 = await apiGet("getActivity12", {
          unitName: route.unitName,
          fiscalYear: state.selectedFiscalYear,
        });
        renderShell(renderUnitLayout(route, renderActivity12Page()));
        bindUnitEvents(route);
        bindActivity12Events();
        return;
      }

      if (route.name === "unit-activity") {
        const response = await apiGet("getActivityRecords", {
          unitName: route.unitName,
          activityId: route.activityId,
          fiscalYear: state.selectedFiscalYear,
        });
        state.currentRecords = (response.records || []).sort(sortRecordsDesc);
        state.currentPage = clampPage(state.currentPage, totalPages(state.currentRecords.length));
        renderShell(renderUnitLayout(route, renderStandardActivityPage(route.activityId)));
        bindUnitEvents(route);
        bindStandardActivityEvents(route.activityId);
      }
    } catch (error) {
      renderShell(route.name === "home"
        ? renderHomeLayout(renderFatalState(error))
        : renderUnitLayout(route, renderFatalState(error)));
      bindUnitEvents(route);
      showErrorModal(error);
    } finally {
      hideLoader();
    }
  }

  function renderShell(content) {
    qs("#appRoot").innerHTML = content;
  }

  function renderHomeLayout(mainContent) {
    return `
      <div class="page-shell">
        <div class="home-header">
          <div class="brand-block">
            <img class="brand-logo" src="icon APP.png" alt="APP Icon" />
            <div>
              <p class="eyebrow">${escapeHtml(hospitalName)}</p>
              <h1 class="brand-title">${escapeHtml(appName)}</h1>
              <p class="brand-subtitle">${escapeHtml(missionName)}</p>
            </div>
          </div>
          <div class="header-actions">
            <label>
              <span class="field-label">ปีงบประมาณ</span>
              <select id="homeFiscalYearSelect" class="app-select">${renderFiscalYearOptions()}</select>
            </label>
            <button type="button" class="button-ghost" id="homeRefreshBtn">รีเฟรช</button>
        </div>
        </div>
        ${mainContent}
      </div>
    `;
  }

  function renderHomeDashboard() {
    const dashboard = state.globalDashboard || emptyDashboard();
    return `
      <section class="hero-card">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h2>ภาพรวมทั้งภารกิจด้านการพยาบาล</h2>
          <p class="muted-text">ประจำปีงบประมาณ ${state.selectedFiscalYear}</p>
        </div>
        <div class="hero-actions">
          <button type="button" class="button-primary" id="startRecordBtn">ทำการบันทึก</button>
          <button type="button" class="button-secondary" id="homeReportBtn">รายงานทั้งภารกิจ</button>
        </div>
      </section>
      <section class="stats-grid">
        ${renderStat("บันทึกรวม", dashboard.summary.totalRecords)}
        ${renderStat("หน่วยงานที่มีข้อมูล", dashboard.summary.unitsWithData)}
        ${renderStat("หน่วยงานทั้งหมด", dashboard.summary.configuredUnits)}
        ${renderStat("ประเด็นตัวชี้วัด", dashboard.summary.openIssues)}
      </section>
      <section class="overview-grid">
        <article class="panel">
          <div class="panel-head">
            <h3 class="panel-title">สรุปตามกิจกรรม</h3>
            <span class="pill">12 กิจกรรม</span>
          </div>
          <div class="panel-body">
            <div class="panel-list">
              ${Object.keys(activityCountsWithDefaults(dashboard.activityCounts)).map((activityId) => `
                <div class="list-row">
                  <div>
                    <strong>กิจกรรมที่ ${activityId}</strong>
                    <div class="muted-text">${escapeHtml(getActivityTitle(activityId))}</div>
                  </div>
                  <strong>${formatNumber(activityCountsWithDefaults(dashboard.activityCounts)[activityId])}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-head">
            <h3 class="panel-title">รายการล่าสุด</h3>
            <span class="pill">${dashboard.recentRecords.length} รายการ</span>
          </div>
          <div class="panel-body">
            ${dashboard.recentRecords.length ? `
              <div class="panel-list">
                ${dashboard.recentRecords.slice(0, 8).map((record) => `
                  <div class="list-row">
                    <div>
                      <strong>${escapeHtml(record.unitName)}</strong>
                      <div class="muted-text">กิจกรรมที่ ${escapeHtml(record.activityId)} | ${escapeHtml(formatThaiDate(record.reviewDate))}</div>
                    </div>
                    <span>${escapeHtml(record.reviewLeader || "-")}</span>
                  </div>
                `).join("")}
              </div>
            ` : `<div class="empty-state">ยังไม่มีข้อมูล</div>`}
          </div>
        </article>
      </section>
    `;
  }

  function renderUnitLayout(route, mainContent) {
    return `
      <div class="unit-shell">
        <aside class="sidebar">
          <div class="sidebar-head">
            <img class="sidebar-logo" src="icon APP.png" alt="APP Icon" />
            <div>
              <p class="eyebrow">${escapeHtml(missionName)}</p>
              <h2 class="unit-title">${escapeHtml(route.unitName || state.selectedUnit || "")}</h2>
            </div>
          </div>
          <div class="nav-block">
            <label class="field-label" for="unitFiscalYearSelect">ปีงบประมาณ</label>
            <select id="unitFiscalYearSelect" class="app-select">${renderFiscalYearOptions()}</select>
          </div>
          <div class="nav-block nav-stack">
            <button type="button" class="${route.name === "unit-dashboard" ? "button-nav-active" : "button-nav"}" data-route="unit-dashboard">แดชบอร์ดหน่วยงาน</button>
            ${ACTIVITY_DEFINITIONS.map((activity) => `
              <button
                type="button"
                class="${route.name === "unit-activity" && route.activityId === activity.id ? "button-nav-active" : "button-nav"}"
                data-route="activity"
                data-activity-id="${activity.id}"
              >
                <span>${escapeHtml(activity.shortTitle)}</span>
                <span>${formatNumber(countActivityForCurrentUnit(activity.id))}</span>
              </button>
            `).join("")}
            <button
              type="button"
              class="${route.name === "unit-activity" && route.activityId === "12" ? "button-nav-active" : "button-nav"}"
              data-route="activity"
              data-activity-id="12"
            >
              <span>กิจกรรมที่ 12</span>
              <span>${formatNumber(countActivityForCurrentUnit("12"))}</span>
            </button>
          </div>
          <div class="nav-block nav-stack">
            <button type="button" class="button-ghost" id="changeUnitBtn">เปลี่ยนหน่วยงาน</button>
            <button type="button" class="button-ghost" id="backHomeBtn">หน้าหลัก</button>
            <button type="button" class="button-secondary" id="unitReportBtn">รายงานหน่วยงาน</button>
            <button type="button" class="button-ghost" id="missionReportBtn">รายงานทั้งภารกิจ</button>
          </div>
        </aside>
        <main>
          ${mainContent}
        </main>
      </div>
    `;
  }

  function renderUnitDashboard() {
    const dashboard = state.unitDashboard || emptyDashboard();
    return `
      <header class="topbar">
        <div>
          <p class="eyebrow">Unit Dashboard</p>
          <h2 class="topbar-title">${escapeHtml(state.selectedUnit)}</h2>
          <p class="muted-text">ประจำปีงบประมาณ ${state.selectedFiscalYear}</p>
        </div>
        <div class="header-actions">
          <button type="button" class="button-primary" id="quickRecordBtn">ทำการบันทึก</button>
        </div>
      </header>
      <section class="stats-grid">
        ${renderStat("บันทึกรวม", dashboard.summary.totalRecords)}
        ${renderStat("กิจกรรมที่มีข้อมูล", countNonZero(dashboard.activityCounts))}
        ${renderStat("ตัวชี้วัดมีปัญหา", dashboard.summary.openIssues)}
        ${renderStat("รายการล่าสุด", dashboard.recentRecords.length)}
      </section>
      <section class="overview-grid">
        <article class="panel">
          <div class="panel-head">
            <h3 class="panel-title">สรุปตามกิจกรรม</h3>
          </div>
          <div class="panel-body">
            <div class="panel-list">
              ${Object.keys(activityCountsWithDefaults(dashboard.activityCounts)).map((activityId) => `
                <div class="list-row">
                  <div>
                    <strong>กิจกรรมที่ ${activityId}</strong>
                    <div class="muted-text">${escapeHtml(getActivityTitle(activityId))}</div>
                  </div>
                  <strong>${formatNumber(activityCountsWithDefaults(dashboard.activityCounts)[activityId])}</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-head">
            <h3 class="panel-title">รายการล่าสุด</h3>
          </div>
          <div class="panel-body">
            ${dashboard.recentRecords.length ? `
              <div class="panel-list">
                ${dashboard.recentRecords.slice(0, 8).map((record) => `
                  <div class="list-row">
                    <div>
                      <strong>กิจกรรมที่ ${escapeHtml(record.activityId)}</strong>
                      <div class="muted-text">${escapeHtml(formatThaiDate(record.reviewDate))}</div>
                    </div>
                    <span>${escapeHtml(record.reviewLeader || "-")}</span>
                  </div>
                `).join("")}
              </div>
            ` : `<div class="empty-state">ยังไม่มีข้อมูล</div>`}
          </div>
        </article>
      </section>
    `;
  }

  function renderStandardActivityPage(activityId) {
    const definition = ACTIVITY_MAP[activityId];
    const pageCount = totalPages(state.currentRecords.length);
    const pageItems = paginate(state.currentRecords, state.currentPage, PAGE_SIZE);
    return `
      <header class="topbar">
        <div>
          <p class="eyebrow">${escapeHtml(definition.shortTitle)}</p>
          <h2 class="topbar-title">${escapeHtml(definition.title)}</h2>
          <p class="muted-text">ประจำปีงบประมาณ ${state.selectedFiscalYear}</p>
        </div>
        <div class="header-actions">
          <button type="button" class="button-primary" id="openCreateRecordBtn">เพิ่มรายการ</button>
        </div>
      </header>
      <section class="record-table-wrap">
        <div class="table-toolbar">
          <div>
            <h3 class="panel-title">ประวัติการบันทึก</h3>
            <p class="table-meta">เรียงจากล่าสุด</p>
          </div>
          <div class="pagination-summary">ทั้งหมด ${formatNumber(state.currentRecords.length)} รายการ</div>
        </div>
        ${pageItems.length ? `
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>วันที่ทบทวน</th>
                  <th>ผู้นำการทบทวน</th>
                  <th>ผู้ร่วมทบทวน</th>
                  <th>ปรับปรุงล่าสุด</th>
                  <th>ไฟล์แนบ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((record) => `
                  <tr>
                    <td>${escapeHtml(formatThaiDate(record.reviewDate))}</td>
                    <td>${escapeHtml(record.reviewLeader || "-")}</td>
                    <td>${formatNumber((record.participants || []).length)}</td>
                    <td>${escapeHtml(formatThaiDateTime(record.updatedAt))}</td>
                    <td>${formatNumber((record.attachments || []).length)}</td>
                    <td>
                      <div class="inline-actions">
                        <button type="button" class="button-ghost" data-edit-record="${record.recordId}">แก้ไข</button>
                        <button type="button" class="button-danger" data-delete-record="${record.recordId}">ลบ</button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty-state">ยังไม่มีข้อมูล</div>`}
        ${renderPaginator(pageCount, state.currentPage)}
      </section>
    `;
  }

  function renderActivity12Page() {
    const { catalog = [], values = [], issues = [] } = state.activity12;
    const valueMap = Object.fromEntries(values.map((item) => [item.indicatorId, item]));
    const sections = [
      { key: "quality", label: "12.1 เครื่องชี้วัดกิจกรรมคุณภาพ" },
      { key: "commonRisk", label: "12.2 ความเสี่ยงทางคลินิก (Common Clinical Risk)" },
      { key: "specificRisk", label: "12.3 ความเสี่ยงทางคลินิกเฉพาะโรค (Specific Clinical Risk)" },
    ];
    return `
      <header class="topbar">
        <div>
          <p class="eyebrow">กิจกรรมที่ 12</p>
          <h2 class="topbar-title">การติดตามเครื่องชี้วัดสำคัญ</h2>
          <p class="muted-text">ประจำปีงบประมาณ ${state.selectedFiscalYear}</p>
        </div>
      </header>
      <section class="stats-grid">
        ${renderStat("ตัวชี้วัดทั้งหมด", catalog.length)}
        ${renderStat("ประเด็นปัญหา", issues.length)}
        ${renderStat("หมวด 12.1", catalog.filter((item) => item.sectionKey === "quality").length)}
        ${renderStat("หมวด 12.2-12.3", catalog.filter((item) => item.sectionKey !== "quality").length)}
      </section>
      ${sections.map((section) => renderIndicatorSection(section, catalog.filter((item) => item.sectionKey === section.key), valueMap)).join("")}
      <section class="panel">
        <div class="panel-head">
          <h3 class="panel-title">สรุปประเด็นตัวชี้วัดที่ยังมีปัญหา</h3>
          <button type="button" class="button-primary" id="openIssueFormBtn">เพิ่มประเด็น</button>
        </div>
        <div class="panel-body">
          ${issues.length ? `
            <div class="issue-stack">
              ${issues.map((issue) => `
                <article class="issue-card">
                  <div class="issue-head">
                    <div>
                      <strong>${escapeHtml(issue.indicatorName)}</strong>
                      <div class="muted-text">${escapeHtml(issue.sectionKey)}</div>
                    </div>
                    <button type="button" class="button-danger" data-delete-issue="${issue.issueId}">ลบ</button>
                  </div>
                  <p><strong>ปัญหา:</strong> ${escapeHtml(issue.problem || "-")}</p>
                  <p><strong>การดำเนินการ:</strong> ${escapeHtml(issue.actionPlan || "-")}</p>
                  <p><strong>ติดตามผล:</strong> ${escapeHtml(issue.followUp || "-")}</p>
                </article>
              `).join("")}
            </div>
          ` : `<div class="empty-state">ยังไม่มีข้อมูล</div>`}
        </div>
      </section>
    `;
  }

  function renderIndicatorSection(section, indicators, valueMap) {
    const isRisk = section.key !== "quality";
    return `
      <section class="record-table-wrap">
        <div class="table-toolbar">
          <h3 class="panel-title">${escapeHtml(section.label)}</h3>
          <div class="panel-actions">
            <button type="button" class="button-secondary" data-save-section="${section.key}">บันทึกตาราง</button>
            <button type="button" class="button-primary" data-add-indicator="${section.key}">เพิ่มตัวชี้วัด</button>
          </div>
        </div>
        ${indicators.length ? `
          <div class="indicator-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ตัวชี้วัด</th>
                  <th>เป้าหมาย</th>
                  ${MONTHS.map((month) => `<th>${month.label}</th>`).join("")}
                  ${isRisk ? SEVERITIES.map((code) => `<th>${code}</th>`).join("") : ""}
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                ${indicators.map((indicator) => {
                  const payload = valueMap[indicator.indicatorId]?.payload || {};
                  const monthly = payload.monthly || {};
                  const severity = payload.severity || {};
                  return `
                    <tr data-indicator-row="${indicator.indicatorId}" data-section="${section.key}">
                      <td>${escapeHtml(indicator.indicatorName)}</td>
                      <td>${escapeHtml([indicator.targetValue, indicator.targetUnit].filter(Boolean).join(" ") || "-")}</td>
                      ${MONTHS.map((month) => `<td><input class="cell-input" data-month-input="${month.key}" value="${escapeHtml(monthly[month.key] || "")}" /></td>`).join("")}
                      ${isRisk ? SEVERITIES.map((code) => `<td><input class="cell-input" data-severity-input="${code}" value="${escapeHtml(severity[code] || "")}" /></td>`).join("") : ""}
                      <td><button type="button" class="button-danger" data-delete-indicator="${indicator.indicatorId}">ลบ</button></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty-state">ยังไม่มีตัวชี้วัด</div>`}
      </section>
    `;
  }

  function bindHomeEvents() {
    qs("#homeFiscalYearSelect")?.addEventListener("change", async (event) => {
      state.selectedFiscalYear = Number(event.target.value);
      await applyRoute({ name: "home" });
    });
    qs("#homeRefreshBtn")?.addEventListener("click", async () => {
      await applyRoute({ name: "home" });
    });
    qs("#startRecordBtn")?.addEventListener("click", openUnitPickerModal);
    qs("#homeReportBtn")?.addEventListener("click", async () => {
      await openReport("mission");
    });
  }

  function bindUnitEvents(route) {
    qs("#unitFiscalYearSelect")?.addEventListener("change", async (event) => {
      state.selectedFiscalYear = Number(event.target.value);
      await applyRoute(state.route);
    });
    qs("#backHomeBtn")?.addEventListener("click", () => navigate({ name: "home" }));
    qs("#changeUnitBtn")?.addEventListener("click", openUnitPickerModal);
    qs("#unitReportBtn")?.addEventListener("click", async () => {
      await openReport("unit");
    });
    qs("#missionReportBtn")?.addEventListener("click", async () => {
      await openReport("mission");
    });
    qs("#quickRecordBtn")?.addEventListener("click", () => openQuickActivityModal(route.unitName));
    qsa("[data-route='unit-dashboard']").forEach((button) => {
      button.addEventListener("click", () => navigate({ name: "unit-dashboard", unitName: route.unitName }));
    });
    qsa("[data-route='activity']").forEach((button) => {
      button.addEventListener("click", () => navigate({
        name: "unit-activity",
        unitName: route.unitName,
        activityId: button.dataset.activityId,
      }));
    });
  }

  function bindStandardActivityEvents(activityId) {
    qs("#openCreateRecordBtn")?.addEventListener("click", () => openRecordModal(activityId));
    qsa("[data-edit-record]").forEach((button) => {
      button.addEventListener("click", () => {
        const record = state.currentRecords.find((item) => item.recordId === button.dataset.editRecord);
        if (record) {
          openRecordModal(activityId, record);
        }
      });
    });
    qsa("[data-delete-record]").forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = await confirmModal("ลบรายการนี้หรือไม่", "รายการจะถูกลบจากระบบ");
        if (!confirmed) {
          return;
        }
        showLoader("กำลังลบ", "กำลังลบข้อมูล");
        try {
          await apiPost("deleteActivityRecord", { recordId: button.dataset.deleteRecord });
          await applyRoute(state.route);
        } catch (error) {
          showErrorModal(error);
        } finally {
          hideLoader();
        }
      });
    });
    qs("#prevPageBtn")?.addEventListener("click", async () => {
      state.currentPage = Math.max(1, state.currentPage - 1);
      renderShell(renderUnitLayout(state.route, renderStandardActivityPage(activityId)));
      bindUnitEvents(state.route);
      bindStandardActivityEvents(activityId);
    });
    qs("#nextPageBtn")?.addEventListener("click", async () => {
      state.currentPage = Math.min(totalPages(state.currentRecords.length), state.currentPage + 1);
      renderShell(renderUnitLayout(state.route, renderStandardActivityPage(activityId)));
      bindUnitEvents(state.route);
      bindStandardActivityEvents(activityId);
    });
  }

  function bindActivity12Events() {
    qs("#openIssueFormBtn")?.addEventListener("click", () => openIssueModal());
    qsa("[data-add-indicator]").forEach((button) => {
      button.addEventListener("click", () => openIndicatorModal(button.dataset.addIndicator));
    });
    qsa("[data-save-section]").forEach((button) => {
      button.addEventListener("click", async () => {
        await saveIndicatorSection(button.dataset.saveSection);
      });
    });
    qsa("[data-delete-indicator]").forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = await confirmModal("ลบตัวชี้วัดนี้หรือไม่", "รายการจะถูกลบจากการตั้งค่าหน่วยงาน");
        if (!confirmed) {
          return;
        }
        showLoader("กำลังลบ", "กำลังลบตัวชี้วัด");
        try {
          await apiPost("deleteIndicatorCatalog", { indicatorId: button.dataset.deleteIndicator });
          await applyRoute(state.route);
        } catch (error) {
          showErrorModal(error);
        } finally {
          hideLoader();
        }
      });
    });
    qsa("[data-delete-issue]").forEach((button) => {
      button.addEventListener("click", async () => {
        const confirmed = await confirmModal("ลบประเด็นนี้หรือไม่", "รายการจะถูกลบจากสรุปปัญหา");
        if (!confirmed) {
          return;
        }
        showLoader("กำลังลบ", "กำลังลบข้อมูล");
        try {
          await apiPost("deleteIndicatorIssue", { issueId: button.dataset.deleteIssue });
          await applyRoute(state.route);
        } catch (error) {
          showErrorModal(error);
        } finally {
          hideLoader();
        }
      });
    });
  }

  function openUnitPickerModal() {
    openModal({
      title: "เลือกหน่วยงาน",
      size: "sm",
      content: `
        <label class="field-label" for="unitPickerSelect">หน่วยงาน</label>
        <select id="unitPickerSelect" class="app-select">
          <option value="">เลือก...</option>
          ${(state.bootstrap?.units || []).map((unit) => `<option value="${escapeHtml(unit.unitName)}">${escapeHtml(unit.unitName)}</option>`).join("")}
        </select>
      `,
      actions: [
        { label: "ยกเลิก", className: "button-ghost", onClick: closeModal },
        {
          label: "เข้าสู่หน่วยงาน",
          className: "button-primary",
          onClick: () => {
            const value = qs("#unitPickerSelect")?.value || "";
            if (!value) {
              openToastModal("กรุณาเลือกหน่วยงาน");
              return;
            }
            closeModal();
            navigate({ name: "unit-dashboard", unitName: value });
          },
        },
      ],
    });
  }

  function openQuickActivityModal(unitName) {
    openModal({
      title: "เลือกกิจกรรม",
      size: "sm",
      content: `
        <div class="nav-stack">
          ${ACTIVITY_DEFINITIONS.map((activity) => `<button type="button" class="button-nav" data-quick-activity="${activity.id}">${escapeHtml(activity.shortTitle)}</button>`).join("")}
          <button type="button" class="button-nav" data-quick-activity="12">กิจกรรมที่ 12</button>
        </div>
      `,
      actions: [{ label: "ปิด", className: "button-ghost", onClick: closeModal }],
    });
    qsa("[data-quick-activity]").forEach((button) => {
      button.addEventListener("click", () => {
        closeModal();
        navigate({
          name: "unit-activity",
          unitName,
          activityId: button.dataset.quickActivity,
        });
      });
    });
  }

  function openRecordModal(activityId, record = null) {
    const definition = ACTIVITY_MAP[activityId];
    state.editingRecord = record
      ? {
          recordId: record.recordId,
          createdAt: record.createdAt,
          attachments: [...(record.attachments || [])],
        }
      : null;

    openModal({
      title: record ? `แก้ไข ${definition.shortTitle}` : `เพิ่มรายการ ${definition.shortTitle}`,
      size: "lg",
      content: renderRecordForm(definition, record),
      actions: [
        { label: "ยกเลิก", className: "button-ghost", onClick: closeModal },
        {
          label: "บันทึก",
          className: "button-primary",
          onClick: async () => {
            await submitRecordForm(definition);
          },
        },
      ],
    });
    bindRecordFormEvents(definition, record);
  }

  function renderRecordForm(definition, record) {
    const rows = record?.rows?.length ? record.rows : [{}];
    return `
      <form id="recordForm">
        <div class="form-grid">
          ${renderField({ name: "reviewDate", label: "วันที่ทบทวน", type: "date" }, toDateInput(record?.reviewDate || ""))}
          ${renderField({ name: "reviewLeader", label: "ผู้นำการทบทวน", type: "text" }, record?.reviewLeader || "")}
        </div>
        <div class="form-section">
          ${renderField({ name: "participants", label: "ผู้ร่วมทบทวน", type: "textarea" }, (record?.participants || []).join("\n"))}
        </div>
        ${definition.metaFields ? `
          <div class="form-section">
            <div class="meta-grid">
              ${definition.metaFields.map((field) => renderField(field, record?.meta?.[field.name] || "")).join("")}
            </div>
          </div>
        ` : ""}
        <div class="form-section">
          <div class="panel-head">
            <h3 class="panel-title">รายการบันทึก</h3>
            <button type="button" class="button-secondary" id="addRowBtn">เพิ่มรายการ</button>
          </div>
          <div id="rowContainer" class="row-stack">
            ${rows.map((row, index) => renderRowCard(definition, row, index + 1)).join("")}
          </div>
        </div>
        <div class="form-section">
          ${renderField({ name: "note", label: "หมายเหตุ", type: "textarea" }, record?.note || "")}
        </div>
        <div class="form-section">
          <label class="field-label" for="attachmentsInput">ไฟล์แนบ</label>
          <input id="attachmentsInput" type="file" multiple />
          <div id="existingAttachments" class="file-chip-list">
            ${(state.editingRecord?.attachments || []).map((file, index) => `
              <div class="file-chip">
                <span>${escapeHtml(file.name || `ไฟล์ ${index + 1}`)}</span>
                <button type="button" class="button-danger" data-remove-existing="${index}">ลบ</button>
              </div>
            `).join("")}
          </div>
        </div>
      </form>
    `;
  }

  function renderRowCard(definition, row, index) {
    return `
      <article class="row-card">
        <div class="row-head">
          <strong>รายการที่ ${index}</strong>
          <button type="button" class="button-danger" data-remove-row>ลบ</button>
        </div>
        <div class="form-grid single">
          ${definition.fields.map((field) => renderField(field, row?.[field.name] || "", `row-${field.name}`)).join("")}
        </div>
      </article>
    `;
  }

  function bindRecordFormEvents(definition) {
    qs("#addRowBtn")?.addEventListener("click", () => {
      const container = qs("#rowContainer");
      container.insertAdjacentHTML("beforeend", renderRowCard(definition, {}, container.children.length + 1));
      bindRowRemoveEvents();
    });
    bindRowRemoveEvents();
    bindExistingAttachmentEvents();
  }

  function bindRowRemoveEvents() {
    qsa("[data-remove-row]").forEach((button) => {
      button.onclick = () => {
        const container = qs("#rowContainer");
        if (container.children.length === 1) {
          openToastModal("ต้องมีอย่างน้อย 1 รายการ");
          return;
        }
        button.closest(".row-card").remove();
        qsa(".row-card", container).forEach((card, index) => {
          const strong = card.querySelector("strong");
          if (strong) {
            strong.textContent = `รายการที่ ${index + 1}`;
          }
        });
      };
    });
  }

  function bindExistingAttachmentEvents() {
    qsa("[data-remove-existing]").forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.removeExisting);
        state.editingRecord.attachments.splice(index, 1);
        button.closest(".file-chip").remove();
      };
    });
  }

  async function submitRecordForm(definition) {
    const form = qs("#recordForm");
    const rows = qsa(".row-card", qs("#rowContainer")).map((card) => {
      const result = {};
      definition.fields.forEach((field) => {
        const input = card.querySelector(`[name="row-${field.name}"]`);
        result[field.name] = input ? input.value.trim() : "";
      });
      return result;
    }).filter((row) => Object.values(row).some(Boolean));

    if (!rows.length) {
      openToastModal("กรุณากรอกข้อมูลอย่างน้อย 1 รายการ");
      return;
    }

    const meta = {};
    (definition.metaFields || []).forEach((field) => {
      meta[field.name] = form.elements[field.name].value.trim();
    });

    const existingAttachments = state.editingRecord?.attachments || [];
    const newFiles = Array.from(qs("#attachmentsInput")?.files || []);
    if (existingAttachments.length + newFiles.length > 5) {
      openToastModal("แนบไฟล์ได้สูงสุด 5 ไฟล์");
      return;
    }

    showLoader("กำลังบันทึก", "กำลังบันทึกข้อมูล");
    try {
      const newAttachments = await readFilesAsBase64(newFiles);
      await apiPost("saveActivityRecord", {
        recordId: state.editingRecord?.recordId,
        createdAt: state.editingRecord?.createdAt,
        retainedAttachments: existingAttachments,
        newAttachments,
        unitName: state.selectedUnit,
        activityId: definition.id,
        activityLabel: definition.title,
        fiscalYear: state.selectedFiscalYear,
        reviewDate: form.elements.reviewDate.value,
        reviewLeader: form.elements.reviewLeader.value.trim(),
        participants: splitParticipants(form.elements.participants.value),
        meta,
        rows,
        note: form.elements.note.value.trim(),
      });
      closeModal();
      await applyRoute(state.route);
    } catch (error) {
      showErrorModal(error);
    } finally {
      hideLoader();
    }
  }

  function openIndicatorModal(sectionKey) {
    openModal({
      title: "เพิ่มตัวชี้วัด",
      size: "sm",
      content: `
        <form id="indicatorForm">
          <div class="form-grid">
            ${renderField({ name: "indicatorName", label: "ชื่อตัวชี้วัด", type: "text" })}
            ${renderField({ name: "targetValue", label: "ค่าเป้าหมาย", type: "text" })}
            ${renderField({ name: "targetUnit", label: "หน่วย", type: "text" })}
            ${renderField({ name: "sortOrder", label: "ลำดับ", type: "number" })}
          </div>
          <div class="form-section">
            ${renderField({ name: "description", label: "รายละเอียด", type: "textarea" })}
          </div>
        </form>
      `,
      actions: [
        { label: "ยกเลิก", className: "button-ghost", onClick: closeModal },
        {
          label: "บันทึก",
          className: "button-primary",
          onClick: async () => {
            const form = qs("#indicatorForm");
            showLoader("กำลังบันทึก", "กำลังบันทึกตัวชี้วัด");
            try {
              await apiPost("saveIndicatorCatalog", {
                unitName: state.selectedUnit,
                sectionKey,
                indicatorName: form.elements.indicatorName.value.trim(),
                targetValue: form.elements.targetValue.value.trim(),
                targetUnit: form.elements.targetUnit.value.trim(),
                description: form.elements.description.value.trim(),
                sortOrder: form.elements.sortOrder.value.trim(),
              });
              closeModal();
              await applyRoute(state.route);
            } catch (error) {
              showErrorModal(error);
            } finally {
              hideLoader();
            }
          },
        },
      ],
    });
  }

  async function saveIndicatorSection(sectionKey) {
    const items = qsa(`[data-section="${sectionKey}"]`).map((row) => {
      const indicatorId = row.dataset.indicatorRow;
      const currentValue = state.activity12.values.find((item) => item.indicatorId === indicatorId);
      const payload = {
        monthly: Object.fromEntries(MONTHS.map((month) => [month.key, row.querySelector(`[data-month-input="${month.key}"]`).value.trim()])),
      };
      if (sectionKey !== "quality") {
        payload.severity = Object.fromEntries(SEVERITIES.map((code) => [code, row.querySelector(`[data-severity-input="${code}"]`).value.trim()]));
      }
      return {
        valueId: currentValue?.valueId,
        createdAt: currentValue?.createdAt,
        indicatorId,
        sectionKey,
        payload,
      };
    });

    showLoader("กำลังบันทึก", "กำลังบันทึกตาราง");
    try {
      await apiPost("saveIndicatorValues", {
        unitName: state.selectedUnit,
        fiscalYear: state.selectedFiscalYear,
        items,
      });
      await applyRoute(state.route);
    } catch (error) {
      showErrorModal(error);
    } finally {
      hideLoader();
    }
  }

  function openIssueModal() {
    const catalog = state.activity12.catalog || [];
    openModal({
      title: "เพิ่มประเด็นปัญหา",
      size: "sm",
      content: `
        <form id="issueForm">
          ${renderField({
            name: "indicatorId",
            label: "ตัวชี้วัด",
            type: "select",
            options: catalog.map((item) => ({ value: item.indicatorId, label: `${item.sectionKey} - ${item.indicatorName}` })),
          })}
          <div class="form-section">${renderField({ name: "problem", label: "ปัญหา", type: "textarea" })}</div>
          <div class="form-section">${renderField({ name: "actionPlan", label: "การดำเนินการ", type: "textarea" })}</div>
          <div class="form-section">${renderField({ name: "followUp", label: "ติดตามผล", type: "textarea" })}</div>
        </form>
      `,
      actions: [
        { label: "ยกเลิก", className: "button-ghost", onClick: closeModal },
        {
          label: "บันทึก",
          className: "button-primary",
          onClick: async () => {
            const form = qs("#issueForm");
            const indicator = catalog.find((item) => item.indicatorId === form.elements.indicatorId.value);
            showLoader("กำลังบันทึก", "กำลังบันทึกประเด็น");
            try {
              await apiPost("saveIndicatorIssue", {
                unitName: state.selectedUnit,
                fiscalYear: state.selectedFiscalYear,
                sectionKey: indicator?.sectionKey || "",
                indicatorId: indicator?.indicatorId || "",
                indicatorName: indicator?.indicatorName || "",
                problem: form.elements.problem.value.trim(),
                actionPlan: form.elements.actionPlan.value.trim(),
                followUp: form.elements.followUp.value.trim(),
              });
              closeModal();
              await applyRoute(state.route);
            } catch (error) {
              showErrorModal(error);
            } finally {
              hideLoader();
            }
          },
        },
      ],
    });
  }

  async function openReport(scope) {
    if (scope === "unit" && !state.selectedUnit) {
      openToastModal("กรุณาเลือกหน่วยงาน");
      return;
    }
    showLoader("กำลังสร้างรายงาน", "กำลังประมวลผลข้อมูล");
    try {
      const bundle = await apiGet("getReportBundle", {
        unitName: scope === "unit" ? state.selectedUnit : "__all__",
        fiscalYear: state.selectedFiscalYear,
      });
      openModal({
        title: scope === "unit" ? `รายงานหน่วยงาน ${state.selectedUnit}` : "รายงานทั้งภารกิจ",
        subtitle: `ปีงบประมาณ ${state.selectedFiscalYear}`,
        size: "lg",
        content: `<div class="report-preview">${renderReportBundle(bundle)}</div>`,
        actions: [
          { label: "ปิด", className: "button-ghost", onClick: closeModal },
          { label: "พิมพ์", className: "button-primary", onClick: () => window.print() },
        ],
      });
    } catch (error) {
      showErrorModal(error);
    } finally {
      hideLoader();
    }
  }

  function renderReportBundle(bundle) {
    return (bundle.units || []).map((unitBlock) => renderUnitReport(unitBlock, bundle.fiscalYear)).join("");
  }

  function renderUnitReport(unitBlock, fiscalYear) {
    const activity12 = unitBlock.activity12 || { catalog: [], values: [], issues: [] };
    const valueMap = Object.fromEntries((activity12.values || []).map((item) => [item.indicatorId, item.payload || {}]));
    return `
      <section class="report-page">
        <div class="report-head">
          <div>
            <div>${escapeHtml(hospitalName)}</div>
            <h2 class="report-title">${escapeHtml(appName)}</h2>
            <div>${escapeHtml(missionName)}</div>
          </div>
          <div>
            <div><strong>หน่วยงาน:</strong> ${escapeHtml(unitBlock.unitName)}</div>
            <div><strong>ประจำปีงบประมาณ:</strong> ${escapeHtml(String(fiscalYear))}</div>
          </div>
        </div>
        ${ACTIVITY_DEFINITIONS.map((definition) => renderActivityReportSection(definition, unitBlock.records?.[definition.id] || [])).join("")}
        ${renderActivity12Report(activity12, valueMap)}
      </section>
    `;
  }

  function renderActivityReportSection(definition, records) {
    return `
      <div class="report-section">
        <h4>${escapeHtml(definition.shortTitle)} ${escapeHtml(definition.title)}</h4>
        ${records.length ? records.map((record) => `
          <div class="report-meta">
            <div><strong>วันที่ทบทวน:</strong> ${escapeHtml(formatThaiDate(record.reviewDate))}</div>
            <div><strong>ผู้นำการทบทวน:</strong> ${escapeHtml(record.reviewLeader || "-")}</div>
            <div><strong>ผู้ร่วมทบทวน:</strong> ${escapeHtml((record.participants || []).join(", ") || "-")}</div>
          </div>
          ${definition.metaFields?.length ? `
            <div class="report-table-wrap">
              <table class="report-table">
                <thead><tr>${definition.metaFields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}</tr></thead>
                <tbody><tr>${definition.metaFields.map((field) => `<td>${escapeHtml(record.meta?.[field.name] || "-")}</td>`).join("")}</tr></tbody>
              </table>
            </div>
          ` : ""}
          <div class="report-table-wrap">
            <table class="report-table">
              <thead><tr>${definition.fields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}</tr></thead>
              <tbody>${(record.rows || []).map((row) => `<tr>${definition.fields.map((field) => `<td>${escapeHtml(formatFieldValue(row[field.name], field.type))}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>
        `).join("<br />") : `<div>ไม่มีข้อมูล</div>`}
      </div>
    `;
  }

  function renderActivity12Report(activity12, valueMap) {
    const groups = [
      { key: "quality", label: "12.1 เครื่องชี้วัดกิจกรรมคุณภาพ" },
      { key: "commonRisk", label: "12.2 ความเสี่ยงทางคลินิก (Common Clinical Risk)" },
      { key: "specificRisk", label: "12.3 ความเสี่ยงทางคลินิกเฉพาะโรค (Specific Clinical Risk)" },
    ];
    return `
      <div class="report-section">
        <h4>กิจกรรมที่ 12 การติดตามเครื่องชี้วัดสำคัญ</h4>
        ${groups.map((group) => {
          const rows = (activity12.catalog || []).filter((item) => item.sectionKey === group.key);
          if (!rows.length) {
            return `<div><strong>${escapeHtml(group.label)}</strong>: ไม่มีข้อมูล</div>`;
          }
          return `
            <div><strong>${escapeHtml(group.label)}</strong></div>
            <div class="report-table-wrap">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>ตัวชี้วัด</th>
                    <th>เป้าหมาย</th>
                    ${MONTHS.map((month) => `<th>${month.label}</th>`).join("")}
                    ${group.key !== "quality" ? SEVERITIES.map((code) => `<th>${code}</th>`).join("") : ""}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((indicator) => {
                    const payload = valueMap[indicator.indicatorId] || {};
                    const monthly = payload.monthly || {};
                    const severity = payload.severity || {};
                    return `
                      <tr>
                        <td>${escapeHtml(indicator.indicatorName)}</td>
                        <td>${escapeHtml([indicator.targetValue, indicator.targetUnit].filter(Boolean).join(" ") || "-")}</td>
                        ${MONTHS.map((month) => `<td>${escapeHtml(monthly[month.key] || "-")}</td>`).join("")}
                        ${group.key !== "quality" ? SEVERITIES.map((code) => `<td>${escapeHtml(severity[code] || "-")}</td>`).join("") : ""}
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderPaginator(pageCount, currentPage) {
    if (pageCount <= 1) {
      return "";
    }
    return `
      <div class="paginator">
        <button type="button" class="button-ghost" id="prevPageBtn" ${currentPage <= 1 ? "disabled" : ""}>ก่อนหน้า</button>
        <span class="pill">หน้า ${currentPage} / ${pageCount}</span>
        <button type="button" class="button-ghost" id="nextPageBtn" ${currentPage >= pageCount ? "disabled" : ""}>ถัดไป</button>
      </div>
    `;
  }

  function renderField(field, value = "", overrideName = "") {
    const name = overrideName || field.name;
    if (field.type === "textarea") {
      return `
        <label>
          <span class="field-label">${escapeHtml(field.label)}</span>
          <textarea class="text-area" name="${name}">${escapeHtml(value)}</textarea>
        </label>
      `;
    }
    if (field.type === "select") {
      const options = (field.options || []).map((option) => {
        const optionValue = typeof option === "object" ? option.value : option;
        const optionLabel = typeof option === "object" ? option.label : option;
        return `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
      }).join("");
      return `
        <label>
          <span class="field-label">${escapeHtml(field.label)}</span>
          <select class="app-select" name="${name}">
            <option value="">เลือก...</option>
            ${options}
          </select>
        </label>
      `;
    }
    const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
    const className = field.type === "number" ? "number-input" : field.type === "date" ? "date-input" : "text-input";
    return `
      <label>
        <span class="field-label">${escapeHtml(field.label)}</span>
        <input class="${className}" type="${inputType}" name="${name}" value="${escapeHtml(value)}" />
      </label>
    `;
  }

  function renderStat(label, value) {
    return `
      <article class="stat-card">
        <div class="stat-label">${escapeHtml(label)}</div>
        <div class="stat-value">${escapeHtml(String(value))}</div>
      </article>
    `;
  }

  function renderFatalState(error) {
    return `
      <section class="hero-card">
        <div>
          <p class="eyebrow">Error</p>
          <h2>ไม่สามารถโหลดข้อมูลได้</h2>
          <p class="muted-text">${escapeHtml(error.message || String(error))}</p>
        </div>
      </section>
    `;
  }

  function renderFiscalYearOptions() {
    const years = state.bootstrap?.availableFiscalYears || [state.selectedFiscalYear];
    return years.map((year) => `<option value="${year}" ${Number(year) === Number(state.selectedFiscalYear) ? "selected" : ""}>ปี ${year}</option>`).join("");
  }

  function activityCountsWithDefaults(activityCounts = {}) {
    const result = {};
    for (let i = 1; i <= 12; i += 1) {
      result[String(i)] = Number(activityCounts[String(i)] || 0);
    }
    return result;
  }

  function countActivityForCurrentUnit(activityId) {
    return Number(state.unitDashboard?.activityCounts?.[activityId] || 0);
  }

  function emptyDashboard() {
    return {
      summary: { totalRecords: 0, unitsWithData: 0, configuredUnits: 0, openIssues: 0 },
      activityCounts: {},
      unitCounts: {},
      recentRecords: [],
    };
  }

  function unitExists(unitName) {
    return (state.bootstrap?.units || []).some((unit) => unit.unitName === unitName);
  }

  function getActivityTitle(activityId) {
    return ACTIVITY_MAP[activityId]?.title || "การติดตามเครื่องชี้วัดสำคัญ";
  }

  function countNonZero(activityCounts = {}) {
    return Object.values(activityCounts).filter((value) => Number(value) > 0).length;
  }

  function paginate(items, currentPage, pageSize) {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  function totalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  }

  function clampPage(page, pageCount) {
    return Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  }

  function sortRecordsDesc(a, b) {
    const aDate = new Date(a.reviewDate || a.updatedAt || 0).getTime();
    const bDate = new Date(b.reviewDate || b.updatedAt || 0).getTime();
    if (bDate !== aDate) {
      return bDate - aDate;
    }
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  }

  function openModal({ title, subtitle = "", content = "", actions = [], size = "md" }) {
    qs("#modalRoot").innerHTML = `
      <div class="modal-overlay">
        <div class="modal-card" data-size="${size}">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">${escapeHtml(title)}</h3>
              ${subtitle ? `<p class="modal-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            </div>
            <button type="button" class="button-ghost" id="closeModalBtn">ปิด</button>
          </div>
          <div class="modal-body">${content}</div>
          <div class="modal-footer" id="modalFooter"></div>
        </div>
      </div>
    `;
    const overlay = qs(".modal-overlay", qs("#modalRoot"));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });
    qs("#closeModalBtn")?.addEventListener("click", closeModal);
    const footer = qs("#modalFooter");
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.className || "button-ghost";
      button.textContent = action.label || "ปิด";
      button.addEventListener("click", async () => {
        if (typeof action.onClick === "function") {
          await action.onClick();
        } else {
          closeModal();
        }
      });
      footer.appendChild(button);
    });
  }

  function closeModal() {
    qs("#modalRoot").innerHTML = "";
  }

  function openToastModal(message) {
    openModal({
      title: "แจ้งเตือน",
      size: "sm",
      content: `<div class="empty-state">${escapeHtml(message)}</div>`,
      actions: [{ label: "ปิด", className: "button-primary", onClick: closeModal }],
    });
  }

  function confirmModal(title, message) {
    return new Promise((resolve) => {
      openModal({
        title,
        size: "sm",
        content: `<div class="empty-state">${escapeHtml(message)}</div>`,
        actions: [
          { label: "ยกเลิก", className: "button-ghost", onClick: () => { closeModal(); resolve(false); } },
          { label: "ยืนยัน", className: "button-primary", onClick: () => { closeModal(); resolve(true); } },
        ],
      });
    });
  }

  function showErrorModal(error) {
    const message = error.message || String(error);
    const hint = message.includes("ใช้เวลานานเกินกำหนด")
      ? `<p class="muted-text">ตรวจสอบ deployment ของ Google Apps Script ให้เป็นเวอร์ชันล่าสุด</p>`
      : "";
    openModal({
      title: "เกิดข้อผิดพลาด",
      size: "sm",
      content: `<div class="empty-state">${escapeHtml(message)}</div>${hint}`,
      actions: [{ label: "ปิด", className: "button-primary", onClick: closeModal }],
    });
  }

  function showLoader(title, message) {
    qs("#loadingTitle").textContent = title;
    qs("#loadingMessage").textContent = message;
    qs("#loadingOverlay").classList.remove("hidden");
  }

  function hideLoader() {
    qs("#loadingOverlay").classList.add("hidden");
  }

  async function apiGet(action, params = {}) {
    return apiBridgeRequest(action, params);
  }

  async function apiPost(action, payload = {}) {
    return apiBridgeRequest(action, payload);
  }

  function apiBridgeRequest(action, payload = {}) {
    return new Promise((resolve, reject) => {
      const requestId = `gas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const iframeName = `rpc-frame-${requestId}`;
      const iframe = document.createElement("iframe");
      const form = document.createElement("form");
      let timeoutId = null;

      iframe.name = iframeName;
      iframe.style.display = "none";
      form.method = "POST";
      form.action = apiBaseUrl;
      form.target = iframeName;
      form.style.display = "none";

      const fields = {
        action,
        payload: JSON.stringify(payload),
        transport: "postMessage",
        requestId,
        origin: "*",
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        clearTimeout(timeoutId);
        iframe.remove();
        form.remove();
      };

      const onMessage = (event) => {
        const packet = typeof event.data === "string" ? safeJsonParse(event.data) : event.data;
        if (event.source !== iframe.contentWindow) {
          return;
        }
        if (!packet || packet.requestId !== requestId) {
          return;
        }
        cleanup();
        if (!packet.success) {
          reject(new Error(packet.error || "Unknown API error"));
          return;
        }
        resolve(packet.data);
      };

      timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error("การเชื่อมต่อกับ Google Apps Script ใช้เวลานานเกินกำหนด"));
      }, 90000);

      window.addEventListener("message", onMessage);
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
    });
  }

  async function readFilesAsBase64(files) {
    return Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve({ name: file.name, type: file.type, size: file.size, base64 });
      };
      reader.onerror = () => reject(new Error(`อ่านไฟล์ ${file.name} ไม่สำเร็จ`));
      reader.readAsDataURL(file);
    })));
  }

  function splitParticipants(value) {
    return String(value || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("th-TH").format(Number(value || 0));
  }

  function formatThaiDate(dateValue) {
    if (!dateValue) {
      return "-";
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }
    return new Intl.DateTimeFormat("th-TH", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function formatThaiDateTime(dateValue) {
    if (!dateValue) {
      return "-";
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatFieldValue(value, type) {
    if (!value) {
      return "-";
    }
    if (type === "date") {
      return formatThaiDate(value);
    }
    return String(value);
  }

  function toDateInput(value) {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function getFiscalYear(date) {
    const year = date.getFullYear();
    return date.getMonth() >= 9 ? year + 544 : year + 543;
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsa(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }
})();
