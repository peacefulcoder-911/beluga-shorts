export interface LongformReaction {
  emoji: string;
  count: number;
}

export interface CutawayData {
  type: "youtube_channel" | "subscribe_button" | "image" | "bank_account" | "google_search";
  channelName?: string;
  subscriberCount?: string;
  avatarUrl?: string;
  bannerText?: string;
  imageUrl?: string;
  searchQuery?: string;
  balance?: string;
}

export interface LongformMessage {
  id: number;
  author: string;
  avatarUrl?: string;
  color?: string;
  time: string;
  content: string;
  mention?: string; // e.g. "@everyone", "@Beluga"
  cutaway?: CutawayData; // Full screen cutaway gag (YouTube channel, subscribe button, etc.)
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
