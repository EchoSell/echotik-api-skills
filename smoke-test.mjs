import { spawnSync } from "node:child_process";
import process from "node:process";

const checks = [
  ["node", ["./configure-echotik-auth.mjs", "--status"]],
  ["node", ["./verify-install.mjs"]]
];

let hasFailure = false;

const major = Number(process.versions.node.split(".")[0]);
if (Number.isNaN(major) || major < 18) {
  process.stderr.write(`Node.js >= 18 is required. Current version: ${process.versions.node}\n`);
  process.exit(1);
}

for (const [command, args] of checks) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  process.stdout.write(`$ ${command} ${args.join(" ")}\n`);
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exitCode = 1;
}
