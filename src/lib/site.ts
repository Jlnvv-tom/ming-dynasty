/** 站点与作者信息（集中配置，便于后续增删渠道） */

export interface QrChannel {
  id: string;
  /** 渠道名 */
  label: string;
  /** 扫码说明 */
  hint: string;
  /** 补充提示（如时效性说明） */
  note?: string;
  /** public 下的路径 */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AuthorInfo {
  name: string;
  tagline: string;
  intro: string;
  channels: QrChannel[];
}

export const AUTHOR: AuthorInfo = {
  name: '怕浪猫',
  tagline: '本项目的整理者与维护者',
  intro:
    '一位对明代典章制度与世系谱牒感兴趣的整理者。若你在查阅过程中发现异文或错漏，欢迎通过公众号、视频号留言，或加入学习交流群一起讨论。',
  channels: [
    {
      id: 'mp',
      label: '微信公众号',
      hint: '扫码关注公众号，查看帝系与官制的长图整理',
      src: '/author/wechat-mp.jpeg',
      alt: '怕浪猫的微信公众号二维码',
      width: 430,
      height: 430,
    },
    {
      id: 'channels',
      label: '微信视频号',
      hint: '扫一扫二维码，关注我的视频号「怕浪猫」',
      src: '/author/wechat-channels.jpg',
      alt: '怕浪猫的微信视频号二维码',
      width: 830,
      height: 1080,
    },
    {
      id: 'group',
      label: '学习交流群',
      hint: '扫码加入「怕浪猫学习成长交流群」，一起聊明代史与史料整理',
      note: '群二维码 7 天内有效，失效请通过公众号或视频号留言，我重新发码',
      src: '/author/wechat-group.jpg',
      alt: '怕浪猫学习成长交流群的微信群二维码',
      width: 768,
      height: 1080,
    },
  ],
};
