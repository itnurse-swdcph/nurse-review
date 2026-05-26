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
      { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date", required: true },
      {
        name: "reviewMethod",
        label: "วิธีการทบทวน",
        type: "select",
        required: true,
        options: ["ทบทวนข้างเตียง", "Conference", "Grand Round", "Quality Round", "อื่น ๆ"],
      },
      { name: "summary", label: "สรุปเหตุการณ์", type: "textarea", required: true },
      { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
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
      { name: "topic", label: "สรุปประเด็น", type: "textarea", required: true },
      { name: "resolution", label: "วิธีแก้ไข", type: "textarea" },
      { name: "result", label: "ผลการแก้ไข", type: "textarea" },
    ],
  },
  {
    id: "3",
    shortTitle: "กิจกรรมที่ 3",
    title: "การทบทวนการส่งต่อ/ขอย้าย/ปฏิเสธการรักษา",
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "eventDate", label: "วันที่เกิดเหตุการณ์", type: "date", required: true },
      {
        name: "transferType",
        label: "ประเภท",
        type: "select",
        required: true,
        options: ["ส่งต่อ", "ขอย้าย", "ปฏิเสธการรักษา"],
      },
      { name: "summary", label: "สรุปเหตุการณ์", type: "textarea", required: true },
      { name: "issue", label: "ประเด็นสำคัญ", type: "textarea" },
      { name: "action", label: "การดำเนินการแก้ไข", type: "textarea" },
    ],
  },
  {
    id: "4",
    shortTitle: "กิจกรรมที่ 4",
    title: "การทบทวนการตรวจรักษาโดยผู้ชำนาญกว่า/ผู้ที่มีคุณสมบัติไม่ครบ",
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "eventDate", label: "วันที่ทบทวน", type: "date", required: true },
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
      { name: "topic", label: "สรุปเหตุการณ์", type: "textarea", required: true },
      { name: "result", label: "ผลลัพธ์/แนวทางปรับปรุง", type: "textarea" },
    ],
  },
  {
    id: "5",
    shortTitle: "กิจกรรมที่ 5",
    title: "การค้นหาและป้องกันความเสี่ยง",
    rowLabel: "รายการความเสี่ยง",
    rowFields: [
      { name: "riskName", label: "เรื่อง", type: "text", required: true },
      { name: "incidentCount", label: "จำนวนครั้ง", type: "number", required: true },
      {
        name: "riskType",
        label: "ประเภทความเสี่ยง",
        type: "select",
        required: true,
        options: ["ตาม Risk Profile", "ความเสี่ยงทางคลินิก", "ความเสี่ยงเฉพาะโรค", "ความเสี่ยงทั่วไป"],
      },
      { name: "correctiveAction", label: "วิธีแก้ไข", type: "textarea" },
      { name: "prevention", label: "วิธีป้องกัน", type: "textarea" },
      { name: "result", label: "ผลการแก้ไขป้องกัน", type: "textarea" },
    ],
  },
  {
    id: "6",
    shortTitle: "กิจกรรมที่ 6",
    title: "การป้องกันและเฝ้าระวังการติดเชื้อในโรงพยาบาล",
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "eventDate", label: "วันที่ทบทวน", type: "date", required: true },
      { name: "infectionCase", label: "อุบัติการณ์/ประเด็น", type: "textarea", required: true },
      { name: "analysis", label: "วิเคราะห์สาเหตุ", type: "textarea" },
      { name: "improvement", label: "การปรับปรุง", type: "textarea" },
    ],
  },
  {
    id: "7",
    shortTitle: "กิจกรรมที่ 7",
    title: "การป้องกันและเฝ้าระวังความคลาดเคลื่อนทางยา",
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
      { name: "cause", label: "สาเหตุ/ปัญหา", type: "textarea" },
      { name: "action", label: "การแก้ไข/ป้องกัน", type: "textarea" },
    ],
  },
  {
    id: "8",
    shortTitle: "กิจกรรมที่ 8",
    title: "การทบทวนการดูแลผู้ป่วยจากเหตุการณ์สำคัญ",
    rowLabel: "เหตุการณ์สำคัญ",
    rowFields: [
      { name: "eventDate", label: "วันที่", type: "date", required: true },
      { name: "caseSummary", label: "สรุปเหตุการณ์", type: "textarea", required: true },
      { name: "keyCause", label: "ประเด็นสำคัญ", type: "textarea" },
      { name: "rcaAction", label: "การดำเนินการ (RCA)", type: "textarea" },
      { name: "doctorTeam", label: "ผู้ร่วมทบทวน/แพทย์", type: "text" },
    ],
  },
  {
    id: "9",
    shortTitle: "กิจกรรมที่ 9",
    title: "การทบทวนความสมบูรณ์ของการบันทึกเวชระเบียน",
    rowLabel: "หัวข้อการทบทวน",
    summaryFields: [
      { name: "sampleCount", label: "จำนวนแฟ้ม", type: "number" },
      { name: "deadCount", label: "Dead", type: "number" },
      { name: "homeCount", label: "กลับบ้าน", type: "number" },
      { name: "refusalCount", label: "ไม่สมัครใจอยู่ต่อ", type: "number" },
    ],
    rowFields: [
      { name: "recordItem", label: "หัวข้อทบทวน", type: "text", required: true },
      { name: "completeness", label: "% ความครบถ้วน", type: "number", required: true },
      { name: "issue", label: "ปัญหา/การแก้ไข", type: "textarea" },
      { name: "result", label: "ผลการแก้ไข", type: "textarea" },
    ],
  },
  {
    id: "10",
    shortTitle: "กิจกรรมที่ 10",
    title: "การทบทวนการใช้ข้อมูลวิชาการ",
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "eventDate", label: "วันที่ทบทวน", type: "date", required: true },
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
    rowLabel: "รายการทบทวน",
    rowFields: [
      { name: "topic", label: "เรื่อง", type: "text", required: true },
      { name: "reasonableness", label: "ความสมเหตุสมผล", type: "textarea" },
      { name: "prevention", label: "แนวทางป้องกัน/แก้ไข", type: "textarea" },
      { name: "reviewer", label: "ผู้ทบทวน", type: "text" },
    ],
  },
];

export const ACTIVITY_MAP = Object.fromEntries(
  ACTIVITY_DEFINITIONS.map((activity) => [activity.id, activity]),
);

export const ACTIVITY_12_MONTH_KEYS = FY_MONTHS.map((item) => item.key);
