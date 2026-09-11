import { execFileSync } from "node:child_process";

const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
  encoding: "utf8",
}).split(/\r?\n/).filter(Boolean);

const forbidden = [
  /(?:^|[^A-Za-z])sk-[A-Za-z0-9/+_-]{20,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /(?:AWS_SECRET_ACCESS_KEY|AGENTROUTER_API_KEY)\s*=\s*[^\s]+/g,
];

const fs = await import("node:fs");
const findings = [];
for (const file of tracked) {
  if (!fs.statSync(file).isFile()) continue;
  const contents = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(contents)) findings.push(`${file}: ${pattern}`);
    pattern.lastIndex = 0;
  }
}

if (findings.length) {
  console.error("Potential secrets found:\n" + findings.join("\n"));
  process.exit(1);
}
console.log(`Secret scan passed across ${tracked.length} project files.`);
