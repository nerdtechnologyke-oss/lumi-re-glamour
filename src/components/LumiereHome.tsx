import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";

/* ============== Hooks ============== */

function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useCountUp(target: number, trigger: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration]);
  return val;
}

/* ============== Custom Cursor ============== */

function CustomCursor() {
  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    let x = 0, y = 0, tx = 0, ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.25;
      y += (ty - y) * 0.25;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, input, textarea, select, [data-cursor='hover']")) {
        dot.classList.add("hover");
      } else {
        dot.classList.remove("hover");
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      dot.remove();
    };
  }, []);
  return null;
}

/* ============== Magnetic Button ============== */

function Magnetic({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 80) {
        el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
      } else {
        el.style.transform = "";
      }
    };
    const onLeave = () => { el.style.transform = ""; };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <button ref={ref} className={className} style={{ transition: "transform 0.3s ease" }} {...props}>
      {children}
    </button>
  );
}

/* ============== Tilt Card ============== */

function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
    };
    const onLeave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <div ref={ref} className={className} style={{ transition: "transform 0.4s ease", transformStyle: "preserve-3d", ...style }}>
      {children}
    </div>
  );
}

/* ============== Components ============== */

function Nav({ onMenuToggle, menuOpen }: { onMenuToggle: () => void; menuOpen: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "Services", "Gallery", "Book", "Contact"];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(12, 11, 14, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,168,83,0.15)" : "1px solid transparent",
        padding: "clamp(0.9rem, 2vw, 1.4rem) clamp(1.2rem, 4vw, 3rem)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#home" className="block leading-none">
          <div style={{
            fontFamily: "var(--font-display)",
            color: "#D4A853",
            letterSpacing: "0.2em",
            fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
            fontWeight: 500,
          }}>
            LUMIÈRE
          </div>
          <div style={{
            fontFamily: "var(--font-label)",
            color: "#9B8FA0",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginTop: 2,
          }}>nail studio</div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="nav-link"
              style={{
                fontFamily: "var(--font-label)",
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#FAF3EC",
                transition: "letter-spacing 0.3s ease, color 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.letterSpacing = "0.3em"; e.currentTarget.style.color = "#D4A853"; }}
              onMouseLeave={(e) => { e.currentTarget.style.letterSpacing = "0.18em"; e.currentTarget.style.color = "#FAF3EC"; }}
            >{l}</a>
          ))}
        </div>

        <a href="#book" className="hidden md:inline-flex items-center justify-center transition-all duration-300"
          style={{
            border: "1px solid #C97B8A",
            color: "#C97B8A",
            padding: "0.65rem 1.4rem",
            borderRadius: 999,
            fontFamily: "var(--font-label)",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            minHeight: 44,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#C97B8A"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#C97B8A"; }}
        >Book Now</a>

        <button
          onClick={onMenuToggle}
          aria-label="Menu"
          className="md:hidden relative w-11 h-11 flex flex-col justify-center items-center gap-1.5"
        >
          <span style={{
            width: 24, height: 1.5, background: "#D4A853",
            transition: "transform 0.3s ease",
            transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
          }}/>
          <span style={{
            width: 24, height: 1.5, background: "#D4A853",
            transition: "transform 0.3s ease",
            transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
          }}/>
        </button>
      </div>
    </nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = ["Home", "Services", "Gallery", "Book", "Contact"];
  return (
    <div
      className="fixed inset-0 z-40 md:hidden transition-all duration-500"
      style={{
        background: "#0C0B0E",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-8">
        {links.map((l, i) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={onClose}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 8vw, 3rem)",
              color: "#D4A853",
              opacity: open ? 1 : 0,
              transform: open ? "translateX(0)" : "translateX(40px)",
              transition: `all 0.5s ease ${i * 80}ms`,
            }}
          >{l}</a>
        ))}
        <div className="flex gap-6 mt-8" style={{ opacity: open ? 1 : 0, transition: "opacity 0.6s ease 600ms" }}>
          {socialIcons.map((s) => (
            <a key={s.name} href="#" aria-label={s.name} style={{ color: "#D4A853" }}>{s.svg}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const words = ["Where", "Brown", "Skin", "Meets", "Brilliant", "Art."];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phrases = ["🤍 100% Vegan Products", "✨ Nail Art Specialists", "🖤 Made for Melanin"];
  useEffect(() => {
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % phrases.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0C0B0E" }}>
      {/* dot grid bg */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle, #1E1C22 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}/>
      {/* gold glow */}
      <div className="absolute pointer-events-none" style={{
        bottom: "-15%", right: "-10%", width: 600, height: 600,
        background: "radial-gradient(circle, rgba(212,168,83,0.18), transparent 70%)",
        filter: "blur(40px)",
      }}/>

      <div className="relative w-full grid md:grid-cols-[40fr_60fr] gap-0 items-stretch min-h-screen pt-24 md:pt-0">
        <div className="flex flex-col justify-center" style={{ padding: "clamp(1.5rem, 4vw, 4rem)" }}>
          <div className="page-load" style={{
            fontFamily: "var(--font-label)",
            color: "#D4A853",
            fontSize: "0.72rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}>Premium Nail Studio · Est. 2018</div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 6.2vw, 5.5rem)",
            lineHeight: 1.02,
            color: "#FAF3EC",
            fontWeight: 400,
            marginBottom: "1.8rem",
          }}>
            {words.map((w, i) => {
              const isGold = w === "Brown" || w === "Art.";
              return (
                <span key={i}
                  style={{
                    display: "inline-block",
                    marginRight: "0.3em",
                    color: isGold ? "#D4A853" : undefined,
                    fontStyle: isGold ? "italic" : undefined,
                    opacity: 0,
                    animation: `pageLoad 0.8s ease-out ${i * 150}ms forwards`,
                  }}
                >
                  {w}
                  {(i === 1 || i === 3) && <br/>}
                </span>
              );
            })}
          </h1>

          <p className="page-load" style={{
            color: "#9B8FA0", fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
            maxWidth: 460, lineHeight: 1.6, marginBottom: "2rem",
            animationDelay: "1s", animationFillMode: "both",
          }}>
            Expert nail artistry crafted for melanin-rich skin tones. Your nails. Your story. Our obsession.
          </p>

          <div className="flex flex-wrap gap-3 mb-8 page-load" style={{ animationDelay: "1.2s", animationFillMode: "both" }}>
            <a href="#book">
              <Magnetic className="inline-flex items-center gap-2" style={{
                background: "#25D366", color: "#0C0B0E",
                padding: "0.95rem 1.7rem", borderRadius: 999,
                fontFamily: "var(--font-label)", fontSize: "0.78rem",
                letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
                minHeight: 48, border: "none", cursor: "none",
              }}>Book via WhatsApp →</Magnetic>
            </a>
            <a href="#gallery">
              <Magnetic className="inline-flex items-center gap-2" style={{
                background: "transparent", color: "#D4A853",
                border: "1px solid #D4A853",
                padding: "0.95rem 1.7rem", borderRadius: 999,
                fontFamily: "var(--font-label)", fontSize: "0.78rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                minHeight: 48, cursor: "none",
              }}>See Our Work</Magnetic>
            </a>
          </div>

          <div className="page-load" style={{
            height: 32, overflow: "hidden", position: "relative",
            animationDelay: "1.4s", animationFillMode: "both",
          }}>
            {phrases.map((p, i) => (
              <div key={i} style={{
                position: "absolute", inset: 0,
                color: "#FAF3EC", fontFamily: "var(--font-label)",
                fontSize: "0.85rem", letterSpacing: "0.12em",
                transform: phraseIdx === i ? "rotateX(0deg)" : "rotateX(90deg)",
                opacity: phraseIdx === i ? 1 : 0,
                transition: "all 0.6s ease",
              }}>{p}</div>
            ))}
          </div>
        </div>

        <div className="relative h-[55vh] md:h-screen overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&q=85&auto=format&fit=crop"
            alt="Luxury nail artistry on melanin-rich skin"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to right, #0C0B0E 0%, transparent 25%)",
          }}/>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const row1 = "✦ GEL NAILS  ✦ NAIL ART  ✦ ACRYLICS  ✦ PEDICURES  ✦ MANICURES  ✦ CHROME POWDER  ✦ NAIL EXTENSIONS  ✦ PARAFFIN SPA";
  const row2 = "✦ NAIL REPAIR  ✦ PRESS-ON NAILS  ✦ FRENCH TIP  ✦ OMBRE NAILS  ✦ 3D ART  ✦ CUTICLE CARE  ✦ GEL REMOVAL  ✦ SPA PEDICURE";
  const itemStyle: CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    letterSpacing: "0.18em",
    fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
    color: "#0C0B0E",
    textTransform: "uppercase",
  };
  return (
    <div style={{ background: "#D4A853", padding: "clamp(0.9rem, 1.5vw, 1.2rem) 0", borderTop: "1px solid #0C0B0E", borderBottom: "1px solid #0C0B0E" }}>
      <div className="marquee" style={{ marginBottom: "0.6rem" }}>
        <div className="marquee-track" style={itemStyle}>{row1} {row1}</div>
        <div className="marquee-track" style={itemStyle} aria-hidden>{row1} {row1}</div>
      </div>
      <div className="marquee">
        <div className="marquee-track right" style={itemStyle}>{row2} {row2}</div>
        <div className="marquee-track right" style={itemStyle} aria-hidden>{row2} {row2}</div>
      </div>
    </div>
  );
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [trigger, setTrigger] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setTrigger(true); obs.disconnect(); } });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const v = useCountUp(target, trigger);
  return (
    <div ref={ref} style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
      color: "#D4A853", lineHeight: 1, fontWeight: 500,
    }}>{v.toLocaleString()}{suffix}</div>
  );
}

function About() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="about" style={{ background: "#FAF3EC", color: "#1E1C22", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)" }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div ref={ref} className="fade-up">
          <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>Our Story</div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
            lineHeight: 1.1, color: "#1E1C22", marginBottom: "1.5rem",
          }}>Black-Owned. African-Inspired. <span style={{ color: "#C97B8A", fontStyle: "italic" }}>Excellence-Driven.</span></h2>
          <p style={{ color: "#4a4550", lineHeight: 1.7, marginBottom: "1rem", fontSize: "1.02rem" }}>
            Born from a love of nails, melanin, and Nairobi's restless creativity, LUMIÈRE was founded to give African beauty the canvas it deserves. Every set we paint is a love letter to the women who walk through our doors.
          </p>
          <p style={{ color: "#4a4550", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1.02rem" }}>
            We work with vegan, cruelty-free formulas selected to flatter brown skin. We obsess over the colour theory, the curve of every almond tip, the way gold catches against your skin in the right light.
          </p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {[{n:3200,s:"+",l:"Clients"},{n:150,s:"+",l:"Designs"},{n:6,s:"",l:"Years"}].map((x) => (
              <div key={x.l}>
                <Counter target={x.n} suffix={x.s} />
                <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 6 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <a href="#gallery" style={{
            color: "#1E1C22", fontFamily: "var(--font-label)", fontSize: "0.8rem",
            letterSpacing: "0.18em", textTransform: "uppercase", borderBottom: "1px solid #D4A853", paddingBottom: 4,
          }}>Read Our Story →</a>
        </div>

        <div className="relative fade-right" ref={useReveal<HTMLDivElement>()}>
          <img
            src="https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=700&q=85&auto=format&fit=crop"
            alt="LUMIÈRE client smiling"
            className="w-full h-auto"
            loading="lazy"
            style={{ borderRadius: "24px 0 24px 0", display: "block" }}
          />
          <img
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=85&auto=format&fit=crop"
            alt="Nail close-up"
            loading="lazy"
            style={{
              position: "absolute", left: "-2rem", bottom: "-3rem",
              width: "45%", borderRadius: "16px",
              border: "3px solid #D4A853",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

const services = [
  { n: "01", icon: "✦", name: "Classic Manicure", desc: "Precision shaping, cuticle care, and a polish finish made to last.", price: "From KES 600" },
  { n: "02", icon: "✧", name: "Gel Nails", desc: "Long-wear gel in over 80 shades curated for melanin-rich tones.", price: "From KES 1,200" },
  { n: "03", icon: "❖", name: "Acrylic Extensions", desc: "Custom-sculpted length and shape — almond, coffin, stiletto.", price: "From KES 2,000" },
  { n: "04", icon: "✦", name: "Nail Art & Design", desc: "Bespoke artwork from hand-painted florals to chrome geometry.", price: "From KES 300 add-on" },
  { n: "05", icon: "✧", name: "Spa Pedicure", desc: "Warm soak, exfoliation, paraffin treatment, finish of your choice.", price: "From KES 1,000" },
  { n: "06", icon: "❖", name: "Chrome & Ombre", desc: "Mirror chrome, ombre fades, and 3D art for the bold.", price: "From KES 1,800" },
];

function Services() {
  return (
    <section id="services" style={{ background: "#0C0B0E", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-up" ref={useReveal<HTMLDivElement>()}>
          <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>What We Do</div>
          <h2 className="gold-shimmer" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 500, lineHeight: 1, letterSpacing: "0.05em",
          }}>THE MENU</h2>
        </div>

        <div ref={useReveal<HTMLDivElement>()} className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <TiltCard key={s.n}
              className="relative group"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(212,168,83,0.3)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                padding: "clamp(1.6rem, 2.5vw, 2.2rem)",
                transition: "border 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease",
              }}
              data-cursor="hover"
            >
              <div style={{
                position: "absolute", top: "1.2rem", right: "1.4rem",
                color: "#D4A853", fontFamily: "var(--font-display)",
                fontSize: "1.1rem", letterSpacing: "0.1em", opacity: 0.7,
              }}>{s.n}</div>
              <div style={{ fontSize: "2.2rem", color: "#D4A853", marginBottom: "1rem" }}>{s.icon}</div>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.3rem, 1.8vw, 1.6rem)",
                color: "#FAF3EC", marginBottom: "0.7rem",
              }}>{s.name}</h3>
              <p style={{ color: "#9B8FA0", lineHeight: 1.6, fontSize: "0.95rem", marginBottom: "1.4rem" }}>{s.desc}</p>
              <div style={{
                color: "#D4A853", fontFamily: "var(--font-label)",
                fontSize: "0.78rem", letterSpacing: "0.14em", marginBottom: "1rem",
              }}>{s.price}</div>
              <a href="#book" style={{
                color: "#FAF3EC", fontFamily: "var(--font-label)",
                fontSize: "0.72rem", letterSpacing: "0.18em",
                textTransform: "uppercase",
                borderBottom: "1px solid #D4A853", paddingBottom: 3,
              }}>Book This →</a>
            </TiltCard>
          ))}
        </div>
      </div>
      <style>{`
        #services [data-cursor="hover"]:hover {
          border-color: rgba(212,168,83,0.7) !important;
          box-shadow: 0 20px 60px -10px rgba(212,168,83,0.25), inset 0 0 40px rgba(212,168,83,0.05) !important;
        }
      `}</style>
    </section>
  );
}

const galleryImgs = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=85",
  "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=85",
  "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=85",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=85",
  "https://images.unsplash.com/photo-1614091066964-3793a073fd71?w=600&q=85",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=700&q=85",
  "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=85",
  "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=700&q=85",
];

function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(() => setLightbox((i) => (i === null ? null : (i + 1) % galleryImgs.length)), []);
  const prev = useCallback(() => setLightbox((i) => (i === null ? null : (i - 1 + galleryImgs.length) % galleryImgs.length)), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, next, prev]);

  return (
    <section id="gallery" style={{ background: "#FAF3EC", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 fade-up" ref={useReveal<HTMLDivElement>()}>
          <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>The Portfolio</div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            color: "#1E1C22", lineHeight: 1, fontStyle: "italic",
          }}>The Art</h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: "1rem" }}>
          {galleryImgs.map((src, i) => (
            <TiltCard key={i}
              className="relative mb-4 group cursor-pointer overflow-hidden"
              style={{ borderRadius: 12, breakInside: "avoid" }}
            >
              <button
                onClick={() => setLightbox(i)}
                aria-label={`View image ${i + 1}`}
                className="relative block w-full"
                style={{ background: "#1E1C22", border: "none", padding: 0 }}
                data-cursor="hover"
              >
                <img src={src} alt="" loading="lazy"
                  className="w-full h-auto block transition-transform duration-700"
                  style={{
                    aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5",
                    objectFit: "cover",
                  }}
                  onLoad={(e) => (e.currentTarget.parentElement!.classList.remove("img-shimmer"))}
                />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                  style={{
                    background: "rgba(12, 11, 14, 0.5)",
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <span style={{
                    color: "#D4A853", fontFamily: "var(--font-label)",
                    letterSpacing: "0.3em", fontSize: "0.85rem",
                  }}>✦ VIEW</span>
                </div>
              </button>
            </TiltCard>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(12,11,14,0.95)", backdropFilter: "blur(8px)" }}
          onClick={close}
        >
          <button onClick={close} aria-label="Close" className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center"
            style={{ background: "transparent", border: "1px solid #D4A853", borderRadius: "50%", color: "#D4A853", fontSize: "1.4rem" }}>×</button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center"
            style={{ background: "transparent", border: "1px solid #D4A853", borderRadius: "50%", color: "#D4A853" }}>←</button>
          <img src={galleryImgs[lightbox]} alt="" className="max-h-[85vh] max-w-[85vw] object-contain"
            onClick={(e) => e.stopPropagation()} style={{ borderRadius: 8 }}/>
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center"
            style={{ background: "transparent", border: "1px solid #D4A853", borderRadius: "50%", color: "#D4A853" }}>→</button>
        </div>
      )}
    </section>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [trig, setTrig] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setTrig(true); obs.disconnect(); } }), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const val = useCountUp(percent, trig);
  const r = 70, c = 2 * Math.PI * r;
  const offset = c - (val / 100) * c;
  return (
    <div className="relative flex items-center justify-center">
      <svg ref={ref} width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={r} fill="none" stroke="#1E1C22" strokeWidth={10}/>
        <circle cx={90} cy={90} r={r} fill="none" stroke="#D4A853" strokeWidth={10}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 90 90)" style={{ transition: "stroke-dashoffset 1.4s ease-out" }}/>
      </svg>
      <div className="absolute" style={{
        fontFamily: "var(--font-display)", color: "#D4A853",
        fontSize: "clamp(2rem, 3vw, 2.6rem)",
      }}>{val}%</div>
    </div>
  );
}

function BarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [trig, setTrig] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setTrig(true); obs.disconnect(); } }), { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  const bars = [
    { l: "Gel", v: 68 }, { l: "Acrylic", v: 52 }, { l: "Art", v: 47 }, { l: "Pedi", v: 39 },
  ];
  return (
    <div ref={ref} className="flex items-end justify-around gap-3 h-[180px] w-full px-4">
      {bars.map((b, i) => (
        <div key={b.l} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
          <div style={{ color: "#D4A853", fontSize: "0.8rem", fontFamily: "var(--font-label)" }}>{b.v}%</div>
          <div style={{
            width: "100%", maxWidth: 36,
            height: trig ? `${b.v * 1.6}px` : "0px",
            background: "linear-gradient(to top, #D4A853, #FFE4A1)",
            borderRadius: "6px 6px 0 0",
            transition: `height 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 100}ms`,
          }}/>
          <div style={{ color: "#9B8FA0", fontSize: "0.7rem", fontFamily: "var(--font-label)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{b.l}</div>
        </div>
      ))}
    </div>
  );
}

function Donut() {
  const r = 60;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={170} height={170} viewBox="0 0 170 170">
        <circle cx={85} cy={85} r={r} fill="none" stroke="#C97B8A" strokeWidth={14} strokeDasharray={c} strokeLinecap="round"/>
        <circle cx={85} cy={85} r={r - 22} fill="none" stroke="#D4A853" strokeWidth={10} strokeLinecap="round"/>
        <text x={85} y={92} textAnchor="middle" fill="#FAF3EC" style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>100%</text>
      </svg>
      <div style={{ color: "#9B8FA0", fontSize: "0.8rem", textAlign: "center", maxWidth: 200, lineHeight: 1.4 }}>
        Every product is vegan-certified and cruelty-free.
      </div>
    </div>
  );
}

function IconGrid() {
  const icons = ["💅","✂","✦","♥","💅","✂","✦","♥","💅","✂","✦","♥"];
  const ref = useRef<HTMLDivElement>(null);
  const [trig, setTrig] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setTrig(true); obs.disconnect(); } }), { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="grid grid-cols-3 gap-3">
        {icons.map((ic, i) => (
          <div key={i} style={{
            width: 48, height: 48, borderRadius: 10,
            border: "1px solid rgba(212,168,83,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#D4A853", fontSize: "1.2rem",
            transform: trig ? "scale(1)" : "scale(0)",
            opacity: trig ? 1 : 0,
            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`,
          }}>{ic}</div>
        ))}
      </div>
      <div style={{ color: "#9B8FA0", fontSize: "0.8rem", textAlign: "center", maxWidth: 180 }}>
        Services we offer every single day.
      </div>
    </div>
  );
}

function Numbers() {
  return (
    <section style={{
      background: "linear-gradient(180deg, #0C0B0E, #1E1222)",
      padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)",
    }}>
      <div className="max-w-6xl mx-auto">
        <h2 ref={useReveal<HTMLHeadingElement>()} className="fade-up text-center" style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4.5vw, 3.6rem)",
          color: "#FAF3EC", marginBottom: "4rem", lineHeight: 1.15,
        }}>
          Crafted With <span style={{ color: "#C97B8A", fontStyle: "italic" }}>Love.</span><br/>
          Backed By <span style={{ color: "#D4A853", fontStyle: "italic" }}>Numbers.</span>
        </h2>

        <div ref={useReveal<HTMLDivElement>()} className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Returning Clients", el: <ProgressRing percent={89} /> },
            { title: "Top Services", el: <BarChart /> },
            { title: "Vegan & Safe", el: <Donut /> },
            { title: "Daily Care", el: <IconGrid /> },
          ].map((p) => (
            <div key={p.title} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(212,168,83,0.2)",
              borderRadius: 20, padding: "2rem 1rem",
              minHeight: 320,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "1rem",
            }}>
              <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>{p.title}</div>
              {p.el}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const services_list = ["Classic Manicure", "Gel Nails", "Acrylic Extensions", "Nail Art", "Spa Pedicure", "Chrome/Ombre", "Other"];

function Booking() {
  const [form, setForm] = useState({ name: "", phone: "", service: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: false }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["name", "phone", "service", "date", "time"];
    const newErr: Record<string, boolean> = {};
    required.forEach((k) => { if (!form[k as keyof typeof form]) newErr[k] = true; });
    if (Object.keys(newErr).length) {
      setErrors(newErr);
      setTimeout(() => setErrors({}), 600);
      return;
    }
    const msg = `Hi LUMIÈRE! 💅 I'd like to book an appointment.
👤 Name: ${form.name}
📱 Phone: ${form.phone}
💅 Service: ${form.service}
📅 Date: ${form.date}
⏰ Time: ${form.time}
✨ Notes: ${form.notes || "—"}`;
    window.open(`https://wa.me/254700000000?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section id="book" style={{ background: "#FAF3EC", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 fade-up" ref={useReveal<HTMLDivElement>()}>
          <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>Reservations</div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            color: "#1E1C22", lineHeight: 1.1,
          }}>Book Your <span style={{ fontStyle: "italic", color: "#D4A853" }}>Appointment</span></h2>
          <p style={{ color: "#5a525e", marginTop: "1rem" }}>Fill in your details — we'll open WhatsApp ready for you.</p>
        </div>

        <form onSubmit={submit} ref={useReveal<HTMLFormElement>()} className="scale-in" style={{
          background: "#fff",
          borderTop: "3px solid #D4A853",
          borderRadius: 24,
          padding: "clamp(1.8rem, 4vw, 3rem)",
          boxShadow: "0 30px 80px -20px rgba(28,27,34,0.15)",
        }}>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { k: "name", label: "Your Name", type: "text" },
              { k: "phone", label: "Phone Number", type: "tel" },
            ].map((f) => (
              <div key={f.k} className={`float-field ${errors[f.k] ? "shake" : ""}`}>
                <input type={f.type} id={f.k} placeholder=" " value={form[f.k as keyof typeof form]} onChange={handle(f.k)} />
                <label htmlFor={f.k}>{f.label}</label>
                {errors[f.k] && <div style={{ color: "#c92929", fontSize: "0.7rem", marginTop: 4 }}>* required</div>}
              </div>
            ))}

            <div className={`float-field ${errors.service ? "shake" : ""}`}>
              <select id="service" value={form.service} onChange={handle("service")} className={form.service ? "has-value" : ""}>
                <option value=""></option>
                {services_list.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <label htmlFor="service">Service</label>
              {errors.service && <div style={{ color: "#c92929", fontSize: "0.7rem", marginTop: 4 }}>* required</div>}
            </div>

            <div className={`float-field ${errors.date ? "shake" : ""}`}>
              <input type="date" id="date" min={today} value={form.date} onChange={handle("date")} placeholder=" "/>
              <label htmlFor="date">Date</label>
              {errors.date && <div style={{ color: "#c92929", fontSize: "0.7rem", marginTop: 4 }}>* required</div>}
            </div>

            <div className={`float-field sm:col-span-2 ${errors.time ? "shake" : ""}`}>
              <input type="time" id="time" value={form.time} onChange={handle("time")} placeholder=" "/>
              <label htmlFor="time">Time</label>
              {errors.time && <div style={{ color: "#c92929", fontSize: "0.7rem", marginTop: 4 }}>* required</div>}
            </div>

            <div className="float-field sm:col-span-2">
              <textarea id="notes" placeholder=" " value={form.notes} onChange={handle("notes")} rows={3}/>
              <label htmlFor="notes">Inspiration / Notes</label>
            </div>
          </div>

          <button type="submit" className="relative pulse-ring mt-8 w-full" style={{
            background: "#25D366", color: "#fff",
            padding: "1.1rem", borderRadius: 999, border: "none",
            fontFamily: "var(--font-label)", fontSize: "0.85rem",
            letterSpacing: "0.16em", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem",
            cursor: "none", fontWeight: 600,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.1-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
            </svg>
            Send My Booking via WhatsApp
          </button>
          <p style={{ textAlign: "center", color: "#7a7280", fontSize: "0.78rem", marginTop: "1rem" }}>
            🔒 Your info is sent directly to us. No data stored.
          </p>
        </form>
      </div>
    </section>
  );
}

const testimonials = [
  { q: "I've never had a salon get my undertone right until LUMIÈRE. The chrome on brown skin? Unreal.", n: "Wanjiku M.", l: "Westlands, Nairobi" },
  { q: "WhatsApp booking made it effortless. Walked in, walked out a queen. The art is genuinely Vogue-worthy.", n: "Aisha K.", l: "Karen, Nairobi" },
  { q: "They treat brown skin like the canvas it is. I've never felt more seen at a nail bar.", n: "Zawadi O.", l: "Kilimani, Nairobi" },
  { q: "Six visits in. Every single set has been better than the last. The detail work is obsessive — in the best way.", n: "Njeri W.", l: "Lavington, Nairobi" },
  { q: "Bridal nails that made my entire wedding party gasp. Worth every shilling.", n: "Amina H.", l: "Runda, Nairobi" },
];

function Testimonials() {
  const [i, setI] = useState(0);
  const startX = useRef(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const d = e.changedTouches[0].clientX - startX.current;
    if (d < -50) setI((x) => (x + 1) % testimonials.length);
    if (d > 50) setI((x) => (x - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section style={{ background: "#0C0B0E", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)", overflow: "hidden" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-up" ref={useReveal<HTMLDivElement>()}>
          <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>Testimonials</div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            color: "#D4A853", lineHeight: 1.1,
          }}>What Our <span style={{ fontStyle: "italic" }}>Queens</span> Say</h2>
        </div>

        <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              position: idx === i ? "relative" : "absolute",
              inset: idx === i ? "auto" : 0,
              opacity: idx === i ? 1 : 0,
              transform: idx === i ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(212,168,83,0.3)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              padding: "clamp(2rem, 4vw, 3.5rem)",
              textAlign: "center",
              pointerEvents: idx === i ? "auto" : "none",
            }}>
              <div className="flex justify-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <svg key={k} width="20" height="20" viewBox="0 0 24 24" fill="#D4A853"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontStyle: "italic",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                color: "#FAF3EC", lineHeight: 1.5, marginBottom: "1.5rem",
              }}>"{t.q}"</p>
              <div style={{ color: "#D4A853", fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>{t.n}</div>
              <div style={{ color: "#C97B8A", fontFamily: "var(--font-label)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4 }}>{t.l}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`}
              style={{
                width: idx === i ? 28 : 8, height: 8, borderRadius: 999,
                background: idx === i ? "#D4A853" : "rgba(212,168,83,0.3)",
                border: "none", transition: "all 0.4s ease", cursor: "none",
              }}/>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hours() {
  const days = [
    { d: "Monday", h: "9:00 AM – 7:00 PM", i: 1 },
    { d: "Tuesday", h: "9:00 AM – 7:00 PM", i: 2 },
    { d: "Wednesday", h: "9:00 AM – 7:00 PM", i: 3 },
    { d: "Thursday", h: "9:00 AM – 7:00 PM", i: 4 },
    { d: "Friday", h: "9:00 AM – 7:00 PM", i: 5 },
    { d: "Saturday", h: "8:00 AM – 6:00 PM", i: 6 },
    { d: "Sunday", h: "10:00 AM – 3:00 PM", i: 0 },
  ];
  const today = new Date().getDay();
  return (
    <section id="contact" style={{ background: "#FAF3EC", color: "#1E1C22", padding: "clamp(4rem, 9vw, 8rem) clamp(1.2rem, 4vw, 3rem)" }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div ref={useReveal<HTMLDivElement>()} className="fade-left">
          <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>When We're Open</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "1.5rem" }}>Opening Hours</h3>
          <div>
            {days.map((d) => {
              const isToday = d.i === today;
              return (
                <div key={d.d} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.95rem 1rem",
                  borderBottom: "1px solid rgba(201,123,138,0.25)",
                  borderLeft: isToday ? "3px solid #D4A853" : "3px solid transparent",
                  background: isToday ? "rgba(212,168,83,0.08)" : "transparent",
                }}>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: isToday ? 600 : 400 }}>{d.d}</span>
                  <span style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
                    <span style={{ color: "#5a525e" }}>{d.h}</span>
                    {isToday && <span style={{
                      background: "#D4A853", color: "#0C0B0E",
                      padding: "0.2rem 0.6rem", borderRadius: 999,
                      fontSize: "0.65rem", fontFamily: "var(--font-label)",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>Open Now ✦</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div ref={useReveal<HTMLDivElement>()} className="fade-right">
          <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.32em", marginBottom: "1rem", textTransform: "uppercase" }}>Visit · Call · Write</div>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: "1.5rem" }}>Find Us</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", color: "#1E1C22", fontSize: "1.05rem" }}>
            <div>📍 Kimathi Street, Nairobi CBD, Kenya</div>
            <div>📞 +254 700 000 000</div>
            <div>📧 hello@lumierenails.co.ke</div>
          </div>
          <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer" className="block">
            <Magnetic className="w-full" style={{
              background: "#25D366", color: "#fff",
              padding: "1.1rem", borderRadius: 999, border: "none",
              fontFamily: "var(--font-label)", fontSize: "0.82rem",
              letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
              cursor: "none",
            }}>Chat on WhatsApp →</Magnetic>
          </a>
          <div className="flex gap-4 mt-6">
            {socialIcons.map((s) => (
              <a key={s.name} href="#" aria-label={s.name}
                style={{ color: "#D4A853", transition: "all 0.3s ease", display: "inline-flex" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; e.currentTarget.style.color = "#FFE4A1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.color = "#D4A853"; }}
              >{s.svg}</a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const socialIcons = [
  { name: "Instagram", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg> },
  { name: "TikTok", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 6.5a5.5 5.5 0 0 1-3.5-1.3v8.6a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V2h2.5A4 4 0 0 0 19.5 6V6.5z"/></svg> },
  { name: "Facebook", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V9a1 1 0 0 1 1-1z"/></svg> },
  { name: "Pinterest", svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.8l1.3-5.5s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-1 3.8-.3 1.1.6 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 1.9.8 2.5l.1.4-.4 1.6c-.1.3-.2.4-.5.2-1.4-.7-2.3-2.7-2.3-4.3 0-3.5 2.5-6.7 7.3-6.7 3.8 0 6.8 2.7 6.8 6.4 0 3.8-2.4 6.9-5.7 6.9-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.3 1-.9 2.2-1.4 3A10 10 0 1 0 12 2z"/></svg> },
];

function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <footer style={{
      background: "#0C0B0E",
      borderTop: "2px solid #D4A853",
      padding: "clamp(3rem, 6vw, 5rem) clamp(1.2rem, 4vw, 3rem) 2rem",
    }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#D4A853", letterSpacing: "0.2em" }}>LUMIÈRE</div>
          <div style={{ color: "#9B8FA0", fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>Every nail tells a story.</div>
          <div className="flex gap-3">
            {socialIcons.map((s) => (
              <a key={s.name} href="#" aria-label={s.name}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "1px solid #D4A853", color: "#D4A853",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#D4A853"; e.currentTarget.style.color = "#0C0B0E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#D4A853"; }}
              >{s.svg}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "1rem" }}>Explore</div>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {["Home", "Services", "Gallery", "Book", "Contact"].map((l) => (
              <li key={l}><a href={`#${l.toLowerCase()}`} style={{ color: "#FAF3EC", fontSize: "0.95rem" }}>{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <div style={{ color: "#D4A853", fontFamily: "var(--font-label)", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "1rem" }}>Newsletter</div>
          <p style={{ color: "#9B8FA0", fontSize: "0.85rem", marginBottom: "1rem" }}>Get nail inspo & promos in your inbox.</p>
          {submitted ? (
            <div style={{ color: "#D4A853", fontFamily: "var(--font-display)", fontSize: "1.2rem", animation: "pageLoad 0.5s ease both" }}>✦ You're in, queen!</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }} className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                style={{
                  flex: 1, background: "#1E1C22", border: "1px solid rgba(212,168,83,0.3)",
                  color: "#FAF3EC", padding: "0.7rem 1rem", borderRadius: 999, outline: "none",
                  fontSize: "0.85rem",
                }}/>
              <button type="submit" style={{
                background: "#D4A853", color: "#0C0B0E", border: "none",
                padding: "0.7rem 1.3rem", borderRadius: 999,
                fontFamily: "var(--font-label)", fontSize: "0.75rem",
                letterSpacing: "0.16em", fontWeight: 600, cursor: "none",
              }}>JOIN</button>
            </form>
          )}
        </div>
      </div>

      <div style={{
        marginTop: "3rem", paddingTop: "1.5rem",
        borderTop: "1px solid rgba(212,168,83,0.15)",
        textAlign: "center",
        color: "#5a525e", fontSize: "0.78rem",
      }}>
        © 2025 LUMIÈRE Nail Studio · All Rights Reserved · Nairobi, Kenya
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a href="https://wa.me/254700000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"
      className="fixed pulse-ring"
      style={{
        bottom: 24, right: 24, zIndex: 60,
        width: 64, height: 64, borderRadius: "50%",
        background: "#25D366", border: "2px solid #D4A853",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", boxShadow: "0 10px 30px rgba(37,211,102,0.4)",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(10deg) scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.1-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
      </svg>
    </a>
  );
}

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed"
      style={{
        bottom: 100, right: 30, zIndex: 60,
        width: 44, height: 44, borderRadius: "50%",
        background: "#0C0B0E", border: "1px solid #D4A853",
        color: "#D4A853", cursor: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>↑</button>
  );
}

/* ============== Page ============== */

export default function Home() {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const id = "google-fonts-lumiere";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Serif+Display:ital@0;1&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div className="page-load">
      <CustomCursor />
      <Nav menuOpen={menu} onMenuToggle={() => setMenu((m) => !m)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Gallery />
      <Numbers />
      <Booking />
      <Testimonials />
      <Hours />
      <Footer />
      <FloatingWhatsApp />
      <ScrollTop />
    </div>
  );
}
