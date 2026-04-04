/**
 * 在 postinstall 时检查本机是否能解析 @next/swc-*（避免 npm 扁平化/omit optional 导致 dev 报错 MODULE_NOT_FOUND）。
 * 失败时只打印警告，不中断安装。
 */
import { createRequire } from "module";
import { platform, arch } from "process";

const require = createRequire(import.meta.url);

const triple =
  platform === "darwin" && arch === "arm64"
    ? "darwin-arm64"
    : platform === "darwin" && arch === "x64"
      ? "darwin-x64"
      : platform === "linux" && arch === "arm64"
        ? "linux-arm64-gnu"
        : platform === "linux" && arch === "x64"
          ? "linux-x64-gnu"
          : platform === "win32" && arch === "arm64"
            ? "win32-arm64-msvc"
            : platform === "win32" && arch === "x64"
              ? "win32-x64-msvc"
              : null;

if (!triple) {
  process.exit(0);
}

const pkg = `@next/swc-${triple}`;
try {
  require.resolve(`${pkg}/package.json`);
} catch {
  console.warn(
    `\n[personality-60-scan] 未检测到 ${pkg}。若 \`next dev\` 出现 MODULE_NOT_FOUND（SWC），请在本目录执行：\n  npm install ${pkg}@15.5.14 --save-optional\n并确保未使用 npm 的 --omit=optional。\n若已安装仍报错，可尝试改用 Node 20/22 LTS（nvm use 22）。\n`
  );
}
