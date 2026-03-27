/** แมป priority_slug จาก API → ป้ายไทยให้ตรงกับตัวเลือกในฟอร์ม */
export function priorityLabel(task) {
  const slug = task?.priority_slug || '';
  const map = { urgent: 'เร่งด่วนที่สุด', high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
  if (map[slug]) return map[slug];
  return task?.priority || 'กลาง';
}

export function priorityBadgeClass(task) {
  const slug = task?.priority_slug || '';
  if (slug === 'urgent') return 'text-red-700 bg-red-100';
  if (slug === 'high') return 'text-orange-700 bg-orange-100';
  if (slug === 'medium') return 'text-blue-700 bg-blue-100';
  if (slug === 'low') return 'text-slate-600 bg-slate-100';
  if (task?.priority === 'สูง') return 'text-orange-700 bg-orange-100';
  return 'text-gray-600 bg-gray-100';
}

export function priorityDotClass(task) {
  const slug = task?.priority_slug || '';
  if (slug === 'urgent') return 'bg-red-600';
  if (slug === 'high') return 'bg-orange-500';
  if (slug === 'medium') return 'bg-blue-500';
  if (slug === 'low') return 'bg-slate-400';
  if (task?.priority === 'สูง') return 'bg-orange-500';
  return 'bg-blue-400';
}
