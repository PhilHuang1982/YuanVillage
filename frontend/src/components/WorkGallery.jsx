/**
 * components/WorkGallery.jsx
 * 主理人作品展示，使用 /api/spaces/:slug/works
 *
 * works 格式: { title, type, year, description, vid?, url? }
 */

import { useState, useEffect } from 'react';
import { fetchSpaceWorks } from '../lib/api.js';

const TYPE_ICON = {
  film: '🎬',
  song: '🎵',
  painting: '🎨',
  article: '📝',
  default: '✦',
};

function WorkItem({ work }) {
  const icon = TYPE_ICON[work.type] ?? TYPE_ICON.default;
  return (
    <div className="flex gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="flex-none text-xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-medium text-stone-800">{work.title}</p>
          {work.year && (
            <span className="text-xs text-stone-400">{work.year}</span>
          )}
        </div>
        {work.description && (
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed line-clamp-2">
            {work.description}
          </p>
        )}
        {work.url && (
          <a
            href={work.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-1 text-[10px] text-amber-600 hover:text-amber-800"
          >
            查看原作 →
          </a>
        )}
      </div>
    </div>
  );
}

export default function WorkGallery({ spaceSlug }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceSlug) return;
    setLoading(true);
    fetchSpaceWorks(spaceSlug)
      .then(data => setWorks(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [spaceSlug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 py-4">
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-stone-100 rounded-xl" />)}
      </div>
    );
  }

  if (works.length === 0) {
    return <p className="text-sm text-stone-400 py-4 text-center">暂无作品记录</p>;
  }

  return (
    <div>
      {works.map((w, i) => <WorkItem key={i} work={w} />)}
    </div>
  );
}
