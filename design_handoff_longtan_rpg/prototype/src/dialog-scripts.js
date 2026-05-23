/* ============================================================
   dialog-scripts.js — 对话剧本（树状）
   每个节点：{ id, speaker, name, sub, text, choices:[{label, next, hint, action}], end?, tag? }
   action 可触发场景跳转（如 enter_xiaomeizhuang）
   ============================================================ */

const longxunScripts = {
  /* 首次见面 */
  open: {
    id: "open",
    speaker: "longxun",
    name: "龙寻",
    sub: "村管家 · 龙潭村",
    text: "你来了。\n\n这条溪流过龙潭村已七百余年。你是来歇脚的，还是来寻什么的？",
    choices: [
      { label: "我想了解这个村", next: "history" },
      { label: "想找个有意思的主理人", next: "match_intro" },
      { label: "我就随便看看", next: "wander" },
    ],
  },

  /* —— 路线 A：村史 —— */
  history: {
    speaker: "longxun",
    name: "龙寻",
    sub: "村史叙述",
    text: "龙潭原是废村。\n2015 年林正禄带着画笔进村，从此画家、纪录片导演、做面包的、修古琴的，一拨拨来了。2022 年 138 数字游民基地启用，云上也住下了一些人。\n\n现在村里大约住着五六十位「新村民」，每一位都把自己的生活方式做成一个空间。",
    choices: [
      { label: "新村民和老村民相处吗？", next: "history_villagers" },
      { label: "什么样的人会留下来？", next: "history_stay" },
      { label: "我想去看看具体的空间", next: "match_intro" },
    ],
  },
  history_villagers: {
    speaker: "longxun",
    name: "龙寻",
    text: "处得很好。\n\n老村民教新村民认野菜、辨方言；新村民教老村民拍短视频、做线上分享。村小学的孩子下午会跑去小梅桩的院子里玩，桩主从不赶他们。\n\n这是龙潭最珍贵的事——人跟人，没有客气。",
    choices: [
      { label: "我想去小梅桩看看", next: "route_xiaomei" },
      { label: "再聊聊村里的人", next: "history_stay" },
    ],
  },
  history_stay: {
    speaker: "longxun",
    name: "龙寻",
    text: "留下来的人，都不是为「逃离都市」来的。\n\n他们是带着自己原本的手艺、原本的爱好来的——只是把它换了一个时区、一种节奏。\n\n小梅原是上海的律师。她说：「人生到某个节点，时间比金钱重要。」 [c-002]",
    choices: [
      { label: "她现在做什么？", next: "route_xiaomei" },
      { label: "我也想换种节奏", next: "match_intro" },
    ],
  },

  /* —— 路线 B：访客画像识别 —— */
  match_intro: {
    speaker: "longxun",
    name: "龙寻",
    sub: "为你匹配",
    text: "我不推销，只帮你匹配。\n\n你来龙潭，最想要的是什么？",
    choices: [
      { label: "安静的地方，做点自己的创作", next: "match_creator", hint: "创作者" },
      { label: "远程办公，住一两个月", next: "match_nomad", hint: "数字游民" },
      { label: "只想躲两天，喝茶发呆", next: "match_rest", hint: "短期休整" },
      { label: "想看看主理人怎么过日子", next: "match_curious", hint: "观察者" },
    ],
  },
  match_creator: {
    speaker: "longxun",
    name: "龙寻",
    sub: "路由建议",
    text: "那你大概率是奔着小梅桩去的。\n\n桩主自己也是创作者：画画、写歌、拍短片。她的院子里不开空调，不挂平台，只接「能懂这把椅子为什么放这个角落」的人。 [c-003]\n\n要不要去她门口看看？",
    choices: [
      { label: "好，带我去小梅桩", next: "route_xiaomei" },
      { label: "还有别的吗？", next: "match_more" },
    ],
  },
  match_nomad: {
    speaker: "longxun",
    name: "龙寻",
    sub: "路由建议",
    text: "138 数字游民基地。\n\n2022 年启用，独栋，有共享办公区、Wi-Fi、咖啡、健身房。住下来的人来自北上广深、巴厘岛、清迈——他们在这里组建临时同事。\n\n不过那栋楼今天我还带不了你进去；你可以先在地图上看看它。",
    choices: [
      { label: "好的，先聊别的", next: "match_more" },
      { label: "还是想看看小梅桩", next: "route_xiaomei" },
    ],
  },
  match_rest: {
    speaker: "longxun",
    name: "龙寻",
    text: "短期休整，我不太推荐你来龙潭。\n\n这里没有大堂、没有礼宾，主理人不会喊你「欢迎光临」。 但如果你愿意把「躲两天」改成「待两天看看一种生活」——小梅桩的茶会上周刚办过一次，下周还有。",
    choices: [
      { label: "那我看看小梅桩", next: "route_xiaomei" },
      { label: "再想想", next: "match_more" },
    ],
  },
  match_curious: {
    speaker: "longxun",
    name: "龙寻",
    text: "好奇心是好东西。\n\n龙潭村适合「带着问题来」的人。带着问题去找小梅，她会跟你聊为什么放弃律师；带着问题去 138 基地，听听一个数字游民怎么决定下个月去哪里。\n\n你想先见谁？",
    choices: [
      { label: "小梅桩主", next: "route_xiaomei" },
      { label: "暂时不想见人", next: "wander" },
    ],
  },
  match_more: {
    speaker: "longxun",
    name: "龙寻",
    text: "村里还在陆续新增空间。\n面包房、古琴坊、酒酿小铺、电子音乐工作室……\n\n这些今天我还没法带你进去。你先去小梅桩走一圈，回来我再为你画一张更详细的方案。",
    choices: [
      { label: "好，去小梅桩", next: "route_xiaomei" },
      { label: "先在地图上转转", next: "wander" },
    ],
  },

  /* 路由：进入小梅桩 */
  route_xiaomei: {
    speaker: "longxun",
    name: "龙寻",
    sub: "已为你引路",
    text: "顺着青石路往南，过廊桥，左边那座有花的院子就是小梅桩。\n\n敲门之前——记得不要说「我是来度假的」。她听到这话会皱眉。",
    choices: [
      { label: "好，去敲门 →", action: "enter_xiaomeizhuang" },
      { label: "我再想想", next: "wander" },
    ],
  },

  wander: {
    speaker: "longxun",
    name: "龙寻",
    text: "不急。\n\n地图上还有些点位你可以慢慢点——廊桥、田垄、竹林、远山。需要我时，点我头顶的「！」即可。",
    end: true,
  },
};

const xiaomeiScripts = {
  open: {
    speaker: "xiaomei",
    name: "小梅",
    sub: "小梅桩 · 主理人",
    text: "你怎么找到这儿来的？\n\n小梅桩不挂平台，不做短视频。能进这院子的，多半是有缘。",
    choices: [
      { label: "村管家龙寻让我来的", next: "from_longxun" },
      { label: "想找个地方住几天创作", next: "want_create" },
      { label: "只是看看，可以参观吗？", next: "just_look" },
    ],
  },
  from_longxun: {
    speaker: "xiaomei",
    name: "小梅",
    text: "哦，龙寻啊。\n\n那他大概跟你说了我之前是律师。是的，2017 年辞职，2018 年到屏南跟林正禄学画，2019 年正式搬来。 [c-002]\n\n来龙潭不是因为山水好——山好水好的地方哪儿都有。我是来找一群想独立、想创造的人。 [c-001]",
    choices: [
      { label: "你画画？我能看吗？", next: "see_paint" },
      { label: "你拍过电影？", next: "see_film" },
      { label: "可以住下来吗？", next: "want_create" },
    ],
  },
  want_create: {
    speaker: "小梅",
    speaker: "xiaomei",
    name: "小梅",
    text: "那要看你创作什么。\n\n我这儿四间客房，两间长租给数字游民——一位剪辑师，一位写论文的博士。剩下两间不挂平台。\n\n你做什么的？",
    choices: [
      { label: "我写东西（公众号/小说）", next: "writer_ok" },
      { label: "我拍片子/做视频", next: "video_ok" },
      { label: "我做产品/写代码", next: "code_ok" },
      { label: "我还在想转型", next: "transition" },
    ],
  },
  writer_ok: {
    speaker: "xiaomei",
    name: "小梅",
    text: "写东西的人住这儿很好。\n\n二楼东房有面窗对着我的花园，早上鸟叫，下午有一束光斜过来。我把那间留给愿意安静坐着的人。\n\n你能写几天？",
    choices: [
      { label: "大概一周", next: "stay_week" },
      { label: "想住一个月以上", next: "stay_long" },
    ],
  },
  video_ok: {
    speaker: "xiaomei",
    name: "小梅",
    text: "拍片可以，但请你别拍我。\n\n我自己拍过两部微电影——《我是谁》《我的水晶笔》。 [c-005] 不是不喜欢镜头，是不喜欢「来打卡的镜头」。\n\n如果你拍村子、拍村民、拍光影，我可以带你认识几位老人。",
    choices: [
      { label: "好，我尊重", next: "stay_week" },
      { label: "我再想想", next: "back_to_open" },
    ],
  },
  code_ok: {
    speaker: "xiaomei",
    name: "小梅",
    text: "做产品的，住下来挺好——但 138 数字游民基地更适合长期。那边有共享办公、靠谱的网。\n\n小梅桩适合你来一两个晚上，跟我喝茶聊聊「为什么要做这个产品」。",
    choices: [
      { label: "好，那我先来住两晚", next: "stay_week" },
      { label: "回去问问龙寻", next: "back_to_longxun" },
    ],
  },
  transition: {
    speaker: "xiaomei",
    name: "小梅",
    text: "想转型的人，我多聊几句。\n\n我也是这么过来的。律师做了十几年，专攻外商投资、收购兼并。 [c-002] 累，但不是因为忙——是因为做的事跟自己想成为的人，是两件事。\n\n你不用现在想清楚。先住下来一周，每天起来浇浇花，下午跟我喝茶。一周之后你想到什么再说。",
    choices: [
      { label: "听起来很好，我想试试", next: "stay_week" },
      { label: "我得先回去想想", next: "back_to_open" },
    ],
  },
  just_look: {
    speaker: "xiaomei",
    name: "小梅",
    text: "可以看。\n\n院子里的花是我种的，房间里的画是我画的，墙上挂的字是村里另一位写的。\n\n你慢慢看，看到喜欢的角落可以停下来——但请别拍我，可以拍花、拍光、拍门口的猫。",
    choices: [
      { label: "门口黑板上写的是什么？", next: "blackboard" },
      { label: "为什么不上携程？", next: "why_no_platform" },
    ],
  },
  see_paint: {
    speaker: "xiaomei",
    name: "小梅",
    text: "二楼走廊那张大的是去年的——一只鹿在月光下看一片湖。\n\n画画对我来说不是「作品」。是早上五点起来，等光斜过来的时候，挤一点颜料的事。 [c-006] 跟拍片、写歌、种花是一样的。",
    choices: [
      { label: "你也写歌？", next: "see_song" },
      { label: "回去想想要不要住", next: "back_to_open" },
    ],
  },
  see_film: {
    speaker: "xiaomei",
    name: "小梅",
    text: "拍过两部。\n\n《我是谁》是 2021 年拍的，2023 年才发出来。 [c-005] 拍完我自己看了好多遍——本来想讲一个有趣的故事，最后发现有趣的背后是心酸。\n\n《我的水晶笔》是给孩子拍的，关于失去和原谅。",
    choices: [
      { label: "可以在哪里看？", next: "where_film" },
      { label: "回去想想", next: "back_to_open" },
    ],
  },
  see_song: {
    speaker: "xiaomei",
    name: "小梅",
    text: "《风吹过的山坡上》。\n\n是 2022 年乡土建筑工匠的篝火晚会上首唱的。 [c-008] 不是为了「发歌」，是那个晚上想唱。\n\n去年 9 月在芳院村办了一场小型专场，叫「在水之洲」。 [c-007]",
    choices: [
      { label: "好酷。我想住下来", next: "want_create" },
      { label: "回去想想", next: "back_to_open" },
    ],
  },
  blackboard: {
    speaker: "xiaomei",
    name: "小梅",
    text: "My Home, My Life Style.\n\n小梅桩主要是我自己生活和工作的地方，民宿只是它对外开启的一个交流窗口。 [c-003]\n\n不是不欢迎你来——是希望你来的时候，记得这是别人的家。",
    choices: [
      { label: "我懂", next: "back_to_open" },
      { label: "再问一个", next: "why_no_platform" },
    ],
  },
  why_no_platform: {
    speaker: "xiaomei",
    name: "小梅",
    text: "携程上的客人，不是不好——是「我付了钱，你就该给我五星级服务」的逻辑，跟小梅桩不合。 [c-001]\n\n来这里的人，得允许房间偶尔有蜘蛛，得允许我下午不在前台。 能找上来的，都是有缘人。",
    choices: [
      { label: "我想成为有缘人", next: "want_create" },
      { label: "回去想想", next: "back_to_open" },
    ],
  },
  stay_week: {
    speaker: "xiaomei",
    name: "小梅",
    sub: "约一杯茶",
    text: "好，那你下周一来。\n\n我会给你留二楼东房。住的事我们不签合同，只约「住几天、付多少」。\n\n来的时候带一本你最近在读的书，茶我准备。",
    end: true,
  },
  stay_long: {
    speaker: "xiaomei",
    name: "小梅",
    sub: "长租候选",
    text: "长租得聊一次。\n\n你下周来住三天试试。如果三天后你还想留下，我们再谈。 我不会让你写商业方案——只问你三个问题。",
    choices: [
      { label: "哪三个问题？", next: "three_qs" },
      { label: "好，三天后见", end: true },
    ],
  },
  three_qs: {
    speaker: "xiaomei",
    name: "小梅",
    text: "一，你愿意早上六点起来浇一次花吗？\n二，村里小孩跑进来，你会赶他们走吗？\n三，如果断网三天，你能干嘛？\n\n不用现在答。你住三天就知道了。",
    end: true,
  },
  where_film: {
    speaker: "xiaomei",
    name: "小梅",
    text: "我的公众号「小梅桩」上能看到。\n\n或者你住下来的晚上，我可以投到墙上跟你一起看。",
    choices: [
      { label: "我想住下来看", next: "want_create" },
      { label: "回去想想", next: "back_to_open" },
    ],
  },
  back_to_open: { next: "open" },
  back_to_longxun: {
    speaker: "xiaomei",
    name: "小梅",
    text: "好。你慢走，路上小心。\n\n回去跟龙寻说一声，他在地图上等你。",
    choices: [
      { label: "← 回到地图", action: "back_to_map" },
    ],
  },
};

window.SCRIPTS = {
  longxun: longxunScripts,
  xiaomei: xiaomeiScripts,
};
