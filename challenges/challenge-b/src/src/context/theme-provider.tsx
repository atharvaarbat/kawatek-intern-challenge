import { createContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing restrictions)
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore write failures
    }
  }, [theme]);

  // Always print in light mode and fix Recharts chart widths for the page.
  // beforeprint fires after Chrome has applied the print layout, so
  // element.clientWidth reflects the actual print column width at that point.
  // We write that width directly onto the Recharts wrapper div and SVG so the
  // chart renders at the correct size instead of the screen-measured px value.
  useEffect(() => {
    const root = document.documentElement;

    const before = () => {
      root.classList.remove("dark");

      document.querySelectorAll<HTMLElement>('[data-slot="chart"]').forEach((chart) => {
        const w = chart.clientWidth;
        if (!w) return;

        chart.querySelectorAll<HTMLElement>(".recharts-wrapper").forEach((wrapper) => {
          wrapper.dataset.printRestore = wrapper.style.width;
          wrapper.style.width = `${w}px`;
        });

        chart.querySelectorAll<HTMLElement>(".recharts-surface").forEach((svg) => {
          svg.dataset.printRestore = svg.getAttribute("width") ?? "";
          svg.setAttribute("width", String(w));
        });
      });
    };

    const after = () => {
      root.classList.toggle("dark", theme === "dark");

      document.querySelectorAll<HTMLElement>(".recharts-wrapper").forEach((wrapper) => {
        if (wrapper.dataset.printRestore !== undefined) {
          wrapper.style.width = wrapper.dataset.printRestore;
          delete wrapper.dataset.printRestore;
        }
      });

      document.querySelectorAll<HTMLElement>(".recharts-surface").forEach((svg) => {
        if (svg.dataset.printRestore !== undefined) {
          svg.setAttribute("width", svg.dataset.printRestore);
          delete svg.dataset.printRestore;
        }
      });
    };

    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
