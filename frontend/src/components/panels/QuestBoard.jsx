/**
 * QuestBoard.jsx — 活动任务板（SlideOver 内容）
 * items: { upcoming: Activity[], past: Activity[] }
 *   Activity: { title, date, intro, tags, status, duration_hours, capacity, price_per_person }
 */

import SlideOver from './SlideOver';

function SectionLabel({ label, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      margin: '4px 0 8px',
    }}>
      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 12, fontWeight: 700,
        color: 'var(--ink-500)', letterSpacing: '0.1em',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        background: 'var(--paper-300)', color: 'var(--ink-600)',
        padding: '1px 7px', borderRadius: 99,
      }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line-mid)' }} />
    </div>
  );
}

function ActivityCard({ q, accent }) {
  const dateStr = q.date instanceof Date
    ? q.date.toISOString().split('T')[0]
    : String(q.date || '');

  const meta = [
    q.duration_hours ? `${q.duration_hours}h` : null,
    q.capacity ? `${q.capacity}人` : null,
    q.price_per_person === 0 ? '免费' : q.price_per_person ? `¥${q.price_per_person}` : null,
  ].filter(Boolean);

  return (
    <div style={{
      background: 'var(--paper-50)',
      border: '2px solid var(--ink-900)',
      borderLeft: `6px solid ${accent}`,
      borderRadius: 10,
      boxShadow: '0 3px 0 var(--ink-900)',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600,
          color: 'var(--ink-900)', flex: 1, lineHeight: 1.35,
        }}>{q.title}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--ink-500)',
          background: 'var(--paper-200)',
          padding: '2px 6px', borderRadius: 99,
          flexShrink: 0,
        }}>{dateStr}</span>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.6 }}>
        {q.intro || q.desc || ''}
      </p>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {(q.tags || []).map(t => (
          <span key={t} style={{
            fontSize: 10, color: 'var(--ink-500)',
            background: 'var(--paper-200)',
            padding: '2px 8px', borderRadius: 99,
          }}>{t}</span>
        ))}
        {meta.length > 0 && (
          <>
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--ink-600)',
            }}>{meta.join(' · ')}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function QuestBoard({ open, onClose, items = {} }) {
  const upcoming = Array.isArray(items) ? items : (items.upcoming || []);
  const past = Array.isArray(items) ? [] : (items.past || []);
  const total = upcoming.length + past.length;

  return (
    <SlideOver title="活动" icon="任" open={open} onClose={onClose} accent="var(--persimmon-500)">
      {total === 0 ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 13, padding: 12 }}>暂无活动记录。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {upcoming.length > 0 && (
            <>
              <SectionLabel label="即将举行" count={upcoming.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {upcoming.map((q, i) => (
                  <ActivityCard key={i} q={q} accent="var(--persimmon-500)" />
                ))}
              </div>
            </>
          )}
          {past.length > 0 && (
            <>
              <SectionLabel label="历史活动" count={past.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {past.map((q, i) => (
                  <ActivityCard key={i} q={q} accent="var(--line-mid)" />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </SlideOver>
  );
}
