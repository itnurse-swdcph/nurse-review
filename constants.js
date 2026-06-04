export const PAGE_SIZE = 10;
export const CACHE_TTL_MS = 2 * 60 * 1000;
export const AUTOSAVE_DEBOUNCE_MS = 450;
export const MAX_RECENT_ITEMS = 8;

export const FY_MONTHS = [
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

export const ACTIVITY_12_SECTIONS = [
  { key: "12.1", label: "12.1 ตัวชี้วัดด้านผลลัพธ์ทางการพยาบาล" },
  { key: "12.2", label: "12.2 ตัวชี้วัดด้านกระบวนการพยาบาล" },
  { key: "12.3", label: "12.3 ตัวชี้วัดเฉพาะหน่วยงาน" },
];

export const ACTIVITY_DEFINITIONS = [
  {
    id: "1",
    shortTitle: "กิจกรรมที่ 1",
    title: "การทบทวนขณะดูแลผู้ป่วยขณะอยู่ในโรงพยาบาล C3-THER + H-E-L-P",
    rowLabel: "ประเด็นทบทวน",
    rowFields: [
      {
        name: "reviewMethod",
        label: "วิธีการทบทวน",
        type: "select",
        required: true,
        options: ["ทบทวนข้างเตียง", "Conference", "Grand Round", "Quality Round", "อื่น ๆ"],
      },
      { name: "summary", label: "สรุปเหตุการณ์และประเด็นที่ทบทวน", type: "textarea", required: true },
      { name: "riskIssue", label: "สรุปประเด็น (ความเสี่ยง/ปัญหา) ที่ต้องดำเนินการ", type: "textarea" },
      { name: "action", label: "การดำเนินการแก้ไข ปรับปรุง", type: "textarea" },
    ],
  },
  {
    id: "2",
    shortTitle: "กิจกรรมที่ 2",
    title: "การทบทวนความคิดเห็น/คำร้องเรียนของผู้รับบริการ",
    rowLabel: "ข้อร้องเรียนหรือข้อเสนอแนะ",
    rowFields: [
      { name: "eventDate", label: "วันที่รับเรื่อง", type: "date", required: true },
      {
        name: "category",
        label: "ประเภท",
        type: "select",
        required: true,
        options: [
          "พฤติกรรมบริการ",
          "ระบบบริการ",
          "คุณภาพการดูแลรักษา",
          "สิ่งแวดล้อม/ความปลอดภัย",
          "สิทธิผู้ป่วยและจริยธรรม",
          "การสื่อสาร",
        ],
      },
      { name: "topic", label: "สรุปเหตุการณ์และประเด็นที่ทบทวน", type: "textarea", required: true },
      { name: "resolution", label: "วิธีแก้ไข", type: "textarea" },
      { name: "result", label: "ผลการแก้ไข", type: "textarea" },
      { name: "prevention", label: "การป้องกันการเกิดซ้ำ", type: "textarea" },
    ],
  },
  {
    id: "3",
    shortTitle: "กิจกรรมที่ 3",
    title: "การทบทวนการส่งต่อ/ขอย้าย/ปฏิเสธการรักษา",
    modeField: {
      name: "recordMode",
      label: "รูปแบบการบันทึก",
      options: [
        { value: "incident", label: "บันทึกทบทวนเหตุการณ์สำคัญ" },
        { value: "summary", label: "บันทึกแบบสรุปการทบทวนการส่งต่อ/ปฏิเสธการรักษา" },
      ],
    },
    rowLabel: "รายการทบทวน",
    summaryFields: [
      { name: "referCount", label: "ส่งต่อ (ครั้ง)", type: "number" },
      { name: "referCause", label: "สาเหตุการส่งต่อ", type: "textarea" },
      { name: "transferRequestCount", label: "ขอย้าย (ครั้ง)", type: "number" },
      { name: "transferRequestCause", label: "สาเหตุการขอย้าย", type: "textarea" },
      { name: "refusalCount", label: "ปฏิเสธการรักษา (ครั้ง)", type: "number" },
      { name: "refusalCause", label: "สาเหตุการปฏิเสธการรักษา", type: "textarea" },
    ],
    rowTypes: [
      {
        key: "incident",
        label: "บันทึกทบทวนเหตุการณ์สำคัญ",
        fields: [
          { name: "eventDate", label: "วันเดือนปีที่เกิดเหตุการณ์", type: "date", required: true },
          {
            name: "transferType",
            label: "ประเภท",
            type: "select",
            required: true,
            options: ["ส่งต่อ", "ขอย้าย", "ปฏิเสธการรักษา"],
          },
          { name: "transferCause", label: "สาเหตุ", type: "textarea" },
          { name: "summary", label: "สรุปเหตุการณ์", type: "textarea", required: true },
          { name: "careOutcome", label: "ผลลัพธ์การดูแลผู้ป่วย", type: "textarea" },
          { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
          { name: "recommendation", label: "ข้อเสนอแนะเพื่อปรับปรุง", type: "textarea" },
        ],
      },
      {
        key: "summary",
        label: "วิเคราะห์กรณีสำคัญ",
        fields: [
          {
            name: "analysisInputType",
            label: "วิธีวิเคราะห์กรณีสำคัญ",
            type: "select",
            options: ["เลือกจากรายการบันทึกทบทวนเหตุการณ์สำคัญ (ถ้ามี)", "กรอกข้อมูลเอง"],
          },
          {
            name: "sourceRecordId",
            label: "เลือกรายการบันทึกทบทวนเหตุการณ์สำคัญ",
            type: "select",
            optionsFrom: "activity3Incidents",
          },
          { name: "importantCaseEventDate", label: "วันเดือนปีที่เกิดเหตุการณ์", type: "date" },
          { name: "importantCaseReviewDate", label: "วันเดือนปีที่ทบทวน", type: "date" },
          {
            name: "importantCaseTransferType",
            label: "ประเภท",
            type: "select",
            options: ["ส่งต่อ", "ขอย้าย", "ปฏิเสธการรักษา"],
          },
          { name: "importantCaseTransferCause", label: "สาเหตุ", type: "textarea" },
          { name: "importantCaseSummary", label: "สรุปเหตุการณ์", type: "textarea" },
          { name: "importantCaseCareOutcome", label: "ผลลัพธ์การดูแลผู้ป่วย", type: "textarea" },
          { name: "importantCaseAction", label: "การดำเนินการแก้ไข", type: "textarea" },
          { name: "importantCaseRecommendation", label: "ข้อเสนอแนะเพื่อปรับปรุง", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "4",
    shortTitle: "กิจกรรมที่ 4",
    title: "การทบทวนการตรวจรักษาโดยผู้ชำนาญกว่า / ผู้ที่มีคุณสมบัติไม่ครบ",
    rowLabel: "รายการทบทวน",
    rowFields: [
      {
        name: "reviewType",
        label: "ลักษณะการทบทวน",
        type: "select",
        required: true,
        options: [
          "โดยผู้ชำนาญกว่า",
          "โดยผู้มีคุณสมบัติไม่ครบ",
          "กิจกรรมสุ่มตรวจ",
          "การปรับปรุงระบบ",
        ],
      },
      { name: "topic", label: "สรุปเหตุการณ์ (การตรวจรักษา/หัตถการ/กิจกรรมที่เกิดขึ้น)", type: "textarea", required: true },
      { name: "reviewIssue", label: "ประเด็นทบทวน", type: "textarea" },
      { name: "specialistReview", label: "การทบทวน (โดยผู้ชำนาญกว่า การตรวจรักษาที่ควรจะเป็น)", type: "textarea" },
      { name: "result", label: "ผลลัพธ์/การปรับปรุง", type: "textarea" },
    ],
  },
  {
    id: "5",
    shortTitle: "กิจกรรมที่ 5",
    title: "การค้นหาและป้องกันความเสี่ยง",
    rowLabel: "รายการความเสี่ยง",
    rowFields: [
      {
        name: "riskType",
        label: "ประเภทของความเสี่ยง (NEAR MISS / อุบัติการณ์)",
        type: "select",
        required: true,
        options: ["ตาม Risk Profile", "ความเสี่ยงทางคลินิก", "ความเสี่ยงทางคลินิกเฉพาะโรค", "ความเสี่ยงทั่วไป"],
      },
      { name: "riskName", label: "เรื่อง", type: "text", required: true },
      { name: "incidentCount", label: "จำนวน", type: "number", required: true },
      { name: "correctiveAction", label: "วิธีแก้ไข", type: "textarea" },
      { name: "prevention", label: "วิธีป้องกัน", type: "textarea" },
      { name: "result", label: "ผลการแก้ไขป้องกัน", type: "textarea" },
    ],
  },
  {
    id: "6",
    shortTitle: "กิจกรรมที่ 6",
    title: "การทบทวนการเฝ้าระวังการติดเชื้อในโรงพยาบาล",
    rowLabel: "รายการทบทวน",
    rowFields: [
      {
        name: "reviewIssue",
        label: "ประเด็นที่ทบทวน",
        type: "select",
        required: true,
        options: [
          "อุบัติการณ์ติดเชื้อ TARGET SURVELLANCE",
          "NOSOCOMIAL INFECTION",
          "อุบัติเหตุการติดเชื้อจากการทำงาน",
          "เชื้อดื้อยา MRSA, ESBL",
          "ไม่ปฏิบัติตามมาตรฐาน IC",
          "การทบทวนแนวทางปฏิบัติโดยใช้ EVIDENCE BASE ใหม่ ๆ",
        ],
      },
      { name: "infectionCase", label: "การติดเชื้อ", type: "textarea", required: true },
      { name: "infectionSteps", label: "ขั้นตอนที่มีผลต่อการติดเชื้อ / รายละเอียดอื่น ๆ", type: "textarea" },
      { name: "reductionPractice", label: "การปฏิบัติเพื่อลดการติดเชื้อ", type: "textarea" },
    ],
  },
  {
    id: "7",
    shortTitle: "กิจกรรมที่ 7",
    title: "การเฝ้าระวังความคลาดเคลื่อนทางยา",
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date", required: true },
      { name: "issueType", label: "ประเด็น/รายการยา", type: "text", required: true },
      {
        name: "severity",
        label: "ระดับความรุนแรง",
        type: "select",
        required: true,
        options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      },
      { name: "cause", label: "สาเหตุ/ปัญหา/ขั้นตอนที่มีผลต่อความคลาดเคลื่อน", type: "textarea" },
      { name: "action", label: "การปฏิบัติที่เหมาะสมเพื่อป้องกันการเกิด", type: "textarea" },
    ],
  },
  {
    id: "8",
    shortTitle: "กิจกรรมที่ 8",
    title: "การทบทวนเหตุการณ์ที่สำคัญ (เหตุการณ์ที่เป็น Sentinel events)",
    description: "การทบทวนเหตุการณ์ที่สำคัญ (เหตุการณ์ที่เป็น Sentinel events) ที่เกิดขึ้นในหน่วยงานหรือเหตุการณ์สำคัญที่มีผลต่อผู้ป่วย เจ้าหน้าที่ และญาติ",
    rowLabel: "เหตุการณ์สำคัญ",
    rowFields: [
      {
        name: "reviewType",
        label: "ประเภทการทบทวน",
        type: "select",
        required: true,
        options: ["RCA", "ผู้ร่วมทบทวน"],
      },
      { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date", required: true },
      { name: "topic", label: "เรื่อง", type: "text", required: true },
      { name: "caseSummary", label: "สรุปเหตุการณ์", type: "textarea", required: true },
      { name: "keyIssue", label: "ประเด็นสำคัญ", type: "textarea" },
      { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
      { name: "rcaResult", label: "ผลการดำเนินการ (RCA)", type: "textarea" },
    ],
  },
  {
    id: "9",
    shortTitle: "กิจกรรมที่ 9",
    title: "การทบทวนความสมบูรณ์ของเวชระเบียน",
    leaderLabel: "ผู้ทบทวน",
    rowLabel: "รายการย่อย",
    rowFields: [
      {
        name: "recordItem",
        label: "เรื่อง",
        type: "select",
        required: true,
        options: ["ผู้ป่วย Dead", "จำหน่ายกลับบ้าน", "ไม่สมัครใจอยู่"],
      },
      { name: "incidentCount", label: "จำนวน", type: "number", required: true },
      { name: "issue", label: "ปัญหา", type: "textarea" },
      { name: "action", label: "การแก้ไข", type: "textarea" },
      { name: "result", label: "ผลการแก้ไข", type: "textarea" },
    ],
  },
  {
    id: "10",
    shortTitle: "กิจกรรมที่ 10",
    title: "การทบทวนการใช้ความรู้ทางวิชาการ",
    rowLabel: "รายการทบทวน",
    rowFields: [
      {
        name: "academicType",
        label: "ประเภท",
        type: "select",
        required: true,
        options: ["CPG", "Care Map", "WI", "คู่มือ", "Tracer", "Evidence Base", "อื่น ๆ"],
      },
      { name: "topic", label: "เรื่องที่ทบทวน", type: "text", required: true },
      { name: "result", label: "ผลการดำเนินการ", type: "textarea" },
    ],
  },
  {
    id: "11",
    shortTitle: "กิจกรรมที่ 11",
    title: "การทบทวนการใช้ทรัพยากร",
    leaderLabel: "ผู้ทบทวน",
    rowLabel: "รายการทบทวน",
    rowFields: [
      {
        name: "topic",
        label: "เรื่อง",
        type: "select",
        required: true,
        options: [
          "การรับไว้นอนโรงพยาบาล",
          "ข้อบ่งชี้ในการใช้ยาและวัคซีน",
          "ข้อบ่งชี้ในการส่งตรวจและวินิจฉัย",
          "ข้อบ่งชี้ในการผ่าตัด/งดผ่าตัด",
          "อื่น ๆ ระบุ",
        ],
      },
      { name: "otherTopic", label: "อื่น ๆ ระบุ", type: "text" },
      { name: "summary", label: "สรุปประเด็น/เหตุการณ์", type: "textarea", required: true },
    ],
  },
];

export const ACTIVITY_MAP = Object.fromEntries(
  ACTIVITY_DEFINITIONS.map((activity) => [activity.id, activity]),
);

export const ACTIVITY_12_MONTH_KEYS = FY_MONTHS.map((item) => item.key);
