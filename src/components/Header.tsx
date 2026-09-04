import { useState, useRef, useEffect } from "react";
import type { View, CategorySlug } from "../types";
import { CATEGORIES } from "../types";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 group">
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#00c8ff" strokeWidth="1.5" fill="none" opacity="0.6" />
          <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" fill="#00c8ff" opacity="0.15" />
          <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" stroke="#00c8ff" strokeWidth="1" fill="none" />
          <line x1="18" y1="2" x2="18" y2="8" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <line x1="34" y1="10" x2="28" y2="13" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <line x1="34" y1="26" x2="28" y2="23" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <line x1="18" y1="34" x2="18" y2="28" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <line x1="2" y1="26" x2="8" y2="23" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <line x1="2" y1="10" x2="8" y2="13" stroke="#00c8ff" strokeWidth="1" opacity="0.5" />
          <circle cx="18" cy="18" r="3" fill="#00c8ff" opacity="0.8" />
        </svg>
      </div>
      <div>
        <span className="font-display text-xl font-700 text-white leading-none tracking-widest group-hover:text-[#00c8ff] transition-colors">
          M's<span className="text-[#00c8ff] text-glow">3D</span>
        </span>
        <div className="text-[9px] font-mono-data text-[#5a7090] tracking-widest uppercase">Print Studio</div>
      </div>
    </button>
  );
}

interface HeaderProps {
  view: View;
  navigate: (v: View) => void;
  cartCount: number;
  onCartOpen: () => void;
}

export default function Header({ view, navigate, cartCount, onCartOpen }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isCatalogActive = view.page === "catalog" || view.page === "category" || view.page === "product";
  const isModelsActive = view.page === "models";
  const isCreatorActive = view.page === "creator" || view.page === "new-order" || view.page === "order-detail";
  const isAboutActive = view.page === "about";
  const isContactActive = view.page === "contact";

  const navBtn = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`font-display font-600 text-sm tracking-widest uppercase px-4 py-2 rounded transition-all duration-200 ${
        active
          ? "text-[#00c8ff] bg-[rgba(0,200,255,0.08)] border border-[rgba(0,200,255,0.2)]"
          : "text-[#5a7090] hover:text-[#a0b0c8] border border-transparent"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(0,200,255,0.1)] bg-[#080b0f]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo onClick={() => navigate({ page: "catalog" })} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Catálogo with dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={`font-display font-600 text-sm tracking-widest uppercase px-4 py-2 rounded transition-all duration-200 flex items-center gap-1.5 ${
                isCatalogActive
                  ? "text-[#00c8ff] bg-[rgba(0,200,255,0.08)] border border-[rgba(0,200,255,0.2)]"
                  : "text-[#5a7090] hover:text-[#a0b0c8] border border-transparent"
              }`}
            >
              Catálogo
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f1520] border border-[rgba(0,200,255,0.15)] rounded shadow-xl shadow-black/50 overflow-hidden z-50">
                <div className="p-2 border-b border-[rgba(0,200,255,0.08)]">
                  <button
                    onClick={() => { navigate({ page: "catalog" }); setDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded font-display font-600 text-xs tracking-widest uppercase text-[#5a7090] hover:text-[#00c8ff] hover:bg-[rgba(0,200,255,0.06)] transition-colors"
                  >
                    ▶ Ver todo el catálogo
                  </button>
                </div>
                <div className="p-2 space-y-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => { navigate({ page: "category", slug: cat.slug as CategorySlug }); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 rounded flex items-center gap-3 hover:bg-[rgba(0,200,255,0.04)] transition-colors group"
                    >
                      <span className="text-lg w-6 text-center">{cat.icon}</span>
                      <div>
                        <div className="font-display font-600 text-sm text-[#d4dce8] group-hover:text-white transition-colors">{cat.label}</div>
                        <div className="font-mono-data text-[9px] text-[#5a7090] tracking-wide">{cat.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {navBtn(isModelsActive, "Modelos STL", () => navigate({ page: "models" }))}
          {navBtn(isCreatorActive, "Panel Creador", () => navigate({ page: "creator" }))}
          {navBtn(isAboutActive, "Nosotros", () => navigate({ page: "about" }))}
          {navBtn(isContactActive, "Contacto", () => navigate({ page: "contact" }))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 px-3 py-2 rounded border border-[rgba(0,200,255,0.2)] hover:border-[rgba(0,200,255,0.5)] transition-all duration-200 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c8ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline font-mono-data text-xs text-[#00c8ff] group-hover:text-white transition-colors">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ff6b2b] text-white text-[10px] font-700 flex items-center justify-center font-display">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#5a7090] hover:text-[#00c8ff] transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(0,200,255,0.1)] bg-[#0f1520] px-4 py-3 flex flex-col gap-1">
          <button
            onClick={() => { setMobileCatOpen((o) => !o); }}
            className="flex items-center justify-between font-display font-600 text-sm tracking-widest uppercase px-4 py-3 rounded text-[#5a7090] hover:text-[#00c8ff] transition-colors"
          >
            Catálogo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${mobileCatOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {mobileCatOpen && (
            <div className="ml-4 space-y-0.5 mb-1">
              <button onClick={() => { navigate({ page: "catalog" }); setMobileOpen(false); }} className="w-full text-left px-3 py-2 font-mono-data text-xs text-[#5a7090] hover:text-[#00c8ff] transition-colors">
                ▶ Ver todo
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { navigate({ page: "category", slug: cat.slug as CategorySlug }); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 font-display text-sm text-[#a0b0c8] hover:text-white transition-colors"
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          )}
          {[
            { label: "Modelos STL", v: { page: "models" } as View },
            { label: "Panel Creador", v: { page: "creator" } as View },
            { label: "Nosotros", v: { page: "about" } as View },
            { label: "Contacto", v: { page: "contact" } as View },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.v); setMobileOpen(false); }}
              className="font-display font-600 text-sm tracking-widest uppercase px-4 py-3 rounded text-left text-[#5a7090] hover:text-[#00c8ff] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
