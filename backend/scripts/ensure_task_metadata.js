const pool = require('../config/db');

async function ensureMetadata() {
  try {
    console.log('--- Ensuring Priority Levels ---');
    const priorities = [
      { name: 'เร่งด่วนที่สุด', slug: 'urgent', description: 'งานที่ต้องทำทันที เนื่องจากส่งผลกระทบต่อกำหนดการหลักอย่างวิกฤต', color: '#ef4444' },
      { name: 'สูง', slug: 'high', description: 'งานสำคัญที่ต้องดำเนินการให้เสร็จภายในวันหรือสัปดาห์ปัจจุบัน', color: '#f97316' },
      { name: 'กลาง', slug: 'medium', description: 'งานทั่วไปที่สามารถดำเนินงานตามลำดับเวลาปกติได้', color: '#3b82f6' },
      { name: 'ต่ำ', slug: 'low', description: 'งานที่ไม่เร่งด่วน สามารถรอทำหลังงานอื่นๆ เสร็จสิ้นได้', color: '#94a3b8' }
    ];

    for (const p of priorities) {
      const exists = await pool.query('SELECT priority_id FROM priority_levels WHERE slug = $1', [p.slug]);
      if (exists.rowCount === 0) {
        await pool.query(
          'INSERT INTO priority_levels (name, slug, description, code_color) VALUES ($1, $2, $3, $4)',
          [p.name, p.slug, p.description, p.color]
        );
        console.log(`Added priority: ${p.name} (${p.slug})`);
      } else {
        // Update name if it's different (e.g. synonym)
        await pool.query('UPDATE priority_levels SET name = $1 WHERE slug = $2', [p.name, p.slug]);
        console.log(`Updated/Verified priority: ${p.name} (${p.slug})`);
      }
    }

    console.log('\n--- Ensuring Task Categories ---');
    const categories = [
      { name: 'ทั่วไป', slug: 'general', description: 'งานทั่วไปที่ไม่จัดอยู่ในหมวดหมู่อื่น' },
      { name: 'ประสานงาน', slug: 'prep', description: 'งานติดต่อประสานงานและจัดเตรียมความพร้อม' },
      { name: 'สถานที่', slug: 'place', description: 'งานจัดเตรียมสถานที่และการจัดการพื้นที่' },
      { name: 'เอกสาร', slug: 'summary', description: 'งานสรุปผล จัดการเอกสาร และรายงาน' },
      { name: 'การตลาด', slug: 'pr', description: 'งานโฆษณา ประชาสัมพันธ์ และการตลาด' },
      { name: 'โลจิสติกส์', slug: 'event', description: 'งานจัดการขนส่งและลำดับขั้นตอนกิจกรรม' },
      { name: 'อื่นๆ', slug: 'other', description: 'งานอื่นๆ นอกเหนือจากที่ระบุ' }
    ];

    for (const c of categories) {
      const exists = await pool.query('SELECT task_category_id FROM task_categories WHERE slug = $1', [c.slug]);
      if (exists.rowCount === 0) {
        await pool.query(
          'INSERT INTO task_categories (name, slug, description) VALUES ($1, $2, $3)',
          [c.name, c.slug, c.description]
        );
        console.log(`Added category: ${c.name} (${c.slug})`);
      } else {
        await pool.query('UPDATE task_categories SET name = $1 WHERE slug = $2', [c.name, c.slug]);
        console.log(`Updated/Verified category: ${c.name} (${c.slug})`);
      }
    }

    console.log('\n✅ Database metadata sync completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

ensureMetadata();
