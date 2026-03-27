/** prefix ตอนบันทึก — ตามด้วย JSON หนึ่งก้อน */
const PARTICIPANT_PORTAL_PREFIX = '[participant_portal] ';
/** marker ฝั่งอ่าน — ยอมรับช่องว่าง/ขึ้นบรรทัดหลัง `]` (ข้อมูลเก่าหรือคัดลอกอาจไม่มีช่องว่างเดียวกับตอนเขียน) */
const PARTICIPANT_PORTAL_MARKER = '[participant_portal]';

/**
 * แยก payload จาก comment ที่บันทึกจาก portal (ถ้าไม่ใช่รูปแบบนี้คืน null)
 */
function parseParticipantPortalComment(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s.startsWith(PARTICIPANT_PORTAL_MARKER)) return null;
  const jsonPart = s.slice(PARTICIPANT_PORTAL_MARKER.length).trimStart();
  if (!jsonPart) return null;
  try {
    return JSON.parse(jsonPart);
  } catch {
    return null;
  }
}

/**
 * ข้อความที่อ่านได้สำหรับ executive / รายงาน (ข้อความผู้ใช้ + สรุปรายด้าน)
 */
function humanizeStoredFeedbackComment(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';

  const meta = parseParticipantPortalComment(s);
  if (!meta) {
    return s;
  }

  const lines = [];
  const userText = meta.comment != null ? String(meta.comment).trim() : '';
  if (userText) {
    lines.push(userText);
  }

  if (meta.aspects && typeof meta.aspects === 'object' && !Array.isArray(meta.aspects)) {
    const aspectParts = Object.entries(meta.aspects)
      .filter(([, v]) => v != null && v !== '' && Number(v) > 0)
      .map(([label, score]) => `${label} ${Number(score)}/5 ดาว`);
    if (aspectParts.length) {
      lines.push(`รายด้าน: ${aspectParts.join(' · ')}`);
    }
  }

  if (lines.length) return lines.join('\n\n');
  return 'ไม่มีข้อความเพิ่มเติม';
}

module.exports = {
  PARTICIPANT_PORTAL_PREFIX,
  PARTICIPANT_PORTAL_MARKER,
  parseParticipantPortalComment,
  humanizeStoredFeedbackComment,
};
