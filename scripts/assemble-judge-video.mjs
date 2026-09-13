import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const dir = "out/demo-video";
const timing = JSON.parse(await readFile(`${dir}/timing.json`, "utf8"));
if (timing.beats.length !== 9) throw new Error("Nine verified screen beats are required");
for (const beat of timing.beats) {
  if (Math.abs(beat.actualSeconds - beat.targetSeconds) > 0.25) {
    throw new Error(`Screen beat ${beat.beat} drifted from its narration by more than 250ms`);
  }
}

const names = ["01-hook", "02-receipt", "03-cpsc", "04-contract", "05-human", "06-sandbox", "07-outcome", "08-architecture", "09-safety"];
const totalSeconds = timing.audioSeconds.reduce((sum, value) => sum + value, 0) + timing.gapSeconds * 8;
const filters = [
  `[0:v]trim=start=${timing.trimStartSeconds}:duration=${totalSeconds},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1[v]`,
  ...names.map((_, index) => {
    const beatDuration = timing.audioSeconds[index] + (index < 8 ? timing.gapSeconds : 0);
    return `[${index + 1}:a]aresample=44100,asetpts=N/SR/TB,apad=pad_dur=${index < 8 ? timing.gapSeconds : 0},atrim=duration=${beatDuration},asetpts=N/SR/TB[a${index}]`;
  }),
  `${names.map((_, index) => `[a${index}]`).join("")}concat=n=9:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[voice]`,
].join(";");
const args = [
  "-hide_banner", "-loglevel", "warning", "-y", "-i", `${dir}/recallzero-paced.webm`,
  ...names.flatMap((name) => ["-i", `${dir}/${name}.mp3`]),
  "-filter_complex", filters,
  "-map", "[v]", "-map", "[voice]",
  "-t", totalSeconds.toFixed(3),
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart",
  "-metadata", "title=RecallZero — Agents for Humans demo",
  "-metadata", "comment=Real browser recording with scene-aligned ElevenLabs narration",
  `${dir}/RecallZero-Agents-for-Humans-Demo.mp4`,
];
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log(`Assembled ${totalSeconds.toFixed(2)}s narrated judge demo`);
