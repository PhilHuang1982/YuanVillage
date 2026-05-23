/**
 * workMedia.js — 作品媒体索引 + AI 回复关键词检测
 *
 * 当 AI 自由回复中提到作品标题时，自动附加对应的媒体卡片。
 * 图片作品等有素材后，在此文件补充 image_url 字段即可。
 */

export const WORK_MEDIA = [
  {
    keywords: ['我是谁'],
    media: {
      type: 'video',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483757&idx=1&sn=f0013e5aa28be0198cdacf262b9b8b4f&chksm=cf7bb65f07b324ab724854825ece6ca3bd2587b5352c57d243c0999241cac499ae532172937b',
      title: '《我是谁》',
      year: 2021,
      desc: '微电影 · 点击跳转公众号观看',
    },
  },
  {
    keywords: ['水晶笔', '我的水晶笔'],
    media: {
      type: 'video',
      url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483748&idx=1&sn=bbd0ba387e72300fb9d272b59d8bb390&chksm=cfa4637444247b2dff48603ec3debd99d3e49cc1c8d1d9d78fa7a63af1bcfbc503efea302b74',
      title: '《我的水晶笔》',
      year: 2022,
      desc: '儿童微电影 · 点击跳转公众号观看',
    },
  },
  // 绘画（有图片后取消注释并填入 url）
  // {
  //   keywords: ['龙潭花事'],
  //   media: { type: 'image', url: '/assets/works/xiaomei-painting-01.jpg', title: '《龙潭花事》', year: 2023 },
  // },
];

/**
 * 扫描 AI 回复文本，返回匹配到的第一批媒体项（可能多个）
 * @param {string} text - AI 回复文本
 * @returns {object[]|null} media 数组，或 null
 */
export function detectWorkMedia(text) {
  if (!text) return null;
  const matched = [];
  for (const entry of WORK_MEDIA) {
    if (entry.keywords.some(kw => text.includes(kw))) {
      matched.push(entry.media);
    }
  }
  return matched.length > 0 ? matched : null;
}
