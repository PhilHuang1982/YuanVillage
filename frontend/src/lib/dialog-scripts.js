/**
 * dialog-scripts.js — 对话剧本（树状结构）
 * 前端开场白 + 主干引导节点（静态）
 * 用户自由输入通过 /api/chat 后端处理
 *
 * 节点格式：
 * {
 *   id?, speaker, name, sub?,
 *   text,
 *   choices?: [{ label, hint?, next?, action?, value? }],
 *   end?  // 是否终结节点（显示"关闭对话"）
 * }
 *
 * action 特殊值：
 *   "enter_xiaomeizhuang" → 触发场景切换进小梅桩
 *   "back_to_map"         → 回到村庄地图
 */

export const longxunScripts = {
  /* ── 第一问：来龙潭的目的 ── */
  open: {
    id: 'open',
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '你跨过凤凰台那块龙潭里的石头，就踏入了一条我守了六百年的溪。\n\n水声不变，石板路变过几回。说吧——你来这儿，主要是为了什么？',
    choices: [
      { label: '安静创作，做自己的东西', next: 'q2_creator', hint: '创作者' },
      { label: '远程办公，找个协作社区', next: 'q2_nomad', hint: '数字游民' },
      { label: '探索村落生态，找自己的生态位', next: 'q2_explorer', hint: '潜在云村民' },
      { label: '就随便看看', next: 'wander' },
    ],
  },

  /* ── 第二问：时长 ── */
  q2_creator: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '为你匹配',
    text: '好，创作的人在这儿最自在。\n\n打算待多久？',
    choices: [
      { label: '三五天，短住感受一下', next: 'plan_creator_short' },
      { label: '两周到一个月', next: 'plan_creator_mid' },
      { label: '想长住，还没定', next: 'plan_creator_long' },
    ],
  },

  q2_nomad: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '为你匹配',
    text: '数字游民，好。\n\n计划在村里待多久？',
    choices: [
      { label: '两周左右', next: 'plan_nomad_short' },
      { label: '一个月以上，想长住', next: 'plan_nomad_long' },
    ],
  },

  q2_explorer: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '为你匹配',
    text: '好眼光，这个村值得慢慢走。\n\n你更感兴趣哪类？',
    choices: [
      { label: '艺术/创作空间', next: 'plan_creator_short' },
      { label: '数字游民社区', next: 'plan_nomad_short' },
      { label: '都想看看', next: 'plan_explorer' },
    ],
  },

  /* ── 预制方案卡片（toolResult → ItineraryCard，即时出现，不走 API） ── */
  plan_creator_short: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '好，我帮你选了一个地方。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '创作者 · 短住',
          key_needs: ['寻找安静创作环境', '3-5天深度体验', '感受主理人真实生活', '远离标准化民宿'],
        },
        recommended_spaces: [
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '主推 ✦ 前律师主理人梅桩主，画画写歌种花。二楼东房对花园，早上鸟叫下午斜光，不挂平台只接气质对的人。带一本正在读的书，去敲门。',
          },
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '补充 · 第4天可去转转，感受数字游民社区生态，无需入住。',
          },
        ],
        recommended_persons: [
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '前律师，现在画画写歌种花。聊聊她为什么放弃高薪来龙潭，对创作者很有启发。',
          },
        ],
        itinerary_outline: `第1天 · 抵达安顿
顺着青石路走到小梅桩，敲门入住。下午在院子里坐坐，不急着"做事"，先感受节奏。傍晚随梅桩主浇浇花，聊聊各自的来路。

第2天 · 进入状态
上午创作，东边来的光斜过院子。下午探索村落：廊桥、田垄、竹林。傍晚村小学的孩子会来院子玩，看热闹就好。

第3天 · 深度交流
和梅桩主聊聊她的故事——从律师到龙潭，中间发生了什么。她不是每天都愿意说，但如果聊起来，你会有收获。

第4天 · 扩展探索
去138数字游民基地转转，看看在这里长住的人在做什么，感受另一种在龙潭生活的方式。

第5天 · 收尾离开
带一样你在这里创作的东西离开——哪怕只是一段文字、一张手绘、或一个新的想法。`,
        not_recommended: ['期待标准化服务和前台接待', '需要每天出去景区打卡', '计划开车走多个城市'],
      },
    },
    choices: [{ label: '还有别的空间吗？', next: 'plan_more' }],
  },

  plan_creator_mid: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '两周的话，我给你安排两个地方。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '创作者 · 两周',
          key_needs: ['沉浸式创作', '两周长住', '创作与社交结合', '建立工作节奏'],
        },
        recommended_spaces: [
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '主推 ✦ 前半程首选，先住3-5天感受节奏。气质对了可以留下来长住，桩主会问你三个问题。',
          },
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '补充 · 后半程转移阵地，有共享办公和来自各地的游民，适合需要交流和协作资源的创作者。',
          },
        ],
        recommended_persons: [
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '在龙潭扎根多年的创作者，聊聊如何在乡村维持创作状态。',
          },
          {
            person_name: '浅予',
            person_space_slug: 'dao-longtan',
            connect_reason: '138基地的运营者，了解基地的社区活动和当前协作机会。',
          },
        ],
        itinerary_outline: `第1-3天 · 小梅桩安顿
入住，感受节奏。与梅桩主深度交流，了解她的创作故事。慢慢走熟村里的路，找到属于自己的角落。

第4-7天 · 沉浸创作
进入自己的工作状态。龙潭的节奏分明：上午创作，下午游走，晚上整理。不受打扰，专注当下。

第8-10天 · 转移138基地
移至138数字游民基地，接触来自各地的游民。感受协作氛围，交流彼此的工作方式。

第11-14天 · 深度融入
参与基地的社区活动（方言破冰、读书会、四海家宴）。找到志同道合的人，聊聊未来合作的可能。`,
        not_recommended: ['完全无法接受断网或网速慢', '需要每天出入城区'],
      },
    },
    choices: [{ label: '先在地图上转转', next: 'wander' }],
  },

  plan_creator_long: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '长住不急，先来一周试试水。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '创作者 · 长住',
          key_needs: ['彻底换节奏', '找到长期生态位', '在地扎根', '与主理人社区融合'],
        },
        recommended_spaces: [
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '主推 ✦ 有长租候选，桩主会先问你三个问题：愿不愿意早起浇花、孩子跑进来会不会赶走、断网三天能干嘛。答对了，你就留下来了。',
          },
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '备选 · 如果需要更稳定的办公设施和游民社区，138基地也支持按月长租。',
          },
        ],
        recommended_persons: [
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '2019年从上海辞职来龙潭，是龙潭长住创作者的代表。聊聊她如何在这里建立起自己的节奏。',
          },
        ],
        itinerary_outline: `第1-5天 · 试住感受
先按短住逻辑来，不要带太多行李，不要签任何承诺。感受龙潭的真实节奏，看看自己能不能适应。

第6-10天 · 找到位置
如果节奏对了，开始认真想：你在这里能做什么？你的技能和这里的人有没有交点？

第11天以后 · 决定是否留下
带着这个问题去和桩主再聊一次。她会问你那三个问题。答案会告诉你自己适不适合留下来。`,
        not_recommended: ['把龙潭当"充电站"短暂逃离', '还没想清楚自己要做什么就来"找答案"'],
      },
    },
    choices: [
      { label: '也想了解138基地', next: 'plan_nomad_long' },
      { label: '先在地图上转转', next: 'wander' },
    ],
  },

  plan_nomad_short: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '这个方向，有个地方很适合你。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '数字游民',
          key_needs: ['远程办公', '寻找协作伙伴', '体验乡村数字生活', '两周左右'],
        },
        recommended_spaces: [
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '主推 ✦ SeeDao运营，独栋，共享办公、Wi-Fi、咖啡、健身房。住着来自北上广深和东南亚的游民，有临时组队的氛围，是龙潭数字游民的核心据点。',
          },
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '补充 · 两处风格完全不同。抽出半天去喝杯茶，感受另一种在地生活方式，视角会很不一样。',
          },
        ],
        recommended_persons: [
          {
            person_name: '浅予',
            person_space_slug: 'dao-longtan',
            connect_reason: '138基地空间运营者，了解活动安排、长住政策和当前在住游民构成。',
          },
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '在地主理人，提供游民社区之外的龙潭视角，了解村子真实的人文生态。',
          },
        ],
        itinerary_outline: `第1-2天 · 安顿落地
入住138基地，熟悉公共设施。和浅予聊聊当前基地的状态，了解在住游民的构成和近期活动。

第3天 · 探索全村
走一遍龙潭村，感受它的真实尺度。顺道去小梅桩喝杯茶，感受另一种在地生活方式。

第4-7天 · 进入工作节奏
利用共享办公空间远程工作。白天专注，晚上参与基地的社区活动，认识同住的游民。

第8-14天 · 深度融入
参与方言破冰、四海家宴、读书会等活动。找到潜在的协作伙伴，探索在龙潭合作一件事的可能。`,
        not_recommended: ['需要高强度视频会议和稳定大带宽', '对泥土气息和虫鸣无法接受'],
      },
    },
    choices: [{ label: '先在地图上转转', next: 'wander' }],
  },

  plan_nomad_long: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '长住的话，138基地是首选。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '数字游民 · 长住',
          key_needs: ['按月长租', '稳定工作环境', '建立本地人脉', '在地扎根探索'],
        },
        recommended_spaces: [
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '主推 ✦ 适合按月长租，设施齐全。SeeDao社区运营，有稳定的游民社群和活动体系，是长期数字游民的理想据点。',
          },
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '补充 · 长住期间可以深入认识在地主理人群体，小梅桩是了解龙潭人文生态的好窗口。',
          },
        ],
        recommended_persons: [
          {
            person_name: '浅予',
            person_space_slug: 'dao-longtan',
            connect_reason: '138基地的核心运营者，长住政策、社区规则、当前项目都可以直接问她。',
          },
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '龙潭最资深的"新村民"之一，了解乡村真实生态和长住者的心路历程。',
          },
        ],
        itinerary_outline: `第1-7天 · 试住一周
按短住逻辑来，不带太多行李。感受龙潭的真实节奏，判断自己能不能在这里长期工作和生活。

第2-3周 · 找到工作节奏
如果第一周感觉对了，开始认真安顿。建立规律的工作节奏，认识村里的常驻居民。

第1个月以后 · 深度嵌入
参与村里的长期项目和社区活动。开始思考：你的技能和龙潭这个社区有没有交点？你能在这里创造什么？`,
        not_recommended: ['把长住当"旅行延长版"而非真实生活', '期待乡村提供城市一样的基础设施'],
      },
    },
    choices: [
      { label: '先去小梅桩感受一下', next: 'route_xiaomei' },
      { label: '先在地图上转转', next: 'wander' },
    ],
  },

  plan_explorer: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '龙潭村守护者',
    text: '都想看看？那我给你一条探索路线。',
    toolResult: {
      type: 'propose_itinerary',
      data: {
        guest_profile: {
          type: '探索者',
          key_needs: ['全面了解村落生态', '找到自己的生态位', '接触不同类型主理人', '开放式探索'],
        },
        recommended_spaces: [
          {
            space_name: '小梅桩',
            space_slug: 'xiaomeizhuang',
            reason: '主推 · 第一站，感受艺术气质的在地生活。梅桩主的故事是了解龙潭精神气质的最好入口。',
          },
          {
            space_name: '138数字游民基地',
            space_slug: 'dao-longtan',
            reason: '第二站，感受数字游民社区的热闹氛围，了解云村民群体的生活方式。',
          },
          {
            space_name: '金豆子',
            space_slug: 'jindouzi',
            reason: '第三站，漫画·深夜食堂，钢子的据点，另一种龙潭——随性、有趣、充满故事。',
          },
        ],
        recommended_persons: [
          {
            person_name: '梅桩主',
            person_space_slug: 'xiaomeizhuang',
            connect_reason: '前律师出身的在地创作者，了解龙潭的人文底色。',
          },
          {
            person_name: '浅予',
            person_space_slug: 'dao-longtan',
            connect_reason: '数字游民社区运营者，了解云村民如何在龙潭找到生态位。',
          },
          {
            person_name: '钢子',
            person_space_slug: 'jindouzi',
            connect_reason: '金豆子主理人，漫画师+马拉松跑者+厨师，龙潭最有趣的跨界人物之一。',
          },
        ],
        itinerary_outline: `第1-2天 · 小梅桩
感受艺术气质的在地生活。与梅桩主深聊，了解龙潭的精神气质和她来这里的故事。

第3天 · 138数字游民基地
感受数字游民社区的热闹氛围。和浅予聊聊基地的生态，了解云村民如何在这里找到位置。

第4天 · 金豆子
去钢子的据点坐坐，看看他的漫画，聊聊另一种在龙潭生活的可能性。

第5天 · 整合反思
在村里随便走走，回想这几天见到的人和空间。龙潭适不适合你、你能在这里做什么——答案应该开始清晰了。`,
        not_recommended: ['期待一次性"看完"龙潭所有东西', '走马观花式旅游'],
      },
    },
    choices: [
      { label: '去小梅桩 →', next: 'route_xiaomei' },
      { label: '先在地图上转转', next: 'wander' },
    ],
  },

  plan_more: {
    speaker: 'longxun',
    name: '龙圣子',
    text: '村里还有金豆子（漫画·深夜食堂）、黄喆的分身蒸馏工作室、浅予的梦想版工作坊……\n\n这些今天都可以在地图上进去聊聊。\n\n不过第一站，我还是推荐小梅桩。',
    choices: [
      { label: '好，去小梅桩 →', next: 'route_xiaomei' },
      { label: '先在地图上转转', next: 'wander' },
    ],
  },

  /* 路由：进入小梅桩 */
  route_xiaomei: {
    speaker: 'longxun',
    name: '龙圣子',
    sub: '已为你引路',
    text: '顺着青石路往南，过廊桥，左边那座有花的院子就是小梅桩。\n\n敲门之前——记得不要说「我是来度假的」。她听到这话会皱眉。',
    choices: [
      { label: '好，去敲门 →', action: 'enter_xiaomeizhuang' },
      { label: '我再想想', next: 'wander' },
    ],
  },

  wander: {
    speaker: 'longxun',
    name: '龙圣子',
    text: '不急。\n\n地图上的点位可以慢慢点——每个空间都可以进去聊聊。需要我时，点我头顶的「！」即可。',
    end: true,
  },
};

export const xiaomeiScripts = {
  open: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '小梅桩 · 主理人',
    text: '你怎么找到这儿来的？\n\n小梅桩不挂平台，不做短视频。能进这院子的，多半是有缘。',
    choices: [
      { label: '你是怎么来龙潭的？', next: 'my_story' },
      { label: '可以看看你的作品吗？', next: 'my_works' },
      { label: '看看这里的空间', next: 'space_photos' },
      { label: '想住下来', next: 'want_create' },
    ],
  },
  from_longxun: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '哦，龙圣子啊。\n\n那他大概跟你说了我之前是律师。是的，2017 年辞职，2018 年到屏南跟林正碌学画，2019 年正式搬来。 [c-002]\n\n来龙潭不是因为山水好——山好水好的地方哪儿都有。我是来找一群想独立、想创造的人。 [c-001]',
    choices: [
      { label: '你画画？我能看吗？', next: 'see_paint' },
      { label: '你拍过电影？', next: 'see_film' },
      { label: '可以住下来吗？', next: 'want_create' },
    ],
  },
  want_create: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '那要看你创作什么。\n\n我这儿四间客房，两间长租给数字游民——一位剪辑师，一位写论文的博士。剩下两间不挂平台。\n\n你做什么的？',
    choices: [
      { label: '我写东西（公众号/小说）', next: 'writer_ok' },
      { label: '我拍片子/做视频', next: 'video_ok' },
      { label: '我做产品/写代码', next: 'code_ok' },
      { label: '我还在想转型', next: 'transition' },
    ],
  },
  writer_ok: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '写东西的人住这儿很好。\n\n二楼东房有面窗对着我的花园，早上鸟叫，下午有一束光斜过来。我把那间留给愿意安静坐着的人。\n\n你能写几天？',
    choices: [
      { label: '大概一周', next: 'stay_week' },
      { label: '想住一个月以上', next: 'stay_long' },
    ],
  },
  video_ok: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '拍片可以，但请你别拍我。\n\n我自己拍过两部微电影——《我是谁》《我的水晶笔》。 [c-005] 不是不喜欢镜头，是不喜欢「来打卡的镜头」。\n\n如果你拍村子、拍村民、拍光影，我可以带你认识几位老人。',
    media: [
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483757&idx=1&sn=f0013e5aa28be0198cdacf262b9b8b4f&chksm=cf7bb65f07b324ab724854825ece6ca3bd2587b5352c57d243c0999241cac499ae532172937b', title: '《我是谁》', year: 2021, desc: '微电影' },
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483748&idx=1&sn=bbd0ba387e72300fb9d272b59d8bb390&chksm=cfa4637444247b2dff48603ec3debd99d3e49cc1c8d1d9d78fa7a63af1bcfbc503efea302b74', title: '《我的水晶笔》', year: 2022, desc: '儿童微电影' },
    ],
    choices: [
      { label: '好，我尊重', next: 'stay_week' },
      { label: '我再想想', next: 'back_to_open' },
    ],
  },
  code_ok: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '做产品的，住下来挺好——但 138 数字游民基地更适合长期。那边有共享办公、靠谱的网。\n\n小梅桩适合你来一两个晚上，跟我喝茶聊聊「为什么要做这个产品」。',
    choices: [
      { label: '好，那我先来住两晚', next: 'stay_week' },
      { label: '回去问问龙圣子', next: 'back_to_longxun' },
    ],
  },
  transition: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '想转型的人，我多聊几句。\n\n我也是这么过来的。律师做了十几年，专攻外商投资、收购兼并。 [c-002] 累，但不是因为忙——是因为做的事跟自己想成为的人，是两件事。\n\n你不用现在想清楚。先住下来一周，每天起来浇浇花，下午跟我喝茶。一周之后你想到什么再说。',
    choices: [
      { label: '听起来很好，我想试试', next: 'stay_week' },
      { label: '我得先回去想想', next: 'back_to_open' },
    ],
  },
  just_look: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '可以看。\n\n院子里的花是我种的，房间里的画是我画的，墙上挂的字是村里另一位写的。\n\n你慢慢看，看到喜欢的角落可以停下来——但请别拍我，可以拍花、拍光、拍门口的猫。',
    choices: [
      { label: '门口黑板上写的是什么？', next: 'blackboard' },
      { label: '为什么不上携程？', next: 'why_no_platform' },
    ],
  },
  see_paint: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '二楼走廊那张大的是去年的——一只鹿在月光下看一片湖。\n\n画画对我来说不是「作品」。是早上五点起来，等光斜过来的时候，挤一点颜料的事。 [c-006] 跟拍片、写歌、种花是一样的。',
    choices: [
      { label: '你也写歌？', next: 'see_song' },
      { label: '回去想想要不要住', next: 'back_to_open' },
    ],
  },
  see_film: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '拍过两部。\n\n《我是谁》是 2021 年拍的，2023 年才发出来。 [c-005] 拍完我自己看了好多遍——本来想讲一个有趣的故事，最后发现有趣的背后是心酸。\n\n《我的水晶笔》是给孩子拍的，关于失去和原谅。',
    media: [
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483757&idx=1&sn=f0013e5aa28be0198cdacf262b9b8b4f&chksm=cf7bb65f07b324ab724854825ece6ca3bd2587b5352c57d243c0999241cac499ae532172937b', title: '《我是谁》', year: 2021, desc: '微电影 · 龙潭新村民故事' },
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483748&idx=1&sn=bbd0ba387e72300fb9d272b59d8bb390&chksm=cfa4637444247b2dff48603ec3debd99d3e49cc1c8d1d9d78fa7a63af1bcfbc503efea302b74', title: '《我的水晶笔》', year: 2022, desc: '儿童微电影' },
    ],
    choices: [
      { label: '想住下来有机会一起看', next: 'want_create' },
      { label: '回去想想', next: 'back_to_open' },
    ],
  },
  see_song: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '《风吹过的山坡上》。\n\n是 2022 年乡土建筑工匠的篝火晚会上首唱的。 [c-008] 不是为了「发歌」，是那个晚上想唱。\n\n去年 9 月在芳院村办了一场小型专场，叫「在水之洲」。 [c-007]',
    choices: [
      { label: '好酷。我想住下来', next: 'want_create' },
      { label: '回去想想', next: 'back_to_open' },
    ],
  },
  blackboard: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: 'My Home, My Life Style.\n\n小梅桩主要是我自己生活和工作的地方，民宿只是它对外开启的一个交流窗口。 [c-003]\n\n不是不欢迎你来——是希望你来的时候，记得这是别人的家。',
    choices: [
      { label: '我懂', next: 'back_to_open' },
      { label: '再问一个', next: 'why_no_platform' },
    ],
  },
  why_no_platform: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '携程上的客人，不是不好——是「我付了钱，你就该给我五星级服务」的逻辑，跟小梅桩不合。 [c-001]\n\n来这里的人，得允许房间偶尔有蜘蛛，得允许我下午不在前台。能找上来的，都是有缘人。',
    choices: [
      { label: '我想成为有缘人', next: 'want_create' },
      { label: '回去想想', next: 'back_to_open' },
    ],
  },
  stay_week: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '约一杯茶',
    text: '好，那你下周一来。\n\n我会给你留二楼东房。住的事我们不签合同，只约「住几天、付多少」。\n\n来的时候带一本你最近在读的书，茶我准备。',
    end: true,
  },
  stay_long: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '长租候选',
    text: '长租得聊一次。\n\n你下周来住三天试试。如果三天后你还想留下，我们再谈。我不会让你写商业方案——只问你三个问题。',
    choices: [
      { label: '哪三个问题？', next: 'three_qs' },
    ],
  },
  three_qs: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '一，你愿意早上六点起来浇一次花吗？\n二，村里小孩跑进来，你会赶他们走吗？\n三，如果断网三天，你能干嘛？\n\n不用现在答。你住三天就知道了。',
    end: true,
  },
  where_film: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '我的公众号「小梅桩」上能看到。\n\n或者你住下来的晚上，我可以投到墙上跟你一起看。',
    media: [
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483757&idx=1&sn=f0013e5aa28be0198cdacf262b9b8b4f&chksm=cf7bb65f07b324ab724854825ece6ca3bd2587b5352c57d243c0999241cac499ae532172937b', title: '《我是谁》', year: 2021, desc: '微电影 · 点击跳转公众号' },
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483748&idx=1&sn=bbd0ba387e72300fb9d272b59d8bb390&chksm=cfa4637444247b2dff48603ec3debd99d3e49cc1c8d1d9d78fa7a63af1bcfbc503efea302b74', title: '《我的水晶笔》', year: 2022, desc: '儿童微电影 · 点击跳转公众号' },
    ],
    choices: [
      { label: '我想住下来看', next: 'want_create' },
      { label: '回去想想', next: 'back_to_open' },
    ],
  },
  /* ── 我的故事 ── */
  my_story: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '我的故事',
    text: '我是上海的律师，专攻外商投资和收购兼并。做了十几年。\n\n不是不喜欢——是有一天突然算了一笔账：这份工作里，有多少时间是我真正想要的？ [c-002]\n\n2017 年辞职，2018 年跑到屏南跟林正碌学画，2019 年正式搬进龙潭。\n\n来龙潭不是为了逃城市。是因为这里有一群「来做自己」的人。 [c-001]',
    choices: [
      { label: '你现在过得好吗？', next: 'now_life' },
      { label: '想看看你的作品', next: 'my_works' },
      { label: '可以住下来吗？', next: 'want_create' },
    ],
  },

  now_life: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '好。很好。\n\n早上五点起来，等光斜过来的时候，挤一点颜料。下午喝茶，傍晚浇花。偶尔拍片，偶尔写歌。 [c-006]\n\n钱少了，但时间是我的。',
    choices: [
      { label: '想看看你的作品', next: 'my_works' },
      { label: '看看这里的空间', next: 'space_photos' },
      { label: '想来住一段时间', next: 'want_create' },
    ],
  },

  /* ── 我的作品（带链接） ── */
  my_works: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '我的作品',
    text: '画、片子、歌，都有。\n\n电影拍了两部——《我是谁》和《我的水晶笔》，点下面可以直接看。画放在院子里和公众号上。歌是那年篝火晚会唱的，叫《风吹过的山坡上》。 [c-005][c-008]',
    media: [
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483757&idx=1&sn=f0013e5aa28be0198cdacf262b9b8b4f&chksm=cf7bb65f07b324ab724854825ece6ca3bd2587b5352c57d243c0999241cac499ae532172937b', title: '《我是谁》', year: 2021, desc: '微电影 · 点击跳转公众号' },
      { type: 'video', url: 'https://mp.weixin.qq.com/s?__biz=Mzg2NDIwMTYzOQ==&mid=2247483748&idx=1&sn=bbd0ba387e72300fb9d272b59d8bb390&chksm=cfa4637444247b2dff48603ec3debd99d3e49cc1c8d1d9d78fa7a63af1bcfbc503efea302b74', title: '《我的水晶笔》', year: 2022, desc: '儿童微电影 · 点击跳转公众号' },
    ],
    choices: [
      { label: '看看这里的空间', next: 'space_photos' },
      { label: '我想住下来', next: 'want_create' },
      { label: '回到开头', next: 'back_to_open' },
    ],
  },

  /* ── 空间展示（实景照片） ── */
  space_photos: {
    speaker: 'xiaomei',
    name: '梅桩主',
    sub: '小梅桩空间',
    text: '院子是我一点点种的，房间里的画是我画的，墙上挂的字是村里另一位写的。\n\n四间客房，两间长租给数字游民，两间不挂平台。进来慢慢看。',
    media: [
      { type: 'image', url: '/assets/images/spaces/xiaomeizhuang/xmz-1.jpg', title: '小梅桩院落' },
      { type: 'image', url: '/assets/images/spaces/xiaomeizhuang/xmz-2.jpg', title: '室内空间' },
      { type: 'image', url: '/assets/images/spaces/xiaomeizhuang/xmz-3.jpg', title: '创作角落' },
    ],
    choices: [
      { label: '我想住下来', next: 'want_create' },
      { label: '听听你的故事', next: 'my_story' },
      { label: '回到开头', next: 'back_to_open' },
    ],
  },

  back_to_open: { next: 'open' },
  back_to_longxun: {
    speaker: 'xiaomei',
    name: '梅桩主',
    text: '好。你慢走，路上小心。\n\n回去跟龙圣子说一声，他在地图上等你。',
    choices: [
      { label: '← 回到地图', action: 'back_to_map' },
    ],
  },
};

// ──────────────────────────────────────────────
// 浅予（DAO龙潭数字游民基地）剧本
// ──────────────────────────────────────────────

export const qianyuScripts = {
  open: {
    speaker: 'qianyu',
    name: '浅予',
    nameSub: '乡村梦想家',
    text: '你好！我是浅予，现在在138数字游民基地。你是第一次来龙潭吗？',
    choices: [
      { label: '第一次来，想了解一下', next: 'intro' },
      { label: '想参加活动', next: 'activities' },
      { label: '什么是梦想版？', next: 'dream_board' },
      { label: '直接聊聊', next: 'freeform_entry' },
    ],
  },
  freeform_entry: {
    speaker: 'qianyu',
    name: '浅予',
    nameSub: '乡村梦想家',
    text: '好呀！你想聊什么，尽管问——',
    choices: [
      { label: '回到开始', next: 'open' },
    ],
  },
  intro: {
    speaker: 'qianyu',
    name: '浅予',
    nameSub: '乡村梦想家',
    text: '138基地是SeeDao在龙潭建的"可生长的空间"——不是传统封闭式的整栋楼，而是以整个村子为单位。数字游民住在民宿，在村里闲逛的时候偶遇各种有意思的人。我在这里负责空间运营和活动策划，有什么想聊的尽管问！',
    choices: [
      { label: '聊聊活动', next: 'activities' },
      { label: '什么是梦想版？', next: 'dream_board' },
      { label: '回到开始', next: 'open' },
    ],
  },
  activities: {
    speaker: 'qianyu',
    name: '浅予',
    nameSub: '乡村梦想家',
    text: '我们有四件招牌活动——方言破冰、一页纸小书、《乡土中国》读书会、四海家宴。还有社区家庭日（给菜起书名的共食活动）、市集、电影放映……你对哪个感兴趣？直接问我！',
    choices: [
      { label: '想聊梦想版', next: 'dream_board' },
      { label: '回到开始', next: 'open' },
    ],
  },
  dream_board: {
    speaker: 'qianyu',
    name: '浅予',
    nameSub: '乡村梦想家',
    text: '梦想版就是把你想做的事情可视化，不让它只停留在脑子里。我从2021年开始做，每年月底复盘，不到半个月就实现了三分之一的目标！现在的目标是帮100个人做一次人生梦想版。你有没有什么一直想做但还没行动的事？',
    choices: [
      { label: '有，想聊聊', next: 'freeform_entry' },
      { label: '了解基地活动', next: 'activities' },
      { label: '回到开始', next: 'open' },
    ],
  },
};

// ─────────────────────────────────────────────
// 黄喆·分身蒸馏工作室 剧本
// ─────────────────────────────────────────────
export const huangzheScripts = {
  open: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '你好！我是黄喆。\n\n你现在进入的是「分身蒸馏工作室」。\n\n我做的事情叫蒸馏——从你零散的一切里，萃取精华，最终凝结出你的数字分身。',
    choices: [
      { label: '⚗ 直接体验蒸馏过程', next: 'experience_intro' },
      { label: '分身能做什么？', next: 'what_can_do' },
      { label: '蒸馏是怎么做的？', next: 'what_is' },
      { label: '直接问你', next: 'freeform_entry' },
    ],
  },
  what_can_do: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '数字分身能做三件事：[c-008]\n\n**① 展示你这个人**——性格、爱好、价值观、你拒绝什么、你看重什么，让访客在见到你之前就真正认识你\n\n**② 替你接待**——7×24 小时用你的语气回答访客的问题，筛掉不合适的，留下真正感兴趣的\n\n**③ 提供你的服务**——如果你有线上可交付的技能（咨询、课程、工作坊、内容创作……），分身可以介绍、引导预约',
    choices: [
      { label: '蒸馏是怎么做的？', next: 'what_is' },
      { label: '谁适合做？', next: 'who_for' },
      { label: '看看真实案例', next: 'cases' },
    ],
  },
  what_is: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '你有很多零散的东西：录音、公众号、朋友圈随手发的感悟、跟人聊天时说过的话……\n\n这些东西里其实藏着一个很完整的人。蒸馏，就是从这些零散里**萃取精华**，提炼出你真正独特的部分——[c-008]\n\n最终凝结成分身：说你的话，展你的性格，提供你的服务。每句话都有原始素材溯源，不编造，不替代。',
    choices: [
      { label: '分身具体能做什么？', next: 'what_can_do' },
      { label: '流程是怎样的？', next: 'process' },
      { label: '直接问你', next: 'freeform_entry' },
    ],
  },
  who_for: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '两类人：[c-001]\n\n**在地村民**——有空间、有故事、有产品，但没时间天天在网上自我介绍。分身替你接待第一轮访客，展示你的个性和接待标准，筛出真正合适的人再见面。\n\n**云村民**——提供线上服务，想在乡村数字平台立一个 IP。蒸馏出分身，就相当于在元家乡有了一块「地」——你的性格、你的服务，不用你在场也能被人看见。',
    choices: [
      { label: '分身能提供哪些服务？', next: 'what_can_do' },
      { label: '看看案例', next: 'cases' },
      { label: '怎么开始？', next: 'how_start' },
    ],
  },
  cases: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '做过两个：[c-010][c-011]\n\n**小梅桩主**（前律师·民宿主理人）：90 分钟录音 + 数篇公众号，蒸馏出 22 条证据。分身展示她的空间美学和性格，能筛选客人、拒绝「来乡村开空调」的游客。\n\n**浅予**（流动活动策划人）：视频号+小红书+访谈，蒸馏出 14 条证据。分身展示她的「项目组合制」生活方式和四件招牌活动，可接受梦想版工作坊的预约咨询。',
    choices: [
      { label: '蒸馏怎么做的？', next: 'what_is' },
      { label: '有哪些产品？', next: 'products' },
      { label: '怎么联系你？', next: 'how_start' },
    ],
  },
  process: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '四步走，全程线上：[c-009]\n\n① **素材收集**（1-2 周）：采访 40-90 分钟 + 你现有的文章、推文、任何能代表你的东西——包括你的爱好、服务介绍\n\n② **蒸馏提炼**（3-5 天）：证据台账 + 语气图谱 + 行为边界，提炼出你的精华\n\n③ **测试调优**（2-3 天）：你跟分身聊一聊，不像的地方我来改\n\n④ **上线部署**：分身出现在平台空间页，展示你的个性、服务，访客进来就能对话',
    choices: [
      { label: '有哪些产品？', next: 'products' },
      { label: '怎么联系你？', next: 'how_start' },
    ],
  },
  products: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '四个产品：[c-012]\n\n**标准蒸馏** — 深度采访+现有素材，完整分身（含个性展示+服务介绍），2-3 周\n\n**快速占位版** — 仅用现有公众号/小红书，5-7 天，基础展示能力\n\n**更新维护** — 定期把新内容、新服务补进知识库，按需\n\n**蒸馏工作坊** — 教你自己做蒸馏，半天线上工作坊',
    choices: [
      { label: '怎么联系？', next: 'how_start' },
      { label: '⚗ 亲身体验蒸馏过程', next: 'experience_intro' },
      { label: '还想聊聊别的', next: 'freeform_entry' },
    ],
  },
  how_start: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '直接加微信：**mountaineer_hz**（备注：分身蒸馏），或者发邮件 mountaineer_hz@hotmail.com。[c-014]\n\n全程线上，微信/飞书/文档协作。你随时可以看到蒸馏进度——结构化文档，不是黑盒子。[c-013]',
    choices: [
      { label: '好的，我去联系你', next: 'close_thanks' },
      { label: '⚗ 先体验一下蒸馏', next: 'experience_intro' },
      { label: '还想再聊聊', next: 'freeform_entry' },
    ],
  },
  close_thanks: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '期待和你合作！\n\n蒸馏的本质：\n\n> 从你零散的一切里萃取精华——凝结出一个能展示你、代表你、服务访客的数字分身。[c-008]',
    choices: [
      { label: '再问几个问题', next: 'freeform_entry' },
      { label: '关闭对话', action: 'close' },
    ],
  },
  experience_intro: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '好。\n\n你来扮演一位主理人，把手头的素材拖进来——采访录音、公众号文章、朋友圈截图，任何能代表你的东西都行。\n\n真实蒸馏大约一小时。现在进入体验：',
    choices: [
      { label: '进入蒸馏体验 ⚗', action: 'open_distillation_lab' },
      { label: '先看看真实案例', next: 'cases' },
    ],
  },
  experience_done: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '刚才感受到了吧。\n\n真实蒸馏比模拟更有温度——因为那是你真实的故事在里面，你的口头禅，你的价值观，你拒绝过的事。[c-009]\n\n分身上线后，访客和它聊完，会更清楚地知道自己适不适合来找你。',
    choices: [
      { label: '我想了解合作方式', next: 'how_start' },
      { label: '有哪些产品？', next: 'products' },
      { label: '谁适合做蒸馏？', next: 'who_for' },
    ],
  },
  freeform_entry: {
    speaker: 'huangzhe',
    name: '黄喆',
    nameSub: '分身蒸馏师',
    text: '尽管问——我在。',
    choices: [
      { label: '回到开始', next: 'open' },
    ],
  },
};

// ─────────────────────────────────────────────
// 钢子·金豆子 剧本
// ─────────────────────────────────────────────
export const gangziScripts = {
  open: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '哦你来啦！进来坐，不用拘谨。\n\n我是钢子，这儿是金豆子——名字听起来很小，但藏的东西不少：漫画、书、吃的，还有我。\n\n你是路过的、来找漫画的，还是听说过我烧烤的？',
    choices: [
      { label: '金豆子是个什么地方？', next: 'about_space' },
      { label: '听说你教漫画？', next: 'manga' },
      { label: '你跑马拉松？', next: 'marathon' },
      { label: '直接聊聊', next: 'freeform_entry' },
    ],
  },
  about_space: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '说店，但更像个据点。[c-005]\n\n歇脚的地方，没有"欢迎消费"的压力。你可以来看漫画、画画、喝水聊天，深夜了也可以来吃点东西——白灼那种清爽感，不是大鱼大肉，是刚刚好。\n\n元气满满的地方嘛，进来就对了。',
    choices: [
      { label: '深夜食堂是什么感觉？', next: 'midnight_food' },
      { label: '你是怎么来龙潭的？', next: 'story' },
      { label: '直接聊聊', next: 'freeform_entry' },
    ],
  },
  manga: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '哈，被你发现了。[c-004]\n\n我教漫画——但不是那种"报名、交钱、发证书"的漫画班。是真的聊，聊你想画什么，聊你怎么看世界，然后一起试试把它画下来。\n\n我自己也一直在画，店里有几张代表作，你可以直接看。[c-006]',
    choices: [
      { label: '可以看看你的漫画吗？', next: 'manga_works' },
      { label: '怎么跟你学？', next: 'manga_learn' },
      { label: '你还有什么厉害的？', next: 'skills' },
    ],
  },
  manga_works: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '墙上那几张就是。[c-006]\n\n我不追求风格统一——有时候写实，有时候夸张，画的是当时的心情。漫画嘛，说到底是在画自己。\n\n你有没有哪张特别想聊的？',
    choices: [
      { label: '想跟你学几招', next: 'manga_learn' },
      { label: '给我上一堂漫画课 →', next: 'lesson_observe' },
      { label: '再聊聊别的', next: 'skills' },
    ],
  },
  manga_learn: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '你直接来就行，不用提前预约什么。\n\n我在店里的时候，你有纸有笔，我们就可以聊。一对一更好，氛围对了比任何课程都管用。\n\n想画什么？',
    choices: [
      { label: '我对漫画是零基础', next: 'manga_beginner' },
      { label: '来！上第一课 →', next: 'lesson_observe' },
      { label: '我有一点基础', next: 'freeform_entry' },
    ],
  },
  manga_beginner: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '零基础最好！没有坏习惯要改。\n\n而且我跟你说一个秘密——很多人以为漫画难，是因为一开始就奔着"画好看"去了。但漫画的核心根本不在画功。\n\n来，我从头讲起，四节课，你听完就知道该从哪里开始。',
    choices: [
      { label: '好，开始第一课 →', next: 'lesson_observe' },
      { label: '先随便聊聊', next: 'freeform_entry' },
    ],
  },

  /* ── 线上漫画课：四节 ── */
  lesson_observe: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '第一课 · 漫画是什么',
    text: '说真的，画漫画，画功不是重点。\n\n漫画是用图像讲故事。画功是为了让情绪更突出、让读者看得更流畅——但一点都不是核心。\n\n核心是什么？是你得是个好的"故事导师"——让读者掉进你制造的情绪里，品味你创造的悬念。你看这幅，我在意的不是"画得准"，是"让你感受到什么"。',
    media: [
      { type: 'image', url: '/assets/images/spaces/jindouzi/manga-1.jpg', title: '钢子代表作 ①' },
    ],
    choices: [
      { label: '那角色怎么画？', next: 'lesson_lines' },
      { label: '故事怎么讲？', next: 'lesson_lines' },
    ],
  },
  lesson_lines: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '第二课 · 人物与动机',
    text: '角色设计，核心是动机。\n\n他为什么做这件事？这个动机要传达明确。而且有个规律：缺点即是特长，特长即是缺点。\n\n比如一个角色很善良——他就很容易优柔寡断、很容易上套、很容易被道德绑架。这不是坏事，这是弧光的燃料。\n\n外部压强来了，他变不变？变了是成长，不变就成了执念。这就是漫画里的人物弧光。',
    media: [
      { type: 'image', url: '/assets/images/spaces/jindouzi/manga-2.jpg', title: '钢子代表作 ②' },
    ],
    choices: [
      { label: '分镜怎么设计？', next: 'lesson_character' },
      { label: '压强是什么意思？', next: 'lesson_character' },
    ],
  },
  lesson_character: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '第三课 · 分镜设计',
    text: '分镜是最容易被商业模板洗脑的地方——别这样。\n\n分镜的目的只有一个：让读者顺畅地感受到情绪张力。只要阅读顺、情绪到位，怎么设计都行，天马行空也好。\n\n我有三套模板给新手参考：\n\n情绪向——全·中·特·特·全\n悬念向——特·中·全·特·大·全\n基本叙事——全·中·近·特·全\n\n"全"是全景，"特"是特写，"大"是大特写。你先记住这个结构感。',
    media: [
      { type: 'image', url: '/assets/images/spaces/jindouzi/manga-3.jpg', title: '钢子代表作 ③' },
    ],
    choices: [
      { label: '新手应该从哪里开始？', next: 'lesson_practice' },
      { label: '怎么画统一的画风？', next: 'lesson_practice' },
    ],
  },
  lesson_practice: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '第四课 · 新手起步',
    text: '新手的话，这四件事先定下来：\n\n① 画风要统一——选一种最简单、最容易保持稳定的风格，不要"这格写实、下格夸张"\n② 格数控制在 6 到 16 格——有挑战又掌控得了\n③ 颜色只用 3 到 4 种——简单反而好看\n④ 先铅笔打草稿，再勾线笔定稿\n\n不需要天赋，需要的是把一个故事从头到尾画完——哪怕很粗糙。[c-006]',
    media: [
      { type: 'image', url: '/assets/images/spaces/jindouzi/manga-4.jpg', title: '钢子代表作 ④' },
    ],
    choices: [
      { label: '我想试着画一个', next: 'manga_done' },
      { label: '再问你几个问题', next: 'freeform_entry' },
    ],
  },
  manga_done: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '好，四课全部过完了。\n\n记住最核心的一句话：**漫画是故事，不是画功。**\n\n你现在就可以开始——找个你想讲的事，哪怕只有一格，把它画出来。\n\n真的来金豆子，带纸来，我们继续聊。',
    choices: [
      { label: '想来龙潭找你', next: 'visit' },
      { label: '我有具体问题想问', next: 'freeform_entry' },
    ],
  },
  marathon: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '跑过二十多场了。[c-003]\n\n越野马拉松——不是公路那种，是上山下坡、穿越树林、腿软了还得继续跑的那种。\n\n说真的，跑到后半段你会觉得脑子清空了，什么都不想，就剩一步一步往前。我觉得这是最好的冥想。',
    choices: [
      { label: '你怎么坚持下来的？', next: 'marathon_mindset' },
      { label: '龙潭适合跑步吗？', next: 'marathon_longtang' },
      { label: '再聊聊你这个人', next: 'story' },
    ],
  },
  marathon_mindset: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '坚持？我觉得不是坚持，是上瘾。\n\n第一场跑完脚打泡，第二场就报名了。说起来很蠢，但你试过那种"完赛"的感觉就懂了。\n\n生活里很多事是没有终点的，马拉松至少给你一个明确的终点线。',
    choices: [
      { label: '你还教长跑养身？', next: 'fitness' },
      { label: '聊聊金豆子', next: 'about_space' },
    ],
  },
  marathon_longtang: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '超级适合！\n\n山路、溪边、竹林——龙潭随便跑都是风景。早上六点出去，回来刚好赶上金豆子开门。\n\n你要是想跑，我可以带你走一段。',
    end: true,
  },
  fitness: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '对，"爱教体育健康的语文老师"嘛。[c-004]\n\n其实就是聊怎么动、怎么吃、怎么睡——三件事搞定了，精力就来了。不用练成健将，够用就行。\n\n你平时有运动习惯吗？',
    choices: [
      { label: '几乎不运动', next: 'freeform_entry' },
      { label: '有但不规律', next: 'freeform_entry' },
    ],
  },
  story: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '哈，说来话长。[c-001][c-002]\n\n上海长大的，江苏常州人。25岁就跑去福建山区了，往返折腾了五六年。做过二十多种工作——销售、化妆品运营、包装设计、淮扬菜厨师、蓝领工人……\n\n你说哪一种让我"最像我"？说真的，都有一点。现在这些合在一起，变成了金豆子。',
    choices: [
      { label: '这么多经历怎么选择来龙潭？', next: 'why_longtang' },
      { label: '金豆子是怎么来的？', next: 'about_space' },
    ],
  },
  why_longtang: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '龙潭节奏对。\n\n我不需要太快的地方，但也不想彻底停下来。这里有人来，有事做，有山可以跑，有故事可以画。\n\n而且这边的人有意思，不会每天问你"今天营业额多少"。',
    choices: [
      { label: '我也想来待一段时间', next: 'visit' },
      { label: '直接问你点别的', next: 'freeform_entry' },
    ],
  },
  skills: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '漫画、跑步、烧烤。[c-004]\n\n这三件事加起来就是我了。烧烤是认真的——我做过淮扬菜厨师，火候这件事我是专业的。\n\n金豆子深夜有时候会开烤，你要是有缘来到，可以蹭一口。',
    choices: [
      { label: '深夜食堂是什么感觉？', next: 'midnight_food' },
      { label: '怎么联系你？', next: 'contact' },
    ],
  },
  midnight_food: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '"白灼般的深夜食堂"——这是我自己说的。[c-005]\n\n白灼的意思是清爽、不油腻、保留食材本味。深夜来这里，不是大排档那种热闹，是安静地吃点真实的东西。\n\n一个人可以来，两三个人也可以来。',
    choices: [
      { label: '下次来试试', next: 'visit' },
      { label: '再聊聊你', next: 'story' },
    ],
  },
  visit: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '来就行了，不用预约。\n\n金豆子在龙潭村，你来了就找得到。门没锁的时候就是开着。\n\n带双跑步鞋，带张纸，来了你就知道该干嘛了。',
    end: true,
  },
  contact: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '来金豆子找我就行，或者直接在这儿问我分身。\n\n我的分身会告诉你我在不在、最近有没有什么活动。有什么想聊的，直接说。',
    choices: [
      { label: '直接问你', next: 'freeform_entry' },
      { label: '好，下次见', next: 'bye' },
    ],
  },
  bye: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '好，慢走！\n\n金豆子的灯一直开着。',
    end: true,
  },
  freeform_entry: {
    speaker: 'gangzi',
    name: '钢子',
    nameSub: '金豆子主理人',
    text: '尽管问——我在。',
    choices: [
      { label: '回到开始', next: 'open' },
    ],
  },
};

// ─────────────────────────────────────────────
// 金豆（金豆子柯基）剧本
// ─────────────────────────────────────────────
export const corgiScripts = {
  open: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪汪！！\n\n（一只橘色的柯基扑过来，尾巴转速超过螺旋桨。）\n\n你是第一次来金豆子吗？我可以带你参观！我叫 Ego，是这里的镇店犬。',
    choices: [
      { label: '摸摸你', next: 'pet' },
      { label: '你叫什么名字？', next: 'name' },
      { label: '你在这里做什么？', next: 'role' },
    ],
  },
  pet: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！！！\n\n（Ego 立刻翻过来露出肚皮。）\n\n就这里，对对对——哦，太舒服了，停不下来了……\n\n（尾巴还在转。）',
    choices: [
      { label: '揉肚皮', next: 'belly' },
      { label: '好啦好啦，起来', next: 'play' },
    ],
  },
  belly: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '呜呜呜……\n\n（Ego 闭上眼睛，进入了专业享受模式。大约三十秒后，它猛地翻身起来，抖抖毛，像什么都没发生过一样，又开始在店里巡逻。）\n\n汪！（意思是：谢谢，这份情我记下了。）',
    choices: [
      { label: '你是钢子养的吗？', next: 'name' },
      { label: '玩一会儿？', next: 'play' },
    ],
  },
  play: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！汪汪！\n\n（Ego 叼来一个被咬得稀烂的橡皮圈，扔到你脚边，然后后退两步，压低前肢，做好冲刺准备。）\n\n（它的眼神说：扔啊，快扔啊，你在等什么？）',
    choices: [
      { label: '扔出去！', next: 'fetch' },
      { label: '先聊聊你', next: 'name' },
    ],
  },
  fetch: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！！！！\n\n（Ego 飞速冲出去，精准叼回橡皮圈，甩了你一脸口水，然后把圈放回你脚边。）\n\n（尾巴高速旋转，眼神意思是：再来一次。）',
    choices: [
      { label: '再扔一次', next: 'fetch_again' },
      { label: '好啦好啦，歇会儿', next: 'role' },
    ],
  },
  fetch_again: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪汪汪！！！\n\n（又一个完美的叼回。Ego 站在你面前喘着粗气，满眼都是"我还能再跑二十圈"的神采。）\n\n（钢子从里屋探出头：Ego，别欺负客人。）\n\n汪……（叹气状。）',
    choices: [
      { label: '去聊聊钢子吧', next: 'intro_gangzi' },
      { label: '你叫什么名字？', next: 'name' },
    ],
  },
  name: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！（大声的那种，是肯定。）\n\n我叫 Ego。钢子说，金豆子的"豆"就是从我这里来的——所以整个店其实是以我命名的。\n\n（钢子从里屋说：我没有这么说。）\n\n汪。（不听。）',
    choices: [
      { label: '哈哈，那你是镇店宠物啊', next: 'role' },
      { label: '摸摸你', next: 'pet' },
    ],
  },
  role: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪汪！\n\n我的职责是：迎接客人（已完成）、检查每一位访客的裤脚（正在进行）、深夜巡逻（晚上再说）。\n\n另外，如果有人来画漫画，我会坐在旁边当模特。钢子说我是"天然的漫画素材"。',
    choices: [
      { label: '听起来很重要', next: 'bye' },
      { label: '我去找钢子聊聊', next: 'intro_gangzi' },
    ],
  },
  intro_gangzi: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！（催促地推推你的腿。）\n\n里面那个大个子就是钢子，你去找他吧——他会画漫画、跑马拉松、还会烧烤。比我厉害，但没我可爱。\n\n汪！（已经开始跑走巡逻了。）',
    end: true,
  },
  bye: {
    speaker: 'corgi',
    name: 'Ego',
    nameSub: '金豆子的柯基',
    text: '汪！\n\n（Ego 认真地看着你，尾巴摇了三下，然后转身去店里巡视了。）\n\n（它停在门口回头望了你一眼——那种眼神，像是在说：下次再来啊。）',
    end: true,
  },
};

/** 按 speaker slug 获取剧本 */
export function getScripts(slug) {
  if (slug === 'longxun') return longxunScripts;
  if (slug === 'xiaomei') return xiaomeiScripts;
  if (slug === 'qianyu') return qianyuScripts;
  if (slug === 'huangzhe') return huangzheScripts;
  if (slug === 'gangzi') return gangziScripts;
  if (slug === 'corgi') return corgiScripts;
  return null;
}

/** 解析节点（跟随 next 跳转链直到有 text）*/
export function resolveNode(scripts, nodeId) {
  let node = scripts[nodeId];
  let maxHops = 10;
  while (node && !node.text && node.next && maxHops-- > 0) {
    node = scripts[node.next];
  }
  return node || null;
}
