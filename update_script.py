import re

content = """import { Composition, staticFile } from "remotion";
import { DiscordChat, MessageData } from "./DiscordChat";

const testScript: MessageData[] = [
"""

for i in range(1, 21):
    author = "Beluga" if i % 2 != 0 else "Hecker"
    avatar = "staticFile('beluga.jpg')" if i % 2 != 0 else "staticFile('hecker.jpg')"
    color = "#ed4245" if i % 2 != 0 else "#57f287"
    content += f"""  {{
    id: {i},
    author: "{author}",
    avatarUrl: {avatar},
    content: "This is test message number {i} to see how the chat scrolls up when there are many messages in the history.",
    time: "Today at 2:0{i%10} PM",
    color: "{color}"
  }},
"""
content += """];

export const MyComposition = () => {
  return (
    <Composition
      id="DiscordChat"
      component={DiscordChat}
      defaultProps={{
        script: testScript,
      }}
      durationInFrames={20 * 1.5 * 30 + 30} // 20 messages * 1.5s * 30fps + padding
      fps={30}
      width={720}
      height={1280}
    />
  );
};
"""

with open("src/Composition.tsx", "w") as f:
    f.write(content)

