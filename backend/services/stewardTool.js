/**
 * services/stewardTool.js
 * propose_itinerary tool schema — Claude/OpenAI format
 */

export const PROPOSE_ITINERARY_TOOL = {
  name: 'propose_itinerary',
  description: '当村管家已充分了解访客需求画像后，调用此工具生成结构化的定制旅居方案。只在需求挖掘充分（至少 3 轮对话）后调用。',
  input_schema: {
    type: 'object',
    required: ['guest_profile', 'recommended_spaces', 'recommended_persons', 'itinerary_outline'],
    properties: {
      guest_profile: {
        type: 'object',
        description: '访客画像',
        properties: {
          type: { type: 'string', description: '画像类型，如：创作者/远程工作者/度假者/亲子家庭/学习者' },
          key_needs: { type: 'array', items: { type: 'string' }, description: '核心需求（3-5 条）' },
          not_suitable_for: { type: 'array', items: { type: 'string' }, description: '不适合的事（诚实说）' },
        },
        required: ['type', 'key_needs'],
      },
      recommended_spaces: {
        type: 'array',
        description: '推荐空间列表（按优先级排序）',
        items: {
          type: 'object',
          properties: {
            space_slug: { type: 'string' },
            space_name: { type: 'string' },
            reason: { type: 'string', description: '为什么推荐这个空间（针对该访客）' },
          },
          required: ['space_slug', 'space_name', 'reason'],
        },
      },
      recommended_persons: {
        type: 'array',
        description: '推荐主理人列表',
        items: {
          type: 'object',
          properties: {
            person_slug: { type: 'string' },
            person_name: { type: 'string' },
            connect_reason: { type: 'string', description: '为什么推荐与此人连接' },
          },
          required: ['person_slug', 'person_name', 'connect_reason'],
        },
      },
      recommended_offerings: {
        type: 'array',
        description: '推荐活动/体验',
        items: { type: 'string' },
      },
      itinerary_outline: {
        type: 'string',
        description: '2-4 天的旅居方案大纲（自然语言）',
      },
      not_recommended: {
        type: 'array',
        description: '诚实说明哪些空间/体验不适合此访客',
        items: { type: 'string' },
      },
    },
  },
};
