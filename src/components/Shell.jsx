import { useState, useEffect, useCallback } from "react";
import { SiGithub, SiDiscord, SiLetterboxd } from "react-icons/si";
import { MdEmail } from "react-icons/md";

// https://react-icons.github.io/react-icons
const ICONS = {
  github: SiGithub,
  letterboxd: SiLetterboxd,
  discord: SiDiscord,

  email: MdEmail,
};

const getIcon = (id) => ICONS[id] ?? null;

const PROFILE = {
  user: "kubis",
  host: "web",
  bio: "[ bio missing ]",
};

const K_ASCII = [
  "",
  "",
  "    ██╗  ██╗     ",
  "    ██║ ██╔╝     ",
  "    █████╔╝      ",
  "    ██╔═██╗      ",
  "    ██║  ██╗     ",
  "    ╚═╝  ╚═╝     ",
];

function useTypewriter(text, speed = 28, start = true) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!start) return;
    setOut("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return [out, done];
}

const Prompt = ({ children, dim }) => (
  <span style={{ opacity: dim ? 0.7 : 1 }}>
    <span style={{ color: "var(--accent)" }}>➜</span>{" "}
    <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>~/kubis</span>{" "}
    {children}
  </span>
);

const Cursor = ({ steady }) => (
  <span
    className={steady ? "" : "blink"}
    style={{
      display: "inline-block",
      width: "0.55em",
      height: "1em",
      background: "currentColor",
      verticalAlign: "-0.15em",
      marginLeft: 2,
    }}
  />
);

const InfoRow = ({ k, v }) => (
  <div style={{ display: "flex", gap: 6, minWidth: 0 }}>
    <span
      style={{
        color: "var(--accent)",
        fontWeight: 700,
        flex: "0 0 auto",
        minWidth: 56,
      }}
    >
      {k}
    </span>
    <span
      style={{
        color: "var(--text)",
        opacity: 0.95,
        flex: 1,
        minWidth: 0,
        wordBreak: "break-word",
      }}
    >
      {v}
    </span>
  </div>
);

function AsciiPortrait() {
  return (
    <pre
      style={{
        margin: 0,
        fontSize: 12,
        lineHeight: 1.05,
        color: "var(--accent)",
        fontFamily: "inherit",
        whiteSpace: "pre",
        textShadow:
          "0 0 8px color-mix(in oklab, var(--accent) 40%, transparent)",
      }}
    >
      {K_ASCII.join("\n")}
    </pre>
  );
}

function PaletteRow() {
  const ramp = Array.from({ length: 8 }).map((_, i) => {
    const t = (i + 1) * 12;
    return `color-mix(in oklab, var(--accent) ${t}%, var(--bg-window))`;
  });
  return (
    <div
      style={{
        display: "flex",
        height: 10,
        border: "1px solid var(--border)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {ramp.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

function LinkRow({ link, selected, onSelect, onOpen, index }) {
  const Icon = getIcon(link.id);
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener"
      onClick={() => onOpen(index)}
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        padding: "4px 8px",
        textDecoration: "none",
        color: "inherit",
        background: selected
          ? "color-mix(in oklab, var(--accent) 18%, transparent)"
          : "transparent",
        borderLeft: `2px solid ${selected ? "var(--accent)" : "transparent"}`,
        outline: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 80ms",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            color: "var(--accent)",
            fontWeight: 700,
            width: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected ? "▶" : Icon ? <Icon size={11} /> : "·"}
        </span>
        <span>{link.label}</span>
      </span>
      <span style={{ opacity: 0.55, fontSize: "0.85em" }}>{link.handle}</span>
    </a>
  );
}

function Stage({ scenes, onDone, skip }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const currentScene = scenes[step];
  const isType = currentScene && currentScene.kind === "type";
  const [typed, typedDone] = useTypewriter(
    isType && !skip ? currentScene.text : "",
    currentScene && currentScene.speed ? currentScene.speed : 24,
    isType && !skip,
  );

  useEffect(() => {
    if (!currentScene) return;
    if (skip) {
      setStep(scenes.length);
      setDone(true);
      onDone && onDone();
      return;
    }
    if (currentScene.kind === "type" && typedDone) {
      const id = setTimeout(
        () => setStep((s) => s + 1),
        currentScene.after || 120,
      );
      return () => clearTimeout(id);
    }
    if (currentScene.kind === "output") {
      const id = setTimeout(
        () => setStep((s) => s + 1),
        currentScene.after || 220,
      );
      return () => clearTimeout(id);
    }
  }, [step, typedDone, skip]);

  useEffect(() => {
    if (step >= scenes.length && !done) {
      setDone(true);
      onDone && onDone();
    }
  }, [step]);

  return (
    <div>
      {scenes.slice(0, step).map((sc, i) => (
        <div key={i}>
          {sc.kind === "type" ? <PromptLine text={sc.text} /> : sc.node}
        </div>
      ))}
      {currentScene && currentScene.kind === "type" && !done && (
        <PromptLine text={skip ? currentScene.text : typed} cursor />
      )}
    </div>
  );
}

const PromptLine = ({ text, cursor }) => (
  <div style={{ padding: "2px 0" }}>
    <Prompt>
      {text}
      {cursor && <Cursor />}
    </Prompt>
  </div>
);

function NeofetchOutput({ bio }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "6px 0 8px",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <AsciiPortrait />
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            {PROFILE.user}
          </span>
          <span style={{ opacity: 0.7 }}>@</span>
          <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>
            {PROFILE.host}
          </span>
        </div>
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            marginBottom: 6,
            opacity: 0.6,
          }}
        />
        <InfoRow k="OS" v="kubisOS · rolling" />
        <InfoRow k="Uptime" v="∞ days" />
        <InfoRow k="Shell" v="kbsh v1.0.0" />
        <InfoRow k="Bio" v={bio ?? PROFILE.bio} />
        <div style={{ marginTop: 6 }}>
          <PaletteRow />
        </div>
      </div>
    </div>
  );
}

function LinksOutput({ links, selected, setSelected }) {
  const open = useCallback((i) => setSelected(i), [setSelected]);
  if (!links) {
    return (
      <div style={{ padding: "4px 8px", opacity: 0.5 }}>
        fetching links<span className="blink">_</span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "4px 0 6px",
      }}
    >
      {links.map((l, i) => (
        <LinkRow
          key={l.id}
          link={l}
          index={i}
          selected={selected === i}
          onSelect={setSelected}
          onOpen={open}
        />
      ))}
    </div>
  );
}

function WindowChrome({ children, title }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "var(--window-max)",
        background: "var(--bg-window)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        boxShadow: "var(--window-shadow)",
        overflow: "hidden",
        fontFamily: "var(--mono)",
        fontSize: 13.5,
        lineHeight: 1.55,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: "color-mix(in oklab, var(--bg-window) 88%, var(--text))",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
          <span
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: c,
              opacity: 0.85,
              boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.2)",
            }}
          />
        ))}
        <span
          style={{
            flex: 1,
            textAlign: "center",
            opacity: 0.6,
            fontFamily: "var(--mono)",
            letterSpacing: 0.3,
          }}
        >
          {title}
        </span>
        <span style={{ width: 33 }} />
      </div>
      <div style={{ padding: "18px 22px 22px", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

export default function App({ links, bio }) {
  const [selected, setSelected] = useState(0);
  const [skipIntro, setSkipIntro] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (!introDone || !links) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelected((s) => (s + 1) % links.length);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelected((s) => (s - 1 + links.length) % links.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        window.open(links[selected].href, "_blank", "noopener");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, selected, links]);

  const scenes = [
    { kind: "type", text: "neofetch", speed: 28, after: 80 },
    { kind: "output", node: <NeofetchOutput bio={bio} />, after: 280 },
    { kind: "type", text: "ls links/", speed: 26, after: 60 },
    {
      kind: "output",
      node: (
        <LinksOutput
          links={links}
          selected={selected}
          setSelected={setSelected}
        />
      ),
      after: 0,
    },
  ];

  return (
    <div
      onClick={() => {
        if (!introDone) setSkipIntro(true);
      }}
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        background: "var(--page-bg)",
      }}
    >
      <WindowChrome title={`${PROFILE.user}@${PROFILE.host} - zsh`}>
        <div style={{ opacity: 0.5, fontSize: 11, marginBottom: 10 }}>
          Last login: just now on web · type{" "}
          <span style={{ color: "var(--accent)" }}>help</span> for hints
        </div>

        <Stage
          scenes={scenes}
          skip={skipIntro}
          onDone={() => setIntroDone(true)}
        />

        {introDone && (
          <div style={{ padding: "4px 0" }}>
            <Prompt>
              <span style={{ opacity: 0.7 }}>open </span>
              <span style={{ color: "var(--accent)" }}>
                {links ? links[selected]?.label : "…"}
              </span>
              <Cursor />
            </Prompt>
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px dashed var(--border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ opacity: 0.55 }}>↑↓ select · ⏎ open</span>
          <span>
            <a
              href="https://github.com/kubisgg/dotlinks"
              target="_blank"
              rel="noopener"
              style={{ color: "var(--text)", textDecoration: "none" }}
            >
              <span style={{ verticalAlign: "-0.08em" }}>&copy;</span> kubis
            </a>
            <span style={{ opacity: 0.55 }}>{" · v1.0.0"}</span>
          </span>
        </div>
      </WindowChrome>
    </div>
  );
}
