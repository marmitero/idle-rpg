import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import { installGlobalHooks } from "./diag";
import "./ui/global.css";

/** Boundary de dev: qualquer crash de render vira texto legível em tela. */
class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            margin: 24,
            padding: 16,
            background: "#3a0d0d",
            color: "#ffc9c9",
            border: "1px solid #a33",
            borderRadius: 8,
            font: "12px/1.5 monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <h2 style={{ margin: "0 0 8px" }}>Relicwake travou ao renderizar</h2>
          {String(this.state.error.message)}
          {"\n"}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

installGlobalHooks();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </StrictMode>,
);
