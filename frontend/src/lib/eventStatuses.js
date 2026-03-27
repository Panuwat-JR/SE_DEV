/** ชื่อสถานะโครงการตามฐานข้อมูล (status_events.name) — ใช้ร่วมกันหน้า Activities / ActivityDetail */
export const EVENT_STATUS_OPTIONS = [
  'วางแผน',
  'เปิดรับสมัคร',
  'ปิดรับสมัคร',
  'ประกาศผล',
  'กำลังดำเนินการ',
  'เสร็จสิ้น',
  'ยกเลิก',
];

/** แมปค่าเก่า/ผิดจาก UI หรือข้อมูลเก่า → ชื่อใน DB */
const STATUS_ALIASES = {
  ดำเนินการสำเร็จ: 'เสร็จสิ้น',
  'ดำเนินการ เสร็จสิ้น': 'เสร็จสิ้น',
  completed: 'เสร็จสิ้น',
};

/** ค่าที่ใช้ใน <select> ให้ตรงกับ option ที่มีจริง */
export function toEventStatusSelectValue(dbStatus) {
  const s = String(dbStatus || '').trim();
  if (!s) return 'วางแผน';
  const mapped = STATUS_ALIASES[s] || s;
  if (EVENT_STATUS_OPTIONS.includes(mapped)) return mapped;
  return mapped;
}

/** รายการ option สำหรับ select รวมสถานะปัจจุบันที่อาจไม่อยู่ในรายการมาตรฐาน */
export function eventStatusOptionsFor(currentStatus) {
  const cur = toEventStatusSelectValue(currentStatus);
  const set = new Set(EVENT_STATUS_OPTIONS);
  if (currentStatus && String(currentStatus).trim() && !set.has(String(currentStatus).trim())) {
    set.add(String(currentStatus).trim());
  }
  if (!set.has(cur)) set.add(cur);
  return Array.from(set);
}

export function eventStatusBadgeClass(status) {
  const s = String(status || '');
  if (s === 'กำลังดำเนินการ') return 'bg-emerald-100 text-emerald-700';
  if (s === 'เปิดรับสมัคร') return 'bg-blue-100 text-blue-700';
  if (s === 'ปิดรับสมัคร') return 'bg-orange-100 text-orange-800';
  if (s === 'ประกาศผล') return 'bg-violet-100 text-violet-800';
  if (s === 'เสร็จสิ้น' || s === 'ดำเนินการสำเร็จ') return 'bg-gray-100 text-gray-600';
  if (s === 'ยกเลิก') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}
