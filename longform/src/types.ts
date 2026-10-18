export interface LongformReaction {
  emoji: string;
  count: number;
}

export interface LongformMessage {
  id: number;
  author: string;
  avatarUrl?: string;
  color?: string;
  time: string;
  content: string;
  attachmentUrl?: string;
  attachmentCaption?: string;
  reactions?: LongformReaction[];
  voiceEvent?: "call_ringing" | "user_joined" | "user_left" | "call_ended";
  startFrame?: number;
  durationInFrames?: number;
}

export interface LongformScene {
  sceneId: number;
  channelName: string;
  channelType: "text" | "voice" | "dm";
  channelCategory?: string;
  topic?: string;
  voiceMembers?: string[];
  speakingMember?: string;
  messages: LongformMessage[];
}

export interface LongformScriptData {
  title: string;
  description: string;
  tags?: string[];
  scenes: LongformScene[];
}
