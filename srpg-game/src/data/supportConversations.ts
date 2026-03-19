import type { SupportConversation } from '../types/support';

/**
 * 支援会話データ
 * 各支援ランク到達時に表示される会話イベント
 */

// アラン（lord）とベラ（knight）の支援会話
const alanBellaConversations: SupportConversation[] = [
  // C会話
  {
    supportDefinitionId: 'alan-bella',
    rank: 'C',
    title: '出会い',
    lines: [
      { speakerId: 'lord', text: 'ベラ、君の剣の腕は見事だな。', emotion: 'normal' },
      { speakerId: 'knight', text: '……お褒めいただき光栄です、アラン様。', emotion: 'normal' },
      { speakerId: 'lord', text: 'そんなに堅苦しくしなくていい。戦場では対等な戦友だ。', emotion: 'happy' },
      { speakerId: 'knight', text: '……わかりました。ですが、私の使命はあなたをお守りすること。', emotion: 'normal' },
      { speakerId: 'knight', text: 'そのことだけは、どうか忘れないでください。', emotion: 'sad' },
    ],
  },
  // B会話
  {
    supportDefinitionId: 'alan-bella',
    rank: 'B',
    title: '信頼',
    lines: [
      { speakerId: 'lord', text: 'ベラ、前の戦闘で私を庇っただろう？', emotion: 'normal' },
      { speakerId: 'knight', text: '当然のことです。私の使命ですから。', emotion: 'normal' },
      { speakerId: 'lord', text: 'だが、君自身も危険だった。', emotion: 'sad' },
      { speakerId: 'knight', text: '……アラン様。', emotion: 'normal' },
      { speakerId: 'knight', text: '私の命は、あなたのものです。', emotion: 'normal' },
      { speakerId: 'knight', text: 'あなたが進むべき道を、私の剣で切り拓く。それが私の誇りです。', emotion: 'happy' },
      { speakerId: 'lord', text: '……わかった。だが約束してくれ。', emotion: 'normal' },
      { speakerId: 'lord', text: '君も必ず生きて帰ると。', emotion: 'sad' },
      { speakerId: 'knight', text: '……はい。必ず。', emotion: 'happy' },
    ],
  },
  // A会話
  {
    supportDefinitionId: 'alan-bella',
    rank: 'A',
    title: '誓い',
    lines: [
      { speakerId: 'lord', text: 'ベラ。この戦いが終わったら……', emotion: 'normal' },
      { speakerId: 'knight', text: 'アラン様？', emotion: 'normal' },
      { speakerId: 'lord', text: '君と二人で、平和な世界を歩きたい。', emotion: 'happy' },
      { speakerId: 'knight', text: '……！', emotion: 'surprised' },
      { speakerId: 'lord', text: '主従としてではなく、一人の人間として。', emotion: 'normal' },
      { speakerId: 'knight', text: 'アラン様……私は……', emotion: 'sad' },
      { speakerId: 'knight', text: 'あなたに仕えることが、私の生きる意味でした。', emotion: 'normal' },
      { speakerId: 'knight', text: 'でも、あなたのその言葉が……私の心を変えました。', emotion: 'happy' },
      { speakerId: 'lord', text: 'ベラ……', emotion: 'happy' },
      { speakerId: 'knight', text: 'はい。この戦いが終わったら、共に歩みましょう。', emotion: 'happy' },
      { speakerId: 'knight', text: '私の主君であり、私の……かけがえのない人。', emotion: 'happy' },
    ],
  },
];

// アラン（lord）と弓兵（archer）の支援会話
const alanArcherConversations: SupportConversation[] = [
  // C会話
  {
    supportDefinitionId: 'alan-archer',
    rank: 'C',
    title: '遠き矢',
    lines: [
      { speakerId: 'lord', text: '君の弓の腕前、感心したよ。', emotion: 'normal' },
      { speakerId: 'archer', text: 'ありがとうございます。故郷で狩りをしていた時に覚えたんです。', emotion: 'happy' },
      { speakerId: 'lord', text: '狩りか。質素だが厳しい修行になりそうだな。', emotion: 'normal' },
      { speakerId: 'archer', text: 'ええ、でもおかげで遠くからでも獲物を仕留められるように。', emotion: 'normal' },
      { speakerId: 'archer', text: 'この戦いでも、必ずやお役に立ちます。', emotion: 'happy' },
    ],
  },
  // B会話
  {
    supportDefinitionId: 'alan-archer',
    rank: 'B',
    title: '信頼の的',
    lines: [
      { speakerId: 'archer', text: 'アラン様、前線でのご無茶はおやめください。', emotion: 'sad' },
      { speakerId: 'lord', text: '先頭に立つのが指揮者の務めだ。', emotion: 'normal' },
      { speakerId: 'archer', text: 'でも、もしものことがあれば……', emotion: 'sad' },
      { speakerId: 'lord', text: '君がいるから大丈夫だ。後方から援護してくれ。', emotion: 'happy' },
      { speakerId: 'archer', text: '……わかりました。', emotion: 'normal' },
      { speakerId: 'archer', text: '私の矢で、あなたの背中を守り抜きます。', emotion: 'happy' },
    ],
  },
  // A会話
  {
    supportDefinitionId: 'alan-archer',
    rank: 'A',
    title: '永遠の誓い',
    lines: [
      { speakerId: 'lord', text: '君の矢には、何度も救われた。', emotion: 'normal' },
      { speakerId: 'archer', text: '私の矢が届く範囲なら、いつでも守ります。', emotion: 'happy' },
      { speakerId: 'lord', text: 'ありがとう。君とは長い付き合いになるな。', emotion: 'happy' },
      { speakerId: 'archer', text: 'ええ、この戦いが終わっても、あなたの傍にいさせてください。', emotion: 'normal' },
      { speakerId: 'lord', text: 'もちろんだ。これからも頼むぞ、親友よ。', emotion: 'happy' },
      { speakerId: 'archer', text: 'はい！ どこまでもついていきます！', emotion: 'happy' },
    ],
  },
];

// 全支援会話データ
export const SUPPORT_CONVERSATIONS: SupportConversation[] = [
  ...alanBellaConversations,
  ...alanArcherConversations,
];

/**
 * 支援定義IDとランクから会話を取得
 */
export function getSupportConversation(
  supportDefinitionId: string,
  rank: 'C' | 'B' | 'A'
): SupportConversation | undefined {
  return SUPPORT_CONVERSATIONS.find(
    c => c.supportDefinitionId === supportDefinitionId && c.rank === rank
  );
}
