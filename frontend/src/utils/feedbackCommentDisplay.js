/**
 * แสดงความเห็นจาก DB/API — รองรับรูปแบบ [participant_portal] + JSON (สำรองเมื่อ backend ยังไม่แปลง)
 */
const MARKER = '[participant_portal]';

export function displayFeedbackComment(raw) {
    if (raw == null) return '';
    const s = String(raw).trim();
    if (!s) return '';

    if (!s.startsWith(MARKER)) {
        return s;
    }

    const jsonPart = s.slice(MARKER.length).trimStart();
    if (!jsonPart) return s;

    try {
        const meta = JSON.parse(jsonPart);
        const lines = [];
        const userText = meta.comment != null ? String(meta.comment).trim() : '';
        if (userText) lines.push(userText);

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
    } catch {
        return s;
    }
}
