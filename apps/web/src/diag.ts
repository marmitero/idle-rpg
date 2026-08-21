/** Diag remoto de dev: banner visível + log no servidor (apenas dev). */

let banner: HTMLDivElement | null = null;

function show(msg: string) {
  banner ??= document.createElement("div");
  banner.style.cssText =
    "position:fixed;left:8px;right:8px;top:8px;z-index:99999;background:#3a0d0d;color:#ffc9c9;" +
    "border:1px solid #a33;border-radius:6px;padding:8px 10px;font:12px/1.4 monospace;" +
    "white-space:pre-wrap;max-height:40vh;overflow:auto";
  banner.textContent = msg;
  if (!banner.parentNode) document.body.appendChild(banner);
}

/** Progresso/estado → console do navegador + log da API (dev). */
export function report(msg: string) {
  console.log("[diag]", msg);
  try {
    void fetch("/api/diag", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ msg }),
    }).catch(() => {});
  } catch {
    /* offline */
  }
}

/** Erro → banner visível + console + log da API. */
export function reportError(tag: string, e: unknown) {
  const detail = e instanceof Error ? `${e.message}\n${(e.stack ?? "").split("\n").slice(0, 6).join("\n")}` : String(e);
  const msg = `${tag}: ${detail}`;
  console.error("[diag]", msg);
  show(msg);
  report(msg);
}

export function installGlobalHooks() {
  window.addEventListener("error", (ev) => reportError("window.onerror", ev.error ?? ev.message));
  window.addEventListener("unhandledrejection", (ev) => reportError("unhandledrejection", ev.reason));
}
