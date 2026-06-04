import {
  ACTIVITY_12_MONTH_KEYS,
  ACTIVITY_12_SECTIONS,
  ACTIVITY_DEFINITIONS,
  ACTIVITY_MAP,
  FY_MONTHS,
  MAX_RECENT_ITEMS,
  PAGE_SIZE,
} from "./constants.js";
import {
  escapeHtml,
  fiscalYearLabel,
  formatNumber,
  formatThaiDate,
  formatThaiDateTime,
  paginate,
  toDateInput,
} from "./utils.js";

export function renderAppShell({ config, route, bootstrap, selectedUnit, fiscalYear, content }) {
  const activeUnit = selectedUnit || route.unitName || "";
  return `
    <div class="app-shell">
      ${renderTopbar({ config, bootstrap, route, activeUnit, fiscalYear })}
      <main class="app-body">${content}</main>
      <footer class="footer">${escapeHtml(config.footerCredit)}</footer>
    </div>
  `;
}

function renderTopbarLegacy({ config, bootstrap, route, activeUnit, fiscalYear }) {
  const years = bootstrap?.availableFiscalYears || [];
  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          <img class="brand__logo" src="nurse-logo.png" alt="Nurse Logo" />
          <div>
            <div class="brand__eyebrow">Digital Healthcare Platform</div>
            <h1 class="brand__title">${escapeHtml(config.appName)}</h1>
            <p class="brand__subtitle">${escapeHtml(config.hospitalName)} | ${escapeHtml(config.missionName)}</p>
          </div>
        </div>
        <div class="topbar__actions">
          <label class="toolbar-select">
            <span class="sr-only">เน€เธฅเธทเธญเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“</span>
            <span class="toolbar-select__label">เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“</span>
            <select class="select select--toolbar" data-action="change-fiscal-year">
              ${years.map((year) => `<option value="${year}" ${Number(year) === Number(fiscalYear) ? "selected" : ""}>${fiscalYearLabel(year)}</option>`).join("")}
            </select>
          </label>
          ${activeUnit ? `<button class="button-secondary" data-action="open-unit-picker">เธชเธฅเธฑเธเธซเธเนเธงเธขเธเธฒเธ</button>` : ""}
          <button class="button-ghost" data-action="${route.name === "home" ? "open-org-report" : "go-home"}">
            ${route.name === "home" ? "เธฃเธฒเธขเธเธฒเธเธ เธฒเธเธฃเธงเธก" : "เธเธฅเธฑเธเธซเธเนเธฒเนเธฃเธ"}
          </button>
        </div>
      </div>
    </header>
  `;
}

export function renderShellSkeleton(config) {
  return `
    ${renderAppShell({
      config,
      route: { name: "home" },
      bootstrap: { availableFiscalYears: [new Date().getFullYear() + 543] },
      selectedUnit: "",
      fiscalYear: new Date().getFullYear() + 543,
      content: `
        <section class="workspace workspace--home">
          <div class="hero">
            <div class="hero__layout">
              <div>
                <p class="section-eyebrow">ระบบบันทึกการทบทวน</p>
                <div class="skeleton skeleton-line w-60"></div>
                <div style="height:12px"></div>
                <div class="skeleton skeleton-line w-100"></div>
                <div style="height:10px"></div>
                <div class="skeleton skeleton-line w-40"></div>
              </div>
              <div class="stats-band">
                ${Array.from({ length: 4 }, () => `<div class="stats-band__item"><div class="skeleton skeleton-line w-40"></div><div style="height:12px"></div><div class="skeleton skeleton-line w-60"></div></div>`).join("")}
              </div>
            </div>
          </div>
        </section>
      `,
    })}
  `;
}

export function renderHomePage({ config, bootstrap, fiscalYear }) {
  const organization = bootstrap.organizationDashboard || {
    summary: {},
    activityCounts: {},
    recentRecords: [],
    unitSummaries: [],
  };
  const unitRows = organization.unitSummaries || [];
  return renderAppShell({
    config,
    route: { name: "home" },
    bootstrap,
    selectedUnit: "",
    fiscalYear,
    content: `
      <section class="workspace workspace--home">
        <div>
          <section class="hero hero--overview">
            <div class="hero__layout hero__layout--overview">
              <div class="hero__content hero__content--overview">
                <p class="section-eyebrow">ระบบบันทึกการทบทวนทางคลินิก</p>
                <h2 class="hero__title hero__title--overview">Dashboard ภาพรวมระบบบันทึกการทบทวน 12 กิจกรรม</h2>
                <p class="hero__subtitle">ระบบนี้ใช้สำหรับบันทึกการทบทวนทางคลินิกตามหัวข้อกิจกรรม เพื่อการติดตามและสรุปผลรายหน่วยงาน ไม่ใช่การทำกิจกรรมการพยาบาล</p>
                <div class="hero__actions">
                  <button class="button button--hero" data-action="open-unit-picker">เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธซเธเนเธงเธขเธเธฒเธ</button>
                  <button class="button-secondary" data-action="open-org-report">เธเธดเธกเธเนเธฃเธฒเธขเธเธฒเธเธ เธฒเธเธฃเธงเธก</button>
                </div>
              </div>
              <div class="hero__summary hero__summary--overview">
                <div class="stats-band stats-band--hero-grid">
                  ${renderStatCard("เธเธณเธเธงเธเธเธฒเธฃเธเธฑเธเธ—เธถเธ", organization.summary.totalRecords, "เธ—เธธเธเธฃเธฒเธขเธเธฒเธฃเนเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธเธฑเธเธเธธเธเธฑเธ")}
                  ${renderStatCard("เธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเธกเธตเธเนเธญเธกเธนเธฅ", organization.summary.unitsWithData, "เธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเน€เธฃเธดเนเธกเนเธเนเธเธฒเธเนเธฅเนเธง")}
                  ${renderStatCard("เธ•เธฑเธงเธเธตเนเธงเธฑเธ”เธ—เธตเนเธ•เธดเธ”เธ•เธฒเธก", organization.summary.totalIndicators, "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12 เธ—เธธเธเธซเธเนเธงเธขเธเธฒเธ")}
                  ${renderStatCard("เธเธฃเธฐเน€เธ”เนเธเธ—เธตเนเธ•เนเธญเธเธ•เธดเธ”เธ•เธฒเธก", organization.summary.openIssues, "เธเธฃเธฐเน€เธ”เนเธเธเธฑเธเธซเธฒเธ—เธตเนเธขเธฑเธเธ•เนเธญเธเธ”เธณเน€เธเธดเธเธเธฒเธฃ")}
                </div>
                <div class="hero__meta hero__meta--hero">
                  <div class="data-strip__item">
                    <div class="stat-label">เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธ—เธตเนเนเธชเธ”เธ</div>
                    <div class="stat-value">${escapeHtml(fiscalYearLabel(fiscalYear))}</div>
                  </div>
                  <div class="data-strip__item">
                    <div class="stat-label">เธเธณเธเธงเธเธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเธ•เธฑเนเธเธเนเธฒ</div>
                    <div class="stat-value">${formatNumber((bootstrap.units || []).length)}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="layout-grid">
            <div class="panel">
              <div class="panel__head">
                <div>
                  <p class="section-eyebrow">Organization Monitoring</p>
                  <h3 class="section-title">เธชเธ–เธฒเธเธฐเธเธดเธเธเธฃเธฃเธกเธ—เธฑเนเธเธญเธเธเนเธเธฃ</h3>
                </div>
              </div>
              <div class="chart-bars">
                ${ACTIVITY_DEFINITIONS.concat([
                  { id: "12", shortTitle: "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12", title: "เธเธฒเธฃเธ•เธดเธ”เธ•เธฒเธกเน€เธเธฃเธทเนเธญเธเธเธตเนเธงเธฑเธ”เธชเธณเธเธฑเธ" },
                ])
                  .map((activity) =>
                    renderBarRow({
                      label: activity.shortTitle,
                      value: organization.activityCounts?.[activity.id] || 0,
                      maxValue: Math.max(
                        1,
                        ...Object.values(organization.activityCounts || {}).map((item) => Number(item || 0)),
                      ),
                    }),
                  )
                  .join("")}
              </div>
            </div>
            <div class="panel">
              <div class="panel__head">
                <div>
                  <p class="section-eyebrow">Latest Activity</p>
                  <h3 class="section-title">เธเธดเธเธเธฃเธฃเธกเธฅเนเธฒเธชเธธเธ”</h3>
                </div>
              </div>
              <div class="timeline">
                ${(organization.recentRecords || []).slice(0, MAX_RECENT_ITEMS).map(renderRecentRecordEntry).join("") || renderEmptyState("เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเนเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธเธตเน")}
              </div>
            </div>
          </section>

          <section class="table-shell" style="margin-top: 18px">
            <div class="table-shell__head">
              <div>
                <p class="section-eyebrow">Units</p>
                <h3 class="table-title">เธซเธเนเธงเธขเธเธฒเธเนเธเธฃเธฐเธเธ</h3>
                <p class="table-meta">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธเน€เธเธทเนเธญเน€เธเนเธฒเธชเธนเน dashboard เนเธฅเธฐเน€เธฃเธดเนเธกเธเธฑเธเธ—เธถเธเธเธดเธเธเธฃเธฃเธก</p>
              </div>
              <div class="table-actions">
                <button class="button-secondary" data-action="open-unit-picker">เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธซเธเนเธงเธขเธเธฒเธ</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>เธซเธเนเธงเธขเธเธฒเธ</th>
                    <th>เธเธณเธเธงเธเธเธฒเธฃเธเธฑเธเธ—เธถเธ</th>
                    <th>เธ•เธฑเธงเธเธตเนเธงเธฑเธ”</th>
                    <th>เธเธฃเธฐเน€เธ”เนเธเธ•เธดเธ”เธ•เธฒเธก</th>
                    <th>เธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”</th>
                    <th>เธ”เธณเน€เธเธดเธเธเธฒเธฃ</th>
                  </tr>
                </thead>
                <tbody>
                  ${unitRows
                    .map(
                      (item) => `
                        <tr>
                          <td>
                            <strong>${escapeHtml(item.unitName)}</strong>
                            <div class="muted">${escapeHtml(item.groupName || "เธซเธเนเธงเธขเธเธฒเธเธเธขเธฒเธเธฒเธฅ")}</div>
                          </td>
                          <td>${formatNumber(item.totalRecords)}</td>
                          <td>${formatNumber(item.totalIndicators)}</td>
                          <td>${formatNumber(item.openIssues)}</td>
                          <td>${escapeHtml(item.lastReviewDate ? formatThaiDate(item.lastReviewDate) : "-")}</td>
                          <td>
                            <button class="button-ghost" data-action="open-unit-dashboard" data-unit="${escapeHtml(item.unitName)}">เน€เธเธดเธ” Dashboard</button>
                          </td>
                        </tr>
                      `,
                    )
                    .join("") || `<tr><td colspan="6">${renderEmptyState("เธขเธฑเธเนเธกเนเธเธเธซเธเนเธงเธขเธเธฒเธเนเธเธเธฒเธเธเนเธญเธกเธนเธฅ")}</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    `,
  });
}
function renderHomePageLegacy({ config, bootstrap, fiscalYear }) {
  const organization = bootstrap.organizationDashboard || {
    summary: {},
    activityCounts: {},
    recentRecords: [],
    unitSummaries: [],
  };
  const unitRows = organization.unitSummaries || [];
  return renderAppShell({
    config,
    route: { name: "home" },
    bootstrap,
    selectedUnit: "",
    fiscalYear,
    content: `
      <section class="workspace workspace--home">
        <div>
          <section class="hero">
            <div class="hero__layout">
              <div>
                <p class="section-eyebrow">ระบบบันทึกการทบทวนทางคลินิก</p>
                <h2 class="hero__title">Dashboard ภาพรวมระบบบันทึกการทบทวน 12 กิจกรรม</h2>
                <p class="hero__subtitle">
                  ระบบนี้ใช้สำหรับบันทึกการทบทวนทางคลินิกตามหัวข้อกิจกรรม เพื่อการติดตามและสรุปผลรายหน่วยงาน ไม่ใช่การทำกิจกรรมการพยาบาล
                </p>
                <div class="hero__actions">
                  <button class="button" data-action="open-unit-picker">เธ—เธณเธเธฒเธฃเธเธฑเธเธ—เธถเธ</button>
                  <button class="button-secondary" data-action="open-org-report">เธเธดเธกเธเนเธฃเธฒเธขเธเธฒเธเธ เธฒเธเธฃเธงเธก</button>
                </div>
              </div>
              <div>
                <div class="stats-band">
                  ${renderStatCard("เธเธณเธเธงเธเธเธฒเธฃเธเธฑเธเธ—เธถเธ", organization.summary.totalRecords, "เธ—เธธเธเธฃเธฒเธขเธเธฒเธฃเนเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธเธฑเธเธเธธเธเธฑเธ")}
                  ${renderStatCard("เธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเธกเธตเธเนเธญเธกเธนเธฅ", organization.summary.unitsWithData, "เธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเน€เธฃเธดเนเธกเนเธเนเธเธฒเธเนเธฅเนเธง")}
                  ${renderStatCard("เธ•เธฑเธงเธเธตเนเธงเธฑเธ”เธ—เธตเนเธ•เธดเธ”เธ•เธฒเธก", organization.summary.totalIndicators, "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12 เธ—เธธเธเธซเธเนเธงเธขเธเธฒเธ")}
                  ${renderStatCard("เธเธฃเธฐเน€เธ”เนเธเธ—เธตเนเธ•เนเธญเธเธ•เธดเธ”เธ•เธฒเธก", organization.summary.openIssues, "เธเธฃเธฐเน€เธ”เนเธเธเธฑเธเธซเธฒเธ—เธตเนเธขเธฑเธเธ•เนเธญเธเธ”เธณเน€เธเธดเธเธเธฒเธฃ")}
                </div>
                <div class="hero__meta">
                  <div class="data-strip__item">
                    <div class="stat-label">เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธ—เธตเนเนเธชเธ”เธ</div>
                    <div class="stat-value">${escapeHtml(fiscalYearLabel(fiscalYear))}</div>
                  </div>
                  <div class="data-strip__item">
                    <div class="stat-label">เธเธณเธเธงเธเธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเธ•เธฑเนเธเธเนเธฒ</div>
                    <div class="stat-value">${formatNumber((bootstrap.units || []).length)}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="layout-grid">
            <div class="panel">
              <div class="panel__head">
                <div>
                  <p class="section-eyebrow">Organization Monitoring</p>
                  <h3 class="section-title">เธชเธ–เธฒเธเธฐเธเธดเธเธเธฃเธฃเธกเธ—เธฑเนเธเธญเธเธเนเธเธฃ</h3>
                </div>
              </div>
              <div class="chart-bars">
                ${ACTIVITY_DEFINITIONS.concat([
                  { id: "12", shortTitle: "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12", title: "เธเธฒเธฃเธ•เธดเธ”เธ•เธฒเธกเน€เธเธฃเธทเนเธญเธเธเธตเนเธงเธฑเธ”เธชเธณเธเธฑเธ" },
                ])
                  .map((activity) =>
                    renderBarRow({
                      label: activity.shortTitle,
                      value: organization.activityCounts?.[activity.id] || 0,
                      maxValue: Math.max(
                        1,
                        ...Object.values(organization.activityCounts || {}).map((item) => Number(item || 0)),
                      ),
                    }),
                  )
                  .join("")}
              </div>
            </div>
            <div class="panel">
              <div class="panel__head">
                <div>
                  <p class="section-eyebrow">Latest Activity</p>
                  <h3 class="section-title">เธเธดเธเธเธฃเธฃเธกเธฅเนเธฒเธชเธธเธ”</h3>
                </div>
              </div>
              <div class="timeline">
                ${(organization.recentRecords || []).slice(0, MAX_RECENT_ITEMS).map(renderRecentRecordEntry).join("") || renderEmptyState("เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเนเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธเธตเน")}
              </div>
            </div>
          </section>

          <section class="table-shell" style="margin-top: 18px">
            <div class="table-shell__head">
              <div>
                <p class="section-eyebrow">Units</p>
                <h3 class="table-title">เธซเธเนเธงเธขเธเธฒเธเนเธเธฃเธฐเธเธ</h3>
                <p class="table-meta">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธเน€เธเธทเนเธญเน€เธเนเธฒเธชเธนเน dashboard เนเธฅเธฐเน€เธฃเธดเนเธกเธเธฑเธเธ—เธถเธเธเธดเธเธเธฃเธฃเธก</p>
              </div>
              <div class="table-actions">
                <button class="button-secondary" data-action="open-unit-picker">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ</button>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>เธซเธเนเธงเธขเธเธฒเธ</th>
                    <th>เธเธณเธเธงเธเธเธฒเธฃเธเธฑเธเธ—เธถเธ</th>
                    <th>เธ•เธฑเธงเธเธตเนเธงเธฑเธ”</th>
                    <th>เธเธฃเธฐเน€เธ”เนเธเธ•เธดเธ”เธ•เธฒเธก</th>
                    <th>เธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”</th>
                    <th>เธ”เธณเน€เธเธดเธเธเธฒเธฃ</th>
                  </tr>
                </thead>
                <tbody>
                  ${unitRows
                    .map(
                      (item) => `
                        <tr>
                          <td>
                            <strong>${escapeHtml(item.unitName)}</strong>
                            <div class="muted">${escapeHtml(item.groupName || "เธซเธเนเธงเธขเธเธฒเธเธเธขเธฒเธเธฒเธฅ")}</div>
                          </td>
                          <td>${formatNumber(item.totalRecords)}</td>
                          <td>${formatNumber(item.totalIndicators)}</td>
                          <td>${formatNumber(item.openIssues)}</td>
                          <td>${escapeHtml(item.lastReviewDate ? formatThaiDate(item.lastReviewDate) : "-")}</td>
                          <td>
                            <button class="button-ghost" data-action="open-unit-dashboard" data-unit="${escapeHtml(item.unitName)}">เน€เธเธดเธ” Dashboard</button>
                          </td>
                        </tr>
                      `,
                    )
                    .join("") || `<tr><td colspan="6">${renderEmptyState("เธขเธฑเธเนเธกเนเธเธเธซเธเนเธงเธขเธเธฒเธเนเธเธเธฒเธเธเนเธญเธกเธนเธฅ")}</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    `,
  });
}

export function renderUnitPage({ config, bootstrap, route, fiscalYear, dashboard, activityData }) {
  const unitName = route.unitName;
  const content = route.name === "unit-dashboard"
    ? renderUnitDashboardContent({ unitName, fiscalYear, dashboard })
    : route.activityId === "12"
      ? renderActivity12Content({ unitName, fiscalYear, activityData })
      : renderActivityRecordsContent({ unitName, fiscalYear, activityId: route.activityId, activityData });

  return renderAppShell({
    config,
    route,
    bootstrap,
    selectedUnit: unitName,
    fiscalYear,
    content: `
      <section class="workspace">
        ${renderSidebar({ unitName, route, fiscalYear, dashboard })}
        <div>${content}</div>
      </section>
    `,
  });
}

function renderSidebarLegacy({ unitName, route, fiscalYear, dashboard }) {
  const activityCounts = dashboard?.activityCounts || {};
  return `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img src="nurse-logo.png" alt="Nurse Logo" />
        <div>
          <p class="section-eyebrow">พื้นที่ทำงานหน่วยงาน</p>
          <h2 class="sidebar__unit">${escapeHtml(unitName)}</h2>
        </div>
      </div>
      <div class="sidebar__meta">
        <div class="sidebar__meta-row">
          <div class="stat-label">ปีงบประมาณ</div>
          <strong>${escapeHtml(fiscalYearLabel(fiscalYear))}</strong>
        </div>
        <div class="sidebar__meta-row">
          <div class="stat-label">จำนวนบันทึก</div>
          <strong>${formatNumber(dashboard?.summary?.totalRecords || 0)}</strong>
        </div>
        <div class="sidebar__meta-row">
          <div class="stat-label">ประเด็นติดตาม</div>
          <strong>${formatNumber(dashboard?.summary?.openIssues || 0)}</strong>
        </div>
      </div>
      <div class="nav-list">
        <button class="nav-link ${route.name === "unit-dashboard" ? "is-active" : ""}" data-action="open-unit-dashboard" data-unit="${escapeHtml(unitName)}">
          <span>แดชบอร์ดหน่วยงาน</span>
          <span class="pill">${formatNumber(dashboard?.summary?.totalRecords || 0)}</span>
        </button>
        ${ACTIVITY_DEFINITIONS.map((activity) => {
          const isActive = route.name === "unit-activity" && route.activityId === activity.id;
          return `
            <button class="nav-link ${isActive ? "is-active" : ""}" data-action="open-activity" data-unit="${escapeHtml(unitName)}" data-activity="${activity.id}">
              <span>${escapeHtml(activity.shortTitle)}</span>
              <span class="pill">${formatNumber(activityCounts[activity.id] || 0)}</span>
            </button>
          `;
        }).join("")}
        <button class="nav-link ${route.name === "unit-activity" && route.activityId === "12" ? "is-active" : ""}" data-action="open-activity" data-unit="${escapeHtml(unitName)}" data-activity="12">
          <span>กิจกรรมที่ 12</span>
          <span class="pill">${formatNumber(activityCounts["12"] || 0)}</span>
        </button>
      </div>
    </aside>
  `;
}

function renderUnitDashboardContentLegacy({ unitName, fiscalYear, dashboard }) {
  return `
    <section class="hero">
      <div class="hero__layout">
        <div>
          <p class="section-eyebrow">Unit Dashboard</p>
          <h2 class="hero__title">${escapeHtml(unitName)}</h2>
          <p class="hero__subtitle">
            เธ เธฒเธเธฃเธงเธกเธเธฒเธฃเธ—เธเธ—เธงเธเธเธดเธเธเธฃเธฃเธก, เธชเธ–เธฒเธเธฐเธ•เธฑเธงเธเธตเนเธงเธฑเธ” เนเธฅเธฐเธเธดเธเธเธฃเธฃเธกเธฅเนเธฒเธชเธธเธ”เธเธญเธเธซเธเนเธงเธขเธเธฒเธเนเธ${escapeHtml(
              fiscalYearLabel(fiscalYear),
            )}
          </p>
          <div class="hero__actions">
            <button class="button" data-action="open-unit-picker">เธ—เธณเธเธฒเธฃเธเธฑเธเธ—เธถเธ</button>
            <button class="button-secondary" data-action="open-unit-report" data-unit="${escapeHtml(unitName)}">เธเธดเธกเธเนเธฃเธฒเธขเธเธฒเธเธซเธเนเธงเธขเธเธฒเธ</button>
          </div>
        </div>
        <div class="stats-band">
          ${renderStatCard("เธเธฑเธเธ—เธถเธเธฃเธงเธก", dashboard?.summary?.totalRecords || 0, "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 1-11")}
          ${renderStatCard("เธเธดเธเธเธฃเธฃเธกเธ—เธตเนเน€เธฃเธดเนเธกเนเธฅเนเธง", dashboard?.summary?.activitiesStarted || 0, "เธเธณเธเธงเธเธเธดเธเธเธฃเธฃเธกเธ—เธตเนเธกเธตเธเนเธญเธกเธนเธฅ")}
          ${renderStatCard("เธ•เธฑเธงเธเธตเนเธงเธฑเธ”เธ—เธตเนเนเธเนเธเธฒเธ", dashboard?.summary?.totalIndicators || 0, "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12")}
          ${renderStatCard("เธเธฃเธฐเน€เธ”เนเธเธ—เธตเนเธ•เนเธญเธเธ•เธดเธ”เธ•เธฒเธก", dashboard?.summary?.openIssues || 0, "Issue เนเธฅเธฐ action plan")}
        </div>
      </div>
    </section>

    <div class="layout-grid">
      <section class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Activity Overview</p>
            <h3 class="section-title">เธชเธ–เธฒเธเธฐเธเธฒเธฃเธ—เธเธ—เธงเธเธฃเธฒเธขเธเธดเธเธเธฃเธฃเธก</h3>
          </div>
        </div>
        <div class="panel__stack">
          ${ACTIVITY_DEFINITIONS.concat([{ id: "12", shortTitle: "เธเธดเธเธเธฃเธฃเธกเธ—เธตเน 12", title: "เธเธฒเธฃเธ•เธดเธ”เธ•เธฒเธกเน€เธเธฃเธทเนเธญเธเธเธตเนเธงเธฑเธ”เธชเธณเธเธฑเธ" }])
            .map((activity) => {
              const count = dashboard?.activityCounts?.[activity.id] || 0;
              return `
                <div class="metric-row">
                  <div>
                    <strong>${escapeHtml(activity.shortTitle)}</strong>
                    <div class="muted">${escapeHtml(activity.title)}</div>
                  </div>
                  <div class="inline-actions">
                    <span class="badge ${count ? "is-success" : ""}">${count ? "เธกเธตเธเนเธญเธกเธนเธฅ" : "เธฃเธญเน€เธฃเธดเนเธก"}</span>
                    <button class="button-ghost" data-action="open-activity" data-unit="${escapeHtml(unitName)}" data-activity="${activity.id}">เน€เธเธดเธ”</button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Recent Review</p>
            <h3 class="section-title">เธเธดเธเธเธฃเธฃเธกเธฅเนเธฒเธชเธธเธ”</h3>
          </div>
        </div>
        <div class="timeline">
          ${(dashboard?.recentRecords || []).slice(0, MAX_RECENT_ITEMS).map(renderRecentRecordEntry).join("") || renderEmptyState("เธขเธฑเธเนเธกเนเธกเธตเธเนเธญเธกเธนเธฅเธ—เธเธ—เธงเธเนเธเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“เธเธตเน")}
        </div>
      </section>
    </div>
  `;
}

function renderActivityRecordsContentLegacy({ unitName, fiscalYear, activityId, activityData }) {
  const definition = ACTIVITY_MAP[activityId];
  const searchValue = activityData.searchValue || "";
  const records = activityData.records || [];
  const pager = paginate(records, activityData.page || 1, PAGE_SIZE);
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <p class="section-eyebrow">${escapeHtml(definition.shortTitle)}</p>
          <h2 class="page-title">${escapeHtml(definition.title)}</h2>
          <p class="table-meta">${escapeHtml(unitName)} | ${escapeHtml(fiscalYearLabel(fiscalYear))}</p>
        </div>
        <div class="panel__actions">
          <button class="button" data-action="new-record" data-activity="${activityId}" data-unit="${escapeHtml(unitName)}">เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃ</button>
          <button class="button-secondary" data-action="open-unit-report" data-unit="${escapeHtml(unitName)}">เธฃเธฒเธขเธเธฒเธเธซเธเนเธงเธขเธเธฒเธ</button>
        </div>
      </div>
      <div class="search-panel">
        <div class="search-grid">
          <label>
            <span class="field-label">เธเนเธเธซเธฒเธเนเธญเธกเธนเธฅเนเธเธซเธเนเธงเธขเธเธงเธฒเธกเธเธณ</span>
            <input class="input" type="search" name="activitySearch" value="${escapeHtml(searchValue)}" placeholder="เธเนเธเธซเธฒเธเธฒเธเธเธนเนเธเธณเธ—เธเธ—เธงเธ, เธซเธกเธฒเธขเน€เธซเธ•เธธ เธซเธฃเธทเธญเธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข" data-action="update-activity-search" />
          </label>
          <div class="metric-row">
            <div>
              <div class="stat-label">เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเธ—เธฑเนเธเธซเธกเธ”</div>
              <strong>${formatNumber(records.length)}</strong>
            </div>
            <div>
              <div class="stat-label">เน€เธฃเธตเธขเธเธฅเธณเธ”เธฑเธ</div>
              <strong>เธฅเนเธฒเธชเธธเธ”เธเธถเนเธเธเนเธญเธ</strong>
            </div>
          </div>
          <div class="metric-row">
            <div>
              <div class="stat-label">เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ</div>
              <strong>Cached in memory</strong>
            </div>
            <div class="hint">Pagination 10 เนเธ–เธงเธ•เนเธญเธซเธเนเธฒ</div>
          </div>
        </div>
      </div>

      <section class="table-shell" style="margin-top: 18px">
        <div class="table-toolbar">
          <div>
            <h3 class="table-title">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธ</h3>
            <p class="table-meta">เธเนเธญเธกเธนเธฅเธฅเนเธฒเธชเธธเธ”เนเธชเธ”เธเธเนเธญเธ เนเธฅเธฐเนเธเนเธเธซเธเนเธฒเน€เธเธทเนเธญเนเธซเน render เธฅเธทเนเธเนเธกเนเธเนเธญเธกเธนเธฅเธเธณเธเธงเธเธกเธฒเธ</p>
          </div>
          <div class="table-caption">Showing ${formatNumber(pager.start)}-${formatNumber(pager.end)} of ${formatNumber(pager.total)}</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เธงเธฑเธเธ—เธตเนเธ—เธเธ—เธงเธ</th>
                <th>เธเธนเนเธเธณเธเธฒเธฃเธ—เธเธ—เธงเธ</th>
                <th>เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</th>
                <th>เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข</th>
                <th>เนเธเธเนเธเธฅเน</th>
                <th>เธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”</th>
                <th>เธ”เธณเน€เธเธดเธเธเธฒเธฃ</th>
              </tr>
            </thead>
            <tbody>
              ${pager.items
                .map(
                  (record) => `
                    <tr>
                      <td>${escapeHtml(formatThaiDate(record.reviewDate))}</td>
                      <td>
                        <strong>${escapeHtml(record.reviewLeader)}</strong>
                        <div class="muted">${escapeHtml(record.note || "-")}</div>
                      </td>
                      <td>${escapeHtml((record.participants || []).map((item) => item.name).filter(Boolean).join(", ") || "-")}</td>
                      <td>${formatNumber((record.rows || []).length || 0)}</td>
                      <td>${formatNumber((record.attachments || []).length || 0)}</td>
                      <td>${escapeHtml(formatThaiDateTime(record.updatedAt))}</td>
                      <td>
                        <div class="table-actions">
                          <button class="button-ghost" data-action="view-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เธ”เธน</button>
                          <button class="button-secondary" data-action="edit-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เนเธเนเนเธ</button>
                          <button class="button-danger" data-action="delete-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เธฅเธ</button>
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("") || `<tr><td colspan="7">${renderEmptyState("เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเธชเธณเธซเธฃเธฑเธเธเธดเธเธเธฃเธฃเธกเธเธตเน")}</td></tr>`}
            </tbody>
          </table>
        </div>
        ${renderPagination(pager, "change-activity-page")}
      </section>
    </section>
  `;
}

function renderActivity12ContentLegacy({ unitName, fiscalYear, activityData }) {
  const searchValue = activityData.searchValue || "";
  const indicatorRows = activityData.filteredCatalog || [];
  const valueMap = activityData.valueMap || {};
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <p class="section-eyebrow">กิจกรรมที่ 12</p>
          <h2 class="page-title">การติดตามเครื่องชี้วัดสำคัญ</h2>
          <p class="table-meta">${escapeHtml(unitName)} | ${escapeHtml(fiscalYearLabel(fiscalYear))}</p>
        </div>
        <div class="panel__actions">
          <button class="button" data-action="new-indicator">เพิ่มเครื่องชี้วัด</button>
          <button class="button-secondary" data-action="new-indicator-issue">เพิ่มประเด็นที่ยังมีปัญหา</button>
        </div>
      </div>

      <div class="search-panel">
        <div class="search-grid">
          <label>
            <span class="field-label">ค้นหาเครื่องชี้วัด</span>
            <input class="input" type="search" value="${escapeHtml(searchValue)}" placeholder="ค้นหาจากชื่อเครื่องชี้วัดหรือคำอธิบาย" data-action="update-activity12-search" />
          </label>
          <div class="metric-row">
            <div>
              <div class="stat-label">ข้อมูลปีงบประมาณ</div>
              <strong>ต.ค. - ก.ย.</strong>
            </div>
            <div class="hint">Responsive enterprise data table</div>
          </div>
        </div>
      </div>

      <section class="table-shell" style="margin-top: 18px">
        <div class="table-shell__head">
          <div>
            <p class="section-eyebrow">Indicator Table</p>
            <h3 class="table-title">รายการเครื่องชี้วัดและผลการติดตาม</h3>
            <p class="table-meta">จัดการเครื่องชี้วัดได้ต่อเนื่องตลอดปีงบประมาณ</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เครื่องชี้วัด</th>
                <th>เป้าหมาย</th>
                <th>ผลรายปีงบประมาณ</th>
                <th>สรุป/หมายเหตุ</th>
                <th>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              ${indicatorRows
                .map((indicator) => {
                  const payload = valueMap[indicator.indicatorId] || {};
                  return `
                    <tr>
                      <td>
                        <strong>${escapeHtml(indicator.indicatorName)}</strong>
                        <div class="muted">${escapeHtml(indicator.description || "-")}</div>
                      </td>
                      <td>${escapeHtml([indicator.targetValue, indicator.targetUnit].filter(Boolean).join(" ") || "-")}</td>
                      <td>${renderIndicatorMonths(payload)}</td>
                      <td>${escapeHtml(payload.summary || payload.remark || "-")}</td>
                      <td>
                        <div class="table-actions">
                          <button class="button-ghost" data-action="edit-indicator-values" data-indicator-id="${escapeHtml(indicator.indicatorId)}">บันทึกผล</button>
                          <button class="button-secondary" data-action="edit-indicator" data-indicator-id="${escapeHtml(indicator.indicatorId)}">แก้ไข</button>
                          <button class="button-danger" data-action="delete-indicator" data-indicator-id="${escapeHtml(indicator.indicatorId)}">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join("") || `<tr><td colspan="5">${renderEmptyState("ยังไม่พบข้อมูลตัวชี้วัด")}</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel" style="margin-top: 18px">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Issue Tracking</p>
            <h3 class="section-title">สรุปประเด็นตัวชี้วัดที่ยังมีปัญหาต้องดำเนินแก้ไข</h3>
          </div>
          <div class="panel__actions">
            <button class="button-secondary" data-action="new-indicator-issue">เพิ่มประเด็น</button>
          </div>
        </div>
        <div class="indicator-issues">
          ${(activityData.issues || [])
            .map(
              (issue) => `
                <div class="issue-strip">
                  <div class="record-strip">
                    <div>
                      <strong>${escapeHtml(issue.indicatorName || "-")}</strong>
                    </div>
                    <div class="table-actions">
                      <button class="button-ghost" data-action="edit-indicator-issue" data-issue-id="${escapeHtml(issue.issueId)}">แก้ไข</button>
                      <button class="button-danger" data-action="delete-indicator-issue" data-issue-id="${escapeHtml(issue.issueId)}">ลบ</button>
                    </div>
                  </div>
                  <div style="margin-top: 10px"><strong>ปัญหา:</strong> ${escapeHtml(issue.problem || "-")}</div>
                  <div style="margin-top: 6px"><strong>แผนแก้ไข:</strong> ${escapeHtml(issue.actionPlan || "-")}</div>
                  <div style="margin-top: 6px"><strong>ติดตามผล:</strong> ${escapeHtml(issue.followUp || "-")}</div>
                </div>
              `,
            )
            .join("") || renderEmptyState("ยังไม่มีประเด็นที่ต้องติดตามแก้ไข")}
        </div>
      </section>
    </section>
  `;
}
export function renderModalShell({ title, subtitle = "", body, footer = "", size = "md", closeOnOverlay = false }) {
  return `
    <div class="modal-overlay" data-close-overlay="${closeOnOverlay ? "true" : "false"}">
      <div class="modal-card" data-size="${size}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="modal-header">
          <div class="record-strip">
            <div>
              <h3 class="modal-title">${escapeHtml(title)}</h3>
              ${subtitle ? `<p class="modal-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            </div>
            <button class="button-ghost" data-action="close-modal">เธเธดเธ”</button>
          </div>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer modal-actions">${footer}</div>` : ""}
      </div>
    </div>
  `;
}

export function renderUnitPickerModal(units) {
  const options = units
    .map(
      (item) => `
        <option value="${escapeHtml(item.unitName)}">
          ${escapeHtml(item.unitName)}${item.groupName ? ` - ${escapeHtml(item.groupName)}` : ""}
        </option>
      `,
    )
    .join("");
  const body = `
    <div class="modal-stack">
      <div class="search-panel">
        <p class="hint">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธเธเธฒเธเธฃเธฒเธขเธเธฒเธฃเธ”เนเธฒเธเธฅเนเธฒเธ เนเธฅเนเธงเน€เธเนเธฒเธชเธนเนเธซเธเนเธฒ Dashboard เธเธญเธเธซเธเนเธงเธขเธเธฒเธเธเธฑเนเธเนเธ”เนเธ—เธฑเธเธ—เธต</p>
      </div>
      <div class="table-shell">
        <div class="modal-form">
          <label>
            <span class="field-label">เธซเธเนเธงเธขเธเธฒเธ</span>
            <select id="unitPickerSelect" class="select">
              <option value="">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ</option>
              ${options}
            </select>
          </label>
          <div class="modal-actions">
            <button class="button button--hero" data-action="confirm-pick-unit">เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธซเธเนเธงเธขเธเธฒเธ</button>
            <button class="button-ghost" data-action="close-modal">เธขเธเน€เธฅเธดเธ</button>
          </div>
        </div>
      </div>
    </div>
  `;
  return renderModalShell({ title: "เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ", subtitle: "เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธเธญเธเธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเนเธเนเธเธฒเธ", body, size: "md" });
}

function renderUnitPickerModalLegacy(units) {
  const body = `
    <div class="modal-stack">
      <div class="search-panel">
        <p class="hint">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธเน€เธเธทเนเธญเน€เธเนเธฒเธชเธนเน Dashboard เนเธฅเธฐเธเธฑเธเธ—เธถเธเธเธดเธเธเธฃเธฃเธก</p>
      </div>
      <div class="table-shell">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เธเธฅเธธเนเธกเธเธฒเธ</th>
                <th>เธซเธเนเธงเธขเธเธฒเธ</th>
                <th>เธ”เธณเน€เธเธดเธเธเธฒเธฃ</th>
              </tr>
            </thead>
            <tbody>
              ${units
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.groupName || "-")}</td>
                      <td><strong>${escapeHtml(item.unitName)}</strong></td>
                      <td><button class="button" data-action="pick-unit" data-unit="${escapeHtml(item.unitName)}">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ</button></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  return renderModalShell({ title: "เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ", subtitle: "Custom modal เธชเธณเธซเธฃเธฑเธเน€เธฃเธดเนเธกเธเธฒเธฃเธเธฑเธเธ—เธถเธ", body, size: "lg" });
}

export function renderRecordFormModal({ config, unitName, fiscalYear, definition, record, draft }) {
  const source = draft || record || {};
  const participants = source.participants?.length ? source.participants : [{ name: "" }];
  const rows = source.rows?.length ? source.rows : [createEmptyRow(definition)];
  const summaryFields = definition.summaryFields || [];
  const body = `
    <form id="recordForm" class="modal-form" data-form-type="record" data-activity-id="${definition.id}" data-record-id="${escapeHtml(record?.recordId || "")}" data-created-at="${escapeHtml(record?.createdAt || "")}">
      ${draft ? `<div class="draft-banner">เธเธนเนเธเธทเธเธเนเธญเธกเธนเธฅเธเธเธฑเธเธฃเนเธฒเธเธฅเนเธฒเธชเธธเธ”เนเธฅเนเธง เธชเธฒเธกเธฒเธฃเธ–เนเธเนเนเธเธ•เนเธญเนเธฅเธฐเธเธฑเธเธ—เธถเธเธเธฃเธดเธเนเธ”เนเธ—เธฑเธเธ—เธต</div>` : ""}
      <div class="form-grid">
        <label>
          <span class="field-label">เธงเธฑเธเธ—เธตเนเธ—เธเธ—เธงเธ <span class="error-text">*</span></span>
          <input class="input" type="date" name="reviewDate" value="${escapeHtml(toDateInput(source.reviewDate))}" required />
        </label>
        <label>
          <span class="field-label">เธเธทเนเธญเธเธนเนเธเธณเธเธฒเธฃเธ—เธเธ—เธงเธ <span class="error-text">*</span></span>
          <input class="input" type="text" name="reviewLeader" value="${escapeHtml(source.reviewLeader || "")}" required />
        </label>
      </div>

      <div class="field-stack">
        <div class="record-strip">
          <div>
            <h4 class="section-title">เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</h4>
            <p class="muted">เน€เธเธดเนเธก/เธฅเธเนเธ–เธงเนเธ”เนเนเธกเนเธเธณเธเธฑเธ”</p>
          </div>
          <button class="button-ghost" type="button" data-action="add-participant-row">เน€เธเธดเนเธกเธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</button>
        </div>
        <div class="participants-list" data-participants-list>
          ${participants.map((participant, index) => renderParticipantRow(participant, index)).join("")}
        </div>
      </div>

      ${summaryFields.length
        ? `
          <div class="field-stack">
            <div class="record-strip">
              <div>
                <h4 class="section-title">เธเนเธญเธกเธนเธฅเธชเธฃเธธเธเธฃเธฐเธ”เธฑเธเธเธญเธฃเนเธก</h4>
                <p class="muted">เธชเนเธงเธเธเธตเนเนเธเนเธชเธณเธซเธฃเธฑเธเธเนเธญเธกเธนเธฅเธ เธฒเธเธฃเธงเธกเธเธญเธเธเธดเธเธเธฃเธฃเธก</p>
              </div>
            </div>
            <div class="field-grid">
              ${summaryFields.map((field) => renderFormField(field, source.meta?.[field.name] ?? "")).join("")}
            </div>
          </div>
        `
        : ""}

      <div class="field-stack">
        <div class="record-strip">
          <div>
            <h4 class="section-title">${escapeHtml(definition.rowLabel || "เธฃเธฒเธขเธเธฒเธฃเธเธฑเธเธ—เธถเธ")}</h4>
            <p class="muted">เธฃเธญเธเธฃเธฑเธ dynamic row เนเธฅเธฐเน€เธเนเธเธเนเธญเธกเธนเธฅเธ•เธฒเธกเธซเธฑเธงเธเนเธญเธเธดเธเธเธฃเธฃเธก</p>
          </div>
          <button class="button-ghost" type="button" data-action="add-record-row">เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข</button>
        </div>
        <div class="dynamic-rows" data-dynamic-rows>
          ${rows.map((row, index) => renderDynamicRow(definition, row, index)).join("")}
        </div>
      </div>

      <div class="field-stack">
        <label>
          <span class="field-label">เธซเธกเธฒเธขเน€เธซเธ•เธธ</span>
          <textarea class="textarea" name="note">${escapeHtml(source.note || "")}</textarea>
        </label>
      </div>

      <div class="field-stack">
        <div class="record-strip">
          <div>
            <h4 class="section-title">เนเธเธเนเธเธฅเนเน€เธเธดเนเธกเน€เธ•เธดเธก</h4>
            <p class="muted">เนเธกเนเธเธฑเธเธเธฑเธเนเธเธ เธชเธนเธเธชเธธเธ” ${config.attachments.maxFiles} เนเธเธฅเน เธฃเธญเธเธฃเธฑเธ drag & drop</p>
          </div>
        </div>
        <div class="dropzone" data-dropzone>
          <div>
            <strong>เธฅเธฒเธเนเธเธฅเนเธกเธฒเธงเธฒเธเธ—เธตเนเธเธตเน</strong>
            <div class="muted">เธซเธฃเธทเธญเน€เธฅเธทเธญเธเนเธเธฅเนเธ”เนเธงเธขเธเธธเนเธกเธ”เนเธฒเธเธฅเนเธฒเธ</div>
            <div style="height: 12px"></div>
            <label class="button-secondary">
              เน€เธฅเธทเธญเธเนเธเธฅเน
              <input class="hidden" type="file" data-file-input multiple />
            </label>
          </div>
        </div>
        <div class="file-preview-list" data-file-preview-list>
          ${renderExistingAttachments(source.attachments || [])}
        </div>
      </div>
    </form>
  `;
  const footer = `
    <button class="button-ghost" type="button" data-action="clear-record-draft">เธฅเนเธฒเธ Draft</button>
    <button class="button-secondary" type="button" data-action="close-modal">เธขเธเน€เธฅเธดเธ</button>
    <button class="button" type="submit" form="recordForm">เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅ</button>
  `;
  return renderModalShell({
    title: record ? `เนเธเนเนเธ ${definition.shortTitle}` : `เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃ ${definition.shortTitle}`,
    subtitle: `${unitName} | ${fiscalYearLabel(fiscalYear)}`,
    body,
    footer,
    size: "lg",
  });
}

export function renderRecordDetailModal({ definition, record }) {
  const rows = record.rows || [];
  const body = `
    <div class="modal-stack">
      <div class="data-strip">
        <div class="data-strip__item">
          <div class="stat-label">เธงเธฑเธเธ—เธตเนเธ—เธเธ—เธงเธ</div>
          <strong>${escapeHtml(formatThaiDate(record.reviewDate))}</strong>
        </div>
        <div class="data-strip__item">
          <div class="stat-label">เธเธนเนเธเธณเธเธฒเธฃเธ—เธเธ—เธงเธ</div>
          <strong>${escapeHtml(record.reviewLeader || "-")}</strong>
        </div>
        <div class="data-strip__item">
          <div class="stat-label">เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</div>
          <strong>${escapeHtml((record.participants || []).map((item) => item.name).join(", ") || "-")}</strong>
        </div>
      </div>
      ${record.meta && Object.keys(record.meta).length
        ? `
          <div class="panel">
            <div class="panel__head">
              <div>
                <p class="section-eyebrow">Summary</p>
                <h4 class="section-title">เธเนเธญเธกเธนเธฅเธชเธฃเธธเธเธฃเธฐเธ”เธฑเธเธเธญเธฃเนเธก</h4>
              </div>
            </div>
            <div class="field-grid">
              ${Object.entries(record.meta)
                .map(
                  ([key, value]) => `
                    <div class="year-grid__cell">
                      <div class="stat-label">${escapeHtml(
                        definition.summaryFields?.find((field) => field.name === key)?.label || key,
                      )}</div>
                      <strong>${escapeHtml(value || "-")}</strong>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        `
        : ""}
      <div class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Rows</p>
            <h4 class="section-title">เธซเธฑเธงเธเนเธญเธเธฒเธฃเธเธฑเธเธ—เธถเธ</h4>
          </div>
        </div>
        <div class="dynamic-rows">
          ${rows.map((row, index) => renderRowPreview(definition, row, index)).join("")}
        </div>
      </div>
      <div class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Attachments</p>
            <h4 class="section-title">เนเธเธฅเนเนเธเธเนเธฅเธฐเธซเธกเธฒเธขเน€เธซเธ•เธธ</h4>
          </div>
        </div>
        <div class="file-preview-list">
          ${(record.attachments || []).map((attachment) => renderAttachmentChip(attachment)).join("") || "<div class='muted'>เนเธกเนเธกเธตเนเธเธฅเนเนเธเธ</div>"}
        </div>
        <div style="margin-top: 14px"><strong>เธซเธกเธฒเธขเน€เธซเธ•เธธ:</strong> ${escapeHtml(record.note || "-")}</div>
      </div>
    </div>
  `;
  return renderModalShell({
    title: `เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” ${definition.shortTitle}`,
    subtitle: definition.title,
    body,
    footer: `<button class="button-secondary" type="button" data-action="close-modal">เธเธดเธ”</button>`,
    size: "lg",
  });
}

export function renderIndicatorModal({ indicator, unitName }) {
  const body = `
    <form id="indicatorForm" class="modal-form" data-form-type="indicator" data-indicator-id="${escapeHtml(indicator?.indicatorId || "")}">
      <div class="form-grid">
        <label>
          <span class="field-label">ลำดับการแสดงผล</span>
          <input class="input" type="number" name="sortOrder" value="${escapeHtml(indicator?.sortOrder ?? "")}" />
        </label>
      </div>
      <label>
        <span class="field-label">ชื่อเครื่องชี้วัด <span class="error-text">*</span></span>
        <input class="input" type="text" name="indicatorName" value="${escapeHtml(indicator?.indicatorName || "")}" required />
      </label>
      <div class="form-grid">
        <label>
          <span class="field-label">ค่าเป้าหมาย</span>
          <input class="input" type="text" name="targetValue" value="${escapeHtml(indicator?.targetValue || "")}" />
        </label>
        <label>
          <span class="field-label">หน่วย</span>
          <input class="input" type="text" name="targetUnit" value="${escapeHtml(indicator?.targetUnit || "")}" />
        </label>
      </div>
      <label>
        <span class="field-label">คำอธิบาย</span>
        <textarea class="textarea" name="description">${escapeHtml(indicator?.description || "")}</textarea>
      </label>
      <input type="hidden" name="unitName" value="${escapeHtml(unitName)}" />
    </form>
  `;
  return renderModalShell({
    title: indicator ? "แก้ไขเครื่องชี้วัด" : "เพิ่มเครื่องชี้วัดใหม่",
    subtitle: "กิจกรรมที่ 12",
    body,
    footer: `
      <button class="button-secondary" type="button" data-action="close-modal">ยกเลิก</button>
      <button class="button" type="submit" form="indicatorForm">บันทึกเครื่องชี้วัด</button>
    `,
    size: "md",
  });
}
export function renderIndicatorValuesModal({ indicator, valuePayload, fiscalYear }) {
  const body = `
    <form id="indicatorValuesForm" class="modal-form" data-form-type="indicator-values" data-indicator-id="${escapeHtml(indicator.indicatorId)}">
      <div class="record-strip">
        <div>
          <strong>${escapeHtml(indicator.indicatorName)}</strong>
          <div class="muted">${escapeHtml(fiscalYearLabel(fiscalYear))}</div>
        </div>
      </div>
      <div class="year-grid">
        ${FY_MONTHS.map(
          (month) => `
            <label class="year-grid__cell">
              <span class="field-label">${escapeHtml(month.label)}</span>
              <input class="input" type="text" name="${month.key}" value="${escapeHtml(valuePayload?.[month.key] || "")}" />
            </label>
          `,
        ).join("")}
      </div>
      <label>
        <span class="field-label">ประจำปีงบประมาณ ${escapeHtml(String(fiscalYear))}</span>
        <textarea class="textarea" name="summary">${escapeHtml(valuePayload?.summary || "")}</textarea>
      </label>
      <label>
        <span class="field-label">หมายเหตุเพิ่มเติม</span>
        <textarea class="textarea" name="remark">${escapeHtml(valuePayload?.remark || "")}</textarea>
      </label>
    </form>
  `;
  return renderModalShell({
    title: "บันทึกผลตัวชี้วัด",
    subtitle: "ข้อมูลรายปีงบประมาณ",
    body,
    footer: `
      <button class="button-secondary" type="button" data-action="close-modal">ยกเลิก</button>
      <button class="button" type="submit" form="indicatorValuesForm">บันทึกผล</button>
    `,
    size: "lg",
  });
}
export function renderIndicatorIssueModal({ issue, indicators }) {
  const body = `
    <form id="indicatorIssueForm" class="modal-form" data-form-type="indicator-issue" data-issue-id="${escapeHtml(issue?.issueId || "")}">
      <label>
        <span class="field-label">เลือกเครื่องชี้วัด <span class="error-text">*</span></span>
        <select class="select" name="indicatorId" required>
          <option value="">เลือกเครื่องชี้วัด</option>
          ${indicators
            .map(
              (indicator) => `
                <option value="${escapeHtml(indicator.indicatorId)}" ${indicator.indicatorId === issue?.indicatorId ? "selected" : ""}>
                  ${escapeHtml(indicator.indicatorName)}
                </option>
              `,
            )
            .join("")}
        </select>
      </label>
      <label>
        <span class="field-label">สรุปปัญหาที่พบ</span>
        <textarea class="textarea" name="problem">${escapeHtml(issue?.problem || "")}</textarea>
      </label>
      <label>
        <span class="field-label">แผนดำเนินการแก้ไข</span>
        <textarea class="textarea" name="actionPlan">${escapeHtml(issue?.actionPlan || "")}</textarea>
      </label>
      <label>
        <span class="field-label">ผลการติดตาม</span>
        <textarea class="textarea" name="followUp">${escapeHtml(issue?.followUp || "")}</textarea>
      </label>
    </form>
  `;
  return renderModalShell({
    title: issue ? "แก้ไขประเด็นติดตาม" : "เพิ่มประเด็นติดตาม",
    subtitle: "กิจกรรมที่ 12",
    body,
    footer: `
      <button class="button-secondary" type="button" data-action="close-modal">ยกเลิก</button>
      <button class="button" type="submit" form="indicatorIssueForm">บันทึกประเด็นติดตาม</button>
    `,
    size: "md",
  });
}
export function renderConfirmModal({ title, message, confirmAction, payload = {} }) {
  const body = `<div class="panel"><p>${escapeHtml(message)}</p></div>`;
  return renderModalShell({
    title,
    body,
    footer: `
      <button class="button-secondary" type="button" data-action="close-modal">เธขเธเน€เธฅเธดเธ</button>
      <button class="button-danger" type="button" data-action="${confirmAction}" ${Object.entries(payload)
        .map(([key, value]) => `data-${key}="${escapeHtml(String(value))}"`)
        .join(" ")}>เธขเธทเธเธขเธฑเธ</button>
    `,
    size: "sm",
  });
}

export function renderReportModal({ bundle, scopeLabel }) {
  const body = `
    <div class="report-wrap">
      ${(bundle.units || []).map((unit) => renderReportSheet(unit, bundle.fiscalYear)).join("")}
    </div>
  `;
  return renderModalShell({
    title: "Report Preview",
    subtitle: scopeLabel,
    body,
    footer: `
      <button class="button-secondary" type="button" data-action="close-modal">เธเธดเธ”</button>
      <button class="button" type="button" data-action="print-report">เธเธดเธกเธเน / Export PDF</button>
    `,
    size: "lg",
  });
}

export function renderToast(message, tone = "success") {
  return `
    <div class="toast toast--${tone}">
      <strong>${tone === "error" ? "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”" : "เธชเธณเน€เธฃเนเธ"}</strong>
      <div class="muted">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderFilePreviews(existingAttachments, newFiles) {
  const existingHtml = renderExistingAttachments(existingAttachments);
  const newHtml = (newFiles || [])
    .map(
      (file, index) => `
        <div class="file-preview">
          <div>
            <strong>${escapeHtml(file.name)}</strong>
            <div class="muted">${formatBytes(file.size || 0)}</div>
          </div>
          <button class="button-ghost" type="button" data-action="remove-new-file" data-file-index="${index}">เธเธณเธญเธญเธ</button>
        </div>
      `,
    )
    .join("");
  return existingHtml + newHtml || "<div class='muted'>เธขเธฑเธเนเธกเนเธกเธตเนเธเธฅเนเนเธเธ</div>";
}

export function renderParticipantRow(participant = {}, index = 0) {
  return `
    <div class="participant-row" data-participant-row="${index}">
      <div class="participant-row__grid">
        <label>
          <span class="field-label">เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ ${index + 1}</span>
          <input class="input" type="text" name="participantName[]" value="${escapeHtml(participant.name || "")}" />
        </label>
        <button class="button-ghost" type="button" data-action="remove-participant-row">เธฅเธเนเธ–เธง</button>
      </div>
    </div>
  `;
}

export function renderDynamicRow(definition, row = {}, index = 0) {
  return `
    <div class="dynamic-row" data-dynamic-row="${index}">
      <div class="record-strip">
        <div>
          <strong>${escapeHtml(definition.rowLabel || "เธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข")} ${index + 1}</strong>
          <div class="muted">${escapeHtml(definition.shortTitle)}</div>
        </div>
        <button class="button-ghost" type="button" data-action="remove-record-row">เธฅเธเธฃเธฒเธขเธเธฒเธฃ</button>
      </div>
      <div class="form-grid" style="margin-top: 12px">
        ${definition.rowFields.map((field) => renderFormField(field, row[field.name] ?? "", `row__${index}__${field.name}`)).join("")}
      </div>
    </div>
  `;
}

function renderRowPreview(definition, row = {}, index = 0) {
  return `
    <div class="dynamic-row">
      <strong>${escapeHtml(definition.rowLabel || "เธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข")} ${index + 1}</strong>
      <div class="form-grid" style="margin-top: 12px">
        ${definition.rowFields
          .map(
            (field) => `
              <div class="year-grid__cell">
                <div class="stat-label">${escapeHtml(field.label)}</div>
                <strong>${escapeHtml(row[field.name] || "-")}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function createEmptyRow(definition) {
  return definition.rowFields.reduce((row, field) => {
    row[field.name] = "";
    return row;
  }, {});
}

function renderFormField(field, value = "", overrideName = "") {
  const name = overrideName || field.name;
  if (field.type === "textarea") {
    return `
      <label>
        <span class="field-label">${escapeHtml(field.label)}${field.required ? ' <span class="error-text">*</span>' : ""}</span>
        <textarea class="textarea" name="${escapeHtml(name)}" ${field.required ? "required" : ""}>${escapeHtml(value)}</textarea>
      </label>
    `;
  }
  if (field.type === "select") {
    return `
      <label>
        <span class="field-label">${escapeHtml(field.label)}${field.required ? ' <span class="error-text">*</span>' : ""}</span>
        <select class="select" name="${escapeHtml(name)}" ${field.required ? "required" : ""}>
          <option value="">เน€เธฅเธทเธญเธเธเนเธญเธกเธนเธฅ</option>
          ${(field.options || [])
            .map((option) => `<option value="${escapeHtml(option)}" ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`)
            .join("")}
        </select>
      </label>
    `;
  }
  return `
    <label>
      <span class="field-label">${escapeHtml(field.label)}${field.required ? ' <span class="error-text">*</span>' : ""}</span>
      <input class="input" type="${field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}" name="${escapeHtml(name)}" value="${escapeHtml(field.type === "date" ? toDateInput(value) : value)}" ${field.required ? "required" : ""} />
    </label>
  `;
}

function renderExistingAttachments(attachments = []) {
  return attachments.map((attachment) => renderAttachmentChip(attachment, true)).join("");
}

function renderAttachmentChip(attachment, removable = false) {
  return `
    <div class="file-preview">
      <div>
        <strong>${escapeHtml(attachment.name || "เนเธเธฅเนเนเธเธ")}</strong>
        <div class="muted">${attachment.url ? `<a href="${escapeHtml(attachment.url)}" target="_blank" rel="noopener">เน€เธเธดเธ”เนเธเธฅเน</a>` : formatBytes(attachment.size || 0)}</div>
      </div>
      ${removable ? `<button class="button-ghost" type="button" data-action="remove-existing-file" data-file-id="${escapeHtml(attachment.fileId || attachment.name || "")}">เธเธณเธญเธญเธ</button>` : ""}
    </div>
  `;
}

function renderPagination(pager, action) {
  return `
    <div class="pagination">
      <div class="table-meta">
        เธซเธเนเธฒ ${formatNumber(pager.page)} เธเธฒเธ ${formatNumber(pager.pageCount)} | เธ—เธฑเนเธเธซเธกเธ” ${formatNumber(pager.total)} เธฃเธฒเธขเธเธฒเธฃ
      </div>
      <div class="pagination__buttons">
        <button class="button-ghost" type="button" data-action="${action}" data-page="${Math.max(1, pager.page - 1)}" ${pager.page <= 1 ? "disabled" : ""}>เธเนเธญเธเธซเธเนเธฒ</button>
        <button class="button-ghost" type="button" data-action="${action}" data-page="${Math.min(pager.pageCount, pager.page + 1)}" ${pager.page >= pager.pageCount ? "disabled" : ""}>เธ–เธฑเธ”เนเธ</button>
      </div>
    </div>
  `;
}

function renderStatCard(label, value, note) {
  const theme = resolveStatCardTheme(label);
  return `
    <div class="stats-band__item stats-band__item--${theme.tone}">
      <div class="stat-card__head">
        <div class="stat-label">${escapeHtml(label)}</div>
        <span class="stat-card__icon" aria-hidden="true">${renderStatIcon(theme.icon)}</span>
      </div>
      <div class="stat-value">${formatNumber(value || 0)}</div>
      <div class="stat-note">${escapeHtml(note)}</div>
    </div>
  `;
}

function resolveStatCardTheme(label) {
  if (label.includes("เธเธฃเธฐเน€เธ”เนเธ")) {
    return { tone: "amber", icon: "issue" };
  }
  if (label.includes("เธ•เธฑเธงเธเธตเนเธงเธฑเธ”")) {
    return { tone: "teal", icon: "indicator" };
  }
  if (label.includes("เธซเธเนเธงเธขเธเธฒเธ")) {
    return { tone: "slate", icon: "unit" };
  }
  if (label.includes("เธเธดเธเธเธฃเธฃเธก")) {
    return { tone: "blue", icon: "progress" };
  }
  return { tone: "blue", icon: "records" };
}

function renderStatIcon(icon) {
  switch (icon) {
    case "indicator":
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 18V10" />
          <path d="M12 18V6" />
          <path d="M18 18v-4" />
          <path d="M4 20h16" />
        </svg>
      `;
    case "issue":
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8v5" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      `;
    case "unit":
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 20V8l8-4 8 4v12" />
          <path d="M9 20v-5h6v5" />
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
        </svg>
      `;
    case "progress":
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.5 9 16l10-10" />
          <path d="M4 12a8 8 0 1 1 2.34 5.66" />
        </svg>
      `;
    default:
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
        </svg>
      `;
  }
}

function renderBarRow({ label, value, maxValue }) {
  const percent = maxValue ? Math.max(4, Math.round((Number(value || 0) / Number(maxValue || 1)) * 100)) : 4;
  return `
    <div class="chart-row">
      <div><strong>${escapeHtml(label)}</strong></div>
      <div class="chart-track"><div class="chart-fill" style="width:${percent}%"></div></div>
      <div class="text-right"><strong>${formatNumber(value || 0)}</strong></div>
    </div>
  `;
}

function renderRecentRecordEntry(record, { showUnit = true } = {}) {
  const metaParts = [formatThaiDate(record.reviewDate)];
  if (showUnit) {
    metaParts.unshift(record.unitName || "-");
  }
  return `
    <div class="timeline__entry">
      <strong>${escapeHtml(record.activityLabel || ACTIVITY_MAP[record.activityId]?.shortTitle || "เธเธดเธเธเธฃเธฃเธก")}</strong>
      <div class="muted">${escapeHtml(metaParts.join(" | "))}</div>
      <div style="margin-top: 6px">${escapeHtml(record.reviewLeader || "-")}</div>
    </div>
  `;
}

function renderEmptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function renderIndicatorMonths(payload = {}) {
  return FY_MONTHS.map((month) => `${month.label} ${payload[month.key] || "-"}`).join(" | ");
}

function renderReportSheet(unit, fiscalYear) {
  const allRecords = Object.values(unit.records || {}).flat();
  return `
    <section class="report-sheet">
      <div class="report-sheet__header">
        <div>
          <strong>เนเธเธเธชเธฃเธธเธเธเธฒเธฃเธ—เธเธ—เธงเธ 12 เธเธดเธเธเธฃเธฃเธกเธเธฒเธฃเธเธขเธฒเธเธฒเธฅ</strong>
          <div>เธซเธเนเธงเธขเธเธฒเธ ${escapeHtml(unit.unitName)}</div>
        </div>
        <div>เธเธฃเธฐเธเธณเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“ ${escapeHtml(String(fiscalYear))}</div>
      </div>
      <div class="report-sheet__meta">
        <div><strong>เธเธณเธเธงเธเธเธฑเธเธ—เธถเธ</strong><div>${formatNumber(allRecords.length)}</div></div>
        <div><strong>เธ•เธฑเธงเธเธตเนเธงเธฑเธ”</strong><div>${formatNumber((unit.activity12?.catalog || []).length)}</div></div>
        <div><strong>เธเธฃเธฐเน€เธ”เนเธเธ•เธดเธ”เธ•เธฒเธก</strong><div>${formatNumber((unit.activity12?.issues || []).length)}</div></div>
      </div>
      ${ACTIVITY_DEFINITIONS.map((definition) => renderReportActivitySection(definition, unit.records?.[definition.id] || [])).join("")}
      ${renderReportActivity12Section(unit.activity12 || {}, fiscalYear)}
    </section>
  `;
}

function renderReportActivitySection(definition, records) {
  return `
    <section style="margin-top: 12px">
      <strong>${escapeHtml(definition.shortTitle)}: ${escapeHtml(definition.title)}</strong>
      <table class="report-table" style="margin-top: 6px">
        <thead>
          <tr>
            <th>เธงเธฑเธเธ—เธตเนเธ—เธเธ—เธงเธ</th>
            <th>เธเธนเนเธเธณเธเธฒเธฃเธ—เธเธ—เธงเธ</th>
            <th>เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</th>
            <th>เธซเธฑเธงเธเนเธญเธชเธณเธเธฑเธ</th>
            <th>เธซเธกเธฒเธขเน€เธซเธ•เธธ</th>
          </tr>
        </thead>
        <tbody>
          ${records.length
            ? records
                .map((record) => {
                  const firstRow = record.rows?.[0] || {};
                  const keyText = definition.rowFields
                    .slice(0, 2)
                    .map((field) => firstRow[field.name])
                    .filter(Boolean)
                    .join(" | ");
                  return `
                    <tr>
                      <td>${escapeHtml(formatThaiDate(record.reviewDate))}</td>
                      <td>${escapeHtml(record.reviewLeader || "-")}</td>
                      <td>${escapeHtml((record.participants || []).map((item) => item.name).join(", ") || "-")}</td>
                      <td>${escapeHtml(keyText || "-")}</td>
                      <td>${escapeHtml(record.note || "-")}</td>
                    </tr>
                  `;
                })
                .join("")
            : `<tr><td colspan="5">เนเธกเนเธกเธตเธเนเธญเธกเธนเธฅ</td></tr>`}
        </tbody>
      </table>
    </section>
  `;
}

function renderReportActivity12Section(activity12, fiscalYear) {
  const valueMap = Object.fromEntries((activity12.values || []).map((item) => [item.indicatorId, item.payload || {}]));
  return `
    <section style="margin-top: 12px">
      <strong>กิจกรรมที่ 12: การติดตามเครื่องชี้วัดสำคัญ ประจำปีงบประมาณ ${escapeHtml(String(fiscalYear))}</strong>
      <table class="report-table" style="margin-top: 6px">
        <thead>
          <tr>
            <th>เครื่องชี้วัด</th>
            <th>เป้าหมาย</th>
            <th>ผลรายปีงบประมาณ</th>
            <th>สรุปปัญหา</th>
          </tr>
        </thead>
        <tbody>
          ${(activity12.catalog || []).length
            ? activity12.catalog
                .map((indicator) => `
                  <tr>
                    <td>${escapeHtml(indicator.indicatorName || "-")}</td>
                    <td>${escapeHtml([indicator.targetValue, indicator.targetUnit].filter(Boolean).join(" ") || "-")}</td>
                    <td>${escapeHtml(renderIndicatorMonths(valueMap[indicator.indicatorId] || {}))}</td>
                    <td>${escapeHtml(
                      (activity12.issues || [])
                        .filter((issue) => issue.indicatorId === indicator.indicatorId)
                        .map((issue) => issue.problem)
                        .filter(Boolean)
                        .join(" / ") || "-",
                    )}</td>
                  </tr>
                `)
                .join("")
            : `<tr><td colspan="4">ไม่มีข้อมูล</td></tr>`}
        </tbody>
      </table>
    </section>
  `;
}
function formatBytes(size) {
  if (!size) {
    return "0 KB";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = Number(size);
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function renderUnitPickerModalV2(units) {
  const options = units
    .map(
      (item) => `
        <option value="${escapeHtml(item.unitName)}">
          ${escapeHtml(item.unitName)}${item.groupName ? ` - ${escapeHtml(item.groupName)}` : ""}
        </option>
      `,
    )
    .join("");

  return `
    <div class="modal-overlay" data-close-overlay="false">
      <div class="modal-card" data-size="md" role="dialog" aria-modal="true" aria-label="เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ">
        <div class="modal-header">
          <div class="record-strip">
            <div>
              <h3 class="modal-title">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ</h3>
            </div>
            <button class="button-ghost" data-action="close-modal">เธเธดเธ”</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-stack">
            <div class="search-panel">
              <p class="hint">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธเธเธฒเธเธฃเธฒเธขเธเธฒเธฃเธ”เนเธฒเธเธฅเนเธฒเธ เนเธฅเนเธงเน€เธเนเธฒเธชเธนเนเธซเธเนเธฒ Dashboard</p>
            </div>
            <div class="table-shell">
              <div class="modal-form">
                <label>
                  <span class="field-label">เธซเธเนเธงเธขเธเธฒเธ</span>
                  <select id="unitPickerSelect" class="select">
                    <option value="">เน€เธฅเธทเธญเธเธซเธเนเธงเธขเธเธฒเธ</option>
                    ${options}
                  </select>
                </label>
                <div class="modal-actions">
                  <button class="button button--hero" data-action="confirm-pick-unit">เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธซเธเนเธงเธขเธเธฒเธ</button>
                  <button class="button-ghost" data-action="close-modal">เธขเธเน€เธฅเธดเธ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderActivityRecordsContent({ unitName, fiscalYear, activityId, activityData }) {
  const definition = ACTIVITY_MAP[activityId];
  const searchValue = activityData.searchValue || "";
  const records = activityData.records || [];
  const pager = paginate(records, activityData.page || 1, PAGE_SIZE);
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <p class="section-eyebrow">${escapeHtml(definition.shortTitle)}</p>
          <h2 class="page-title">${escapeHtml(definition.title)}</h2>
          <p class="table-meta">${escapeHtml(unitName)} | ${escapeHtml(fiscalYearLabel(fiscalYear))}</p>
        </div>
        <div class="panel__actions">
          <button class="button" data-action="new-record" data-activity="${activityId}" data-unit="${escapeHtml(unitName)}">เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃ</button>
          <button class="button-secondary" data-action="open-unit-report" data-unit="${escapeHtml(unitName)}">เธฃเธฒเธขเธเธฒเธเธซเธเนเธงเธขเธเธฒเธ</button>
        </div>
      </div>
      <div class="search-panel">
        <div class="search-grid">
          <label>
            <span class="field-label">เธเนเธเธซเธฒเธเนเธญเธกเธนเธฅ</span>
            <input class="input" type="search" name="activitySearch" value="${escapeHtml(searchValue)}" placeholder="เธเนเธเธซเธฒเธเธฒเธเธเธทเนเธญเธเธนเนเธ—เธเธ—เธงเธ เธซเธกเธฒเธขเน€เธซเธ•เธธ เธซเธฃเธทเธญเธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข" data-action="update-activity-search" />
          </label>
          <div class="metric-row">
            <div>
              <div class="stat-label">เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃ</div>
              <strong>${formatNumber(records.length)}</strong>
            </div>
          </div>
        </div>
      </div>

      <section class="table-shell" style="margin-top: 18px">
        <div class="table-toolbar">
          <div>
            <h3 class="table-title">เธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธ</h3>
          </div>
          <div class="table-caption">Showing ${formatNumber(pager.start)}-${formatNumber(pager.end)} of ${formatNumber(pager.total)}</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เธงเธฑเธเธ—เธตเนเธ—เธเธ—เธงเธ</th>
                <th>เธเธนเนเธเธณเธเธฒเธฃเธ—เธเธ—เธงเธ</th>
                <th>เธเธนเนเธฃเนเธงเธกเธ—เธเธ—เธงเธ</th>
                <th>เธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเธขเนเธญเธข</th>
                <th>เนเธเธเนเธเธฅเน</th>
                <th>เธญเธฑเธเน€เธ”เธ•เธฅเนเธฒเธชเธธเธ”</th>
                <th>เธ”เธณเน€เธเธดเธเธเธฒเธฃ</th>
              </tr>
            </thead>
            <tbody>
              ${pager.items
                .map(
                  (record) => `
                    <tr>
                      <td>${escapeHtml(formatThaiDate(record.reviewDate))}</td>
                      <td>
                        <strong>${escapeHtml(record.reviewLeader)}</strong>
                        <div class="muted">${escapeHtml(record.note || "-")}</div>
                      </td>
                      <td>${escapeHtml((record.participants || []).map((item) => item.name).filter(Boolean).join(", ") || "-")}</td>
                      <td>${formatNumber((record.rows || []).length || 0)}</td>
                      <td>${formatNumber((record.attachments || []).length || 0)}</td>
                      <td>${escapeHtml(formatThaiDateTime(record.updatedAt))}</td>
                      <td>
                        <div class="table-actions">
                          <button class="button-ghost" data-action="view-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เธ”เธน</button>
                          <button class="button-secondary" data-action="edit-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เนเธเนเนเธ</button>
                          <button class="button-danger" data-action="delete-record" data-record-id="${escapeHtml(record.recordId)}" data-activity="${activityId}">เธฅเธ</button>
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("") || `<tr><td colspan="7">${renderEmptyState("เธขเธฑเธเนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฑเธเธ—เธถเธเธชเธณเธซเธฃเธฑเธเธเธดเธเธเธฃเธฃเธกเธเธตเน")}</td></tr>`}
            </tbody>
          </table>
        </div>
        ${renderPagination(pager, "change-activity-page")}
      </section>
    </section>
  `;
}

function renderActivity12Content({ unitName, fiscalYear, activityData }) {
  const searchValue = activityData.searchValue || "";
  const indicatorRows = activityData.filteredCatalog || [];
  const valueMap = activityData.valueMap || {};
  return `
    <section class="panel">
      <div class="panel__head">
        <div>
          <p class="section-eyebrow">กิจกรรมที่ 12</p>
          <h2 class="page-title">การติดตามเครื่องชี้วัดสำคัญ</h2>
          <p class="table-meta">${escapeHtml(unitName)} | ${escapeHtml(fiscalYearLabel(fiscalYear))}</p>
        </div>
        <div class="panel__actions">
          <button class="button" data-action="new-indicator">เพิ่มเครื่องชี้วัด</button>
          <button class="button-secondary" data-action="new-indicator-issue">เพิ่มประเด็นติดตาม</button>
        </div>
      </div>

      <div class="search-panel">
        <div class="search-grid">
          <label>
            <span class="field-label">ค้นหาเครื่องชี้วัด</span>
            <input class="input" type="search" value="${escapeHtml(searchValue)}" placeholder="ค้นหาจากชื่อเครื่องชี้วัดหรือคำอธิบาย" data-action="update-activity12-search" />
          </label>
        </div>
      </div>

      <section class="table-shell" style="margin-top: 18px">
        <div class="table-shell__head">
          <div>
            <p class="section-eyebrow">Indicator Table</p>
            <h3 class="table-title">รายการเครื่องชี้วัดและผลการติดตาม</h3>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เครื่องชี้วัด</th>
                <th>เป้าหมาย</th>
                <th>ผลรายปีงบประมาณ</th>
                <th>สรุป/หมายเหตุ</th>
                <th>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              ${indicatorRows
                .map((indicator) => {
                  const payload = valueMap[indicator.indicatorId] || {};
                  return `
                    <tr>
                      <td>
                        <strong>${escapeHtml(indicator.indicatorName)}</strong>
                        <div class="muted">${escapeHtml(indicator.description || "-")}</div>
                      </td>
                      <td>${escapeHtml([indicator.targetValue, indicator.targetUnit].filter(Boolean).join(" ") || "-")}</td>
                      <td>${renderIndicatorMonths(payload)}</td>
                      <td>${escapeHtml(payload.summary || payload.remark || "-")}</td>
                      <td>
                        <div class="table-actions">
                          <button class="button-ghost" data-action="edit-indicator-values" data-indicator-id="${escapeHtml(indicator.indicatorId)}">บันทึกผล</button>
                          <button class="button-secondary" data-action="edit-indicator" data-indicator-id="${escapeHtml(indicator.indicatorId)}">แก้ไข</button>
                          <button class="button-danger" data-action="delete-indicator" data-indicator-id="${escapeHtml(indicator.indicatorId)}">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join("") || `<tr><td colspan="5">${renderEmptyState("ยังไม่พบข้อมูลตัวชี้วัด")}</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}
function getActivityChooserItems() {
  return ACTIVITY_DEFINITIONS.concat([
    {
      id: "12",
      shortTitle: "กิจกรรมที่ 12",
      title: "การติดตามเครื่องชี้วัดสำคัญ",
    },
  ]);
}

function renderTopbar({ config, bootstrap, route, activeUnit, fiscalYear }) {
  const years = bootstrap?.availableFiscalYears || [];
  const primaryAction = activeUnit
    ? `<button class="button-secondary button-secondary--toolbar" data-action="open-activity-picker">เลือกกิจกรรม</button>`
    : `<button class="button-secondary button-secondary--toolbar" data-action="open-unit-picker">เข้าสู่ระบบหน่วยงาน</button>`;
  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          <img class="brand__logo" src="nurse-logo.png" alt="Nurse Logo" />
          <div>
            <div class="brand__eyebrow">Digital Healthcare Platform</div>
            <h1 class="brand__title">${escapeHtml(config.appName)}</h1>
            <p class="brand__subtitle">${escapeHtml(config.hospitalName)} | ${escapeHtml(config.missionName)}</p>
          </div>
        </div>
        <div class="topbar__actions">
          <label class="toolbar-select">
            <span class="sr-only">เลือกปีงบประมาณ</span>
            <span class="toolbar-select__label">ปีงบประมาณ</span>
            <select class="select select--toolbar" data-action="change-fiscal-year">
              ${years.map((year) => `<option value="${year}" ${Number(year) === Number(fiscalYear) ? "selected" : ""}>${fiscalYearLabel(year)}</option>`).join("")}
            </select>
          </label>
          <div class="toolbar-group">
            ${primaryAction}
            ${activeUnit ? `<button class="button-ghost button-ghost--toolbar" data-action="open-unit-picker">สลับหน่วยงาน</button>` : ""}
            ${activeUnit ? `<button class="button-ghost button-ghost--toolbar" data-action="open-unit-report" data-unit="${escapeHtml(activeUnit)}">รายงานหน่วยงาน</button>` : ""}
            <button class="button-ghost button-ghost--toolbar" data-action="${route.name === "home" ? "open-org-report" : "go-home"}">
              ${route.name === "home" ? "รายงานภาพรวม" : "กลับหน้าแรก"}
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}
function renderSidebar({ unitName, route, fiscalYear, dashboard }) {
  const activityCounts = dashboard?.activityCounts || {};
  return `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__brand-mark">
          <img src="nurse-logo.png" alt="Nurse Logo" />
        </div>
        <div>
          <p class="section-eyebrow">พื้นที่ทำงานหน่วยงาน</p>
          <h2 class="sidebar__title">แดชบอร์ดหน่วยงาน</h2>
          <p class="sidebar__copy">ภาพรวมการบันทึกและติดตามข้อมูล</p>
        </div>
      </div>
      <div class="sidebar__meta">
        <div class="sidebar__meta-row">
          <div class="stat-label">ปีงบประมาณ</div>
          <strong>${escapeHtml(fiscalYearLabel(fiscalYear))}</strong>
        </div>
        <div class="sidebar__meta-row">
          <div class="stat-label">จำนวนบันทึก</div>
          <strong>${formatNumber(dashboard?.summary?.totalRecords || 0)}</strong>
        </div>
        <div class="sidebar__meta-row">
          <div class="stat-label">ประเด็นติดตาม</div>
          <strong>${formatNumber(dashboard?.summary?.openIssues || 0)}</strong>
        </div>
      </div>
      <div class="nav-list">
        <button class="nav-link ${route.name === "unit-dashboard" ? "is-active" : ""}" data-action="open-unit-dashboard" data-unit="${escapeHtml(unitName)}">
          <span class="nav-link__content">
            <span class="nav-link__title">แดชบอร์ดหน่วยงาน</span>
            <span class="nav-link__desc">ภาพรวมการบันทึกและการติดตามของหน่วยงาน</span>
          </span>
          <span class="pill">${formatNumber(dashboard?.summary?.totalRecords || 0)}</span>
        </button>
        ${getActivityChooserItems()
          .map((activity) => {
            const isActive = route.name === "unit-activity" && route.activityId === activity.id;
            return `
              <button class="nav-link ${isActive ? "is-active" : ""}" data-action="open-activity" data-unit="${escapeHtml(unitName)}" data-activity="${activity.id}">
                <span class="nav-link__content">
                  <span class="nav-link__title">${escapeHtml(activity.shortTitle)}</span>
                  <span class="nav-link__desc">${escapeHtml(activity.title)}</span>
                </span>
                <span class="pill">${formatNumber(activityCounts[activity.id] || 0)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </aside>
  `;
}
function renderUnitDashboardContent({ unitName, fiscalYear, dashboard }) {
  return `
    <section class="hero hero--unit">
      <div class="hero__layout hero__layout--unit">
        <div class="hero__content hero__content--unit">
          <p class="section-eyebrow">พื้นที่ทำงานหน่วยงาน</p>
          <h2 class="hero__title hero__title--unit">${escapeHtml(unitName)}</h2>
          <p class="hero__subtitle">ภาพรวมการบันทึกและติดตามข้อมูล ${escapeHtml(fiscalYearLabel(fiscalYear))}</p>
          <div class="hero__actions">
            <button class="button button--hero" data-action="open-activity-picker">เริ่มบันทึกหรืออัปเดตกิจกรรม</button>
          </div>
        </div>
        <div class="hero__summary hero__summary--unit">
          <div class="stats-band stats-band--hero-grid stats-band--hero-grid-unit">
            ${renderStatCard("บันทึกรวม", dashboard?.summary?.totalRecords || 0, "กิจกรรมที่ 1-11")}
            ${renderStatCard("กิจกรรมที่เริ่มแล้ว", dashboard?.summary?.activitiesStarted || 0, "กิจกรรมที่มีข้อมูลแล้ว")}
            ${renderStatCard("ตัวชี้วัดที่ใช้งาน", dashboard?.summary?.totalIndicators || 0, "กิจกรรมที่ 12")}
            ${renderStatCard("ประเด็นที่ต้องติดตาม", dashboard?.summary?.openIssues || 0, "Issue และ action plan")}
          </div>
        </div>
      </div>
    </section>

    <div class="layout-grid">
      <section class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">ภาพรวมกิจกรรม</p>
            <h3 class="section-title">12 กิจกรรมการทบทวน</h3>
            <p class="table-meta">เลือกกิจกรรมเพื่อเปิดบันทึก ดูสถานะ และติดตามความคืบหน้าได้จากรายการเดียว</p>
          </div>
          <div class="panel__actions">
            <button class="button-secondary" data-action="open-activity-picker">เลือกกิจกรรม</button>
          </div>
        </div>
        <div class="panel__stack activity-list">
          ${getActivityChooserItems()
            .map((activity) => {
              const count = dashboard?.activityCounts?.[activity.id] || 0;
              return `
                <article class="activity-card">
                  <div class="activity-card__main">
                    <strong>${escapeHtml(activity.shortTitle)}</strong>
                    <div class="muted">${escapeHtml(activity.title)}</div>
                  </div>
                  <div class="activity-card__meta">
                    <span class="activity-card__count">${formatNumber(count)} รายการ</span>
                    <span class="badge ${count ? "is-success" : "is-pending"}">${count ? "มีข้อมูล" : "ยังไม่เริ่ม"}</span>
                    <button class="button-ghost button-ghost--action" data-action="open-activity" data-unit="${escapeHtml(unitName)}" data-activity="${activity.id}">เปิด</button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div>
            <p class="section-eyebrow">Recent Review</p>
            <h3 class="section-title">รายการทบทวนล่าสุด</h3>
            <p class="table-meta">รายการทบทวนล่าสุดที่อัปเดตในปีงบประมาณนี้</p>
          </div>
        </div>
        <div class="timeline">
          ${(dashboard?.recentRecords || []).slice(0, MAX_RECENT_ITEMS).map((record) => renderRecentRecordEntry(record, { showUnit: false })).join("") || renderEmptyState("ยังไม่มีข้อมูลทบทวนในปีงบประมาณนี้")}
        </div>
      </section>
    </div>
  `;
}
export function renderActivityPickerModalV2({ unitName, activityCounts = {} }) {
  return `
    <div class="modal-overlay" data-close-overlay="false">
      <div class="modal-card" data-size="lg" role="dialog" aria-modal="true" aria-label="เลือกกิจกรรม">
        <div class="modal-header">
          <div class="record-strip">
            <div>
              <h3 class="modal-title">เลือกกิจกรรม</h3>
              <p class="modal-subtitle">${escapeHtml(unitName)}</p>
            </div>
            <button class="button-ghost" type="button" data-action="close-modal">ปิด</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-stack">
            <div class="search-panel">
              <p class="hint">เลือกกิจกรรมที่ต้องการบันทึกจากรายการด้านล่าง</p>
            </div>
            <div class="panel__stack">
              ${getActivityChooserItems()
                .map(
                  (activity) => `
                    <div class="metric-row">
                      <div>
                        <strong>${escapeHtml(activity.shortTitle)}</strong>
                        <div class="muted">${escapeHtml(activity.title)}</div>
                      </div>
                      <div class="inline-actions">
                        <span class="badge ${activityCounts[activity.id] ? "is-success" : ""}">${formatNumber(activityCounts[activity.id] || 0)}</span>
                        <button class="button" type="button" data-action="pick-activity" data-activity="${escapeHtml(activity.id)}">เลือกกิจกรรม</button>
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


