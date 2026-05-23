/**
 * components/ActivityList.jsx
 * 空间活动列表，显示 upcoming / past，使用 /api/spaces/:slug/activities
 *
 * props:
 *   spaceSlug — 空间 slug
 *   onView    — 查看活动回调（用于积分）
 */

import { useState, useEffect } from 'react';
import { fetchSpaceActivities } from '../lib/api.js';

function ActivityChip({ label, variant = 'upcoming' }) {
  return (
    <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
      variant === 'upcoming'
        ? 'bg-green-100 text-green-700'
        : 'bg-stone-100 text-stone-500'
    }`}>{label}</span>
  );
}

function ActivityItem({ activity, variant }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <div className="flex-none w-12 text-center">
        <p className="text-[10px] text-stone-400 leading-tight">
          {String(activity.date).slice(5, 7)}月
        </p>
        <p className="text-lg font-bold text-stone-700 leading-tight">
          {String(activity.date).slice(8, 10)}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-stone-800">{activity.title}</p>
          <ActivityChip label={variant === 'upcoming' ? '即将' : '往期'} variant={variant} />
        </div>
        {activity.intro && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{activity.intro}</p>
        )}
        {activity.tags?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {activity.tags.map(t => (
              <span key={t} className="text-[10px] text-stone-400">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityList({ spaceSlug, onView }) {
  const [activities, setActivities] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    if (!spaceSlug) return;
    setLoading(true);
    fetchSpaceActivities(spaceSlug)
      .then(data => {
        setActivities(data);
        onView?.();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [spaceSlug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 py-4">
        {[1, 2].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl" />)}
      </div>
    );
  }

  const hasUpcoming = activities.upcoming.length > 0;
  const hasPast = activities.past.length > 0;

  if (!hasUpcoming && !hasPast) {
    return <p className="text-sm text-stone-400 py-4 text-center">暂无活动记录</p>;
  }

  return (
    <div>
      {hasUpcoming && (
        <div className="mb-2">
          {activities.upcoming.map((a, i) => (
            <ActivityItem key={i} activity={a} variant="upcoming" />
          ))}
        </div>
      )}

      {hasPast && (
        <div>
          <button
            onClick={() => setShowPast(v => !v)}
            className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 py-1"
          >
            <span>{showPast ? '▾' : '▸'}</span>
            <span>往期活动（{activities.past.length}）</span>
          </button>
          {showPast && activities.past.map((a, i) => (
            <ActivityItem key={i} activity={a} variant="past" />
          ))}
        </div>
      )}
    </div>
  );
}
