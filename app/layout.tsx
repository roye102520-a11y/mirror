import { CalmCornerWidget } from "@/components/CalmCornerWidget";
import { MirrorEmotionalShell } from "@/components/MirrorEmotionalShell";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { QuickAwarenessProvider } from "@/context/QuickAwarenessContext";
import { QuizProvider } from "@/context/QuizContext";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

/*
  运行说明（personality-60-scan）：
  npm install && npm run dev
  本仓库默认端口：3005。npm run dev 会先清空 .next 再启动 Turbopack，减少 Internal Server Error（Cannot find module ./xxx.js）。若你本机可稳定热更新、想跳过清理：npm run dev:watch。若必须用 webpack：npm run dev:webpack

  若整页白屏：
  1) 打开开发者工具 Console，看是否有红色报错。
  2) 删缓存重启：npm run dev（已自带 rm -rf .next），或手动 rm -rf .next 后再 dev:watch；硬刷新（Cmd+Shift+R）。
  3) 端口被占用时可：npx next dev -p 3010
  4) 若页面上只有 Internal Server Error，且终端里是 Cannot find module './xxx.js'：先停掉所有 next 进程，执行 npm run dev:clean（已默认 Turbopack）。若仍有 EMFILE: too many open files，先在终端执行 ulimit -n 10240，或关掉占用文件监视的其他 IDE/项目后再试。
  5) 极少数依赖需要 webpack dev 时用 npm run dev:webpack。若报错 MODULE_NOT_FOUND（.next/...）或 Cannot read '/_app'：勿混用 next build 与 next dev 的进程；清缓存后再只启动一种。

  未使用 next/font 拉取 Google 字体，避免弱网/离线时白屏或长时间无内容。
*/

export const metadata: Metadata = {
  title: "mirror",
  description:
    "A small reflection tool for moments when social relationships feel confusing.",
};

const foucFallback = `
(function(){
  var ms=5000;
  function unhide(){
    try{
      var nodes=document.querySelectorAll('style[data-next-hide-fouc]');
      nodes.forEach(function(n){n.parentNode&&n.parentNode.removeChild(n);});
      if(document.body)document.body.style.removeProperty('display');
    }catch(e){}
  }
  setTimeout(unhide,ms);
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className="min-h-screen font-serif antialiased"
        style={{
          fontFamily:
            'Georgia, "Songti SC", "PingFang SC", "Hiragino Mincho ProN", "Microsoft YaHei", serif',
        }}
        suppressHydrationWarning
      >
        <Script id="fouc-fallback" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: foucFallback }} />
        <RootErrorBoundary>
          <QuizProvider>
            <QuickAwarenessProvider>
              <MirrorEmotionalShell>
                <div className="mirror-app-shell flex min-h-screen flex-col overflow-visible">
                  <div className="mirror-app-main flex-1 overflow-visible">{children}</div>
                  <footer className="mt-auto border-t border-[var(--line)]/60 bg-[rgba(250,248,252,0.45)] px-5 py-6 pb-24 text-center backdrop-blur-[6px] sm:px-6 sm:py-8 sm:pb-28">
                    <p className="text-xs leading-relaxed text-[var(--muted)]">
                      有问题可以联系我：
                      <a
                        className="mirror-no-hover break-all text-[var(--ink)] underline underline-offset-4 hover:text-[var(--accent)]"
                        href="mailto:371243762@qq.com"
                      >
                        371243762@qq.com
                      </a>
                    </p>
                  </footer>
                </div>
                <CalmCornerWidget />
              </MirrorEmotionalShell>
            </QuickAwarenessProvider>
          </QuizProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
