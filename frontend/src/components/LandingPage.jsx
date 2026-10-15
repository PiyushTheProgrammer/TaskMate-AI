import React, { useState } from 'react';

/* ─── Tiny SVG icon helpers ──────────────────────────────────────── */
function ChevronDown({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Logo mark ─────────────────────────────────────────────────── */
function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#8B7CFF" />
      <path d="M7 14h14M7 9.5h8M7 18.5h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="9.5" r="2" fill="white" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Interactive Demo", href: "#demo" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingPage({ onNavigate, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState("brief");
  const [openFaq, setOpenFaq] = useState(null);

  const previewTabs = [
    {
      id: "brief",
      label: "Client Brief",
      content: (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: "var(--lp-text2)", margin: "0 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Input — Raw client message</p>
          <div style={{ background: "var(--lp-bg)", borderRadius: 8, border: "1px solid var(--lp-border)", padding: 18, fontSize: 13, color: "var(--lp-text2)", lineHeight: 1.75, fontFamily: "monospace" }}>
            "Hey Yashodhan, I need a modern web and mobile platform for pet care booking. Should have user authentication, trainer profiles, calendar booking with real-time slots, and Stripe payments. Need it in 4 weeks. Budget is around $3,500 - $5,000. Let me know if you can take this on!"
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(139,124,255,0.12)", border: "1px solid rgba(139,124,255,0.3)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "var(--lp-violet)", fontWeight: 600 }}>
              ✓ Core scope extracted: 4 milestones
            </div>
            <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              ⏱ Timeline realistic: 4 weeks
            </div>
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
              💰 Budget: $3,500 - $5,000 USD
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "requirements",
      label: "AI Requirement Analysis",
      content: (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: "var(--lp-text2)", margin: "0 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Structured Output — AI Extracted Specification</p>
          {[
            { section: "Core Features", items: ["JWT User Authentication & RBAC", "Trainer profile CRUD with availability calendar", "Stripe payment intent & webhook handling", "Client booking confirmation & email alerts"] },
            { section: "Recommended Stack", items: ["Frontend: React 19 / Next.js", "Backend: Python FastAPI", "Database: SQLite / PostgreSQL with SQLAlchemy", "Payment: Stripe Connect"] },
            { section: "Key Deliverables", items: ["High-fidelity wireframes", "RESTful API endpoints with Swagger docs", "Unit & integration test suites", "Deployment scripts & documentation"] },
          ].map((s) => (
            <div key={s.section} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.section}</p>
              {s.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, padding: "3px 0", fontSize: 13, color: "var(--lp-text2)", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--lp-violet)", marginTop: 1 }}>›</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "tasks",
      label: "Project Plan & Agents",
      content: (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 12, color: "var(--lp-text2)", margin: "0 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Generated Multi-Agent Task Plan</p>
          {[
            { task: "Design Booking Calendar & Availability Tokens", agent: "Design Agent", priority: "P1", status: "Completed", est: "4h" },
            { task: "Implement Stripe Webhook Ingestion Endpoint", agent: "Developer Agent", priority: "P1", status: "Reviewing", est: "6h" },
            { task: "Build Trainer Profile CRUD with SQLAlchemy", agent: "Developer Agent", priority: "P1", status: "In Progress", est: "5h" },
            { task: "Draft Formal Statement of Work & Proposal PDF", agent: "Proposal Engine", priority: "P2", status: "Ready", est: "2h" },
          ].map((t, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: t.status === "Completed" ? "#10b981" : t.status === "Reviewing" ? "var(--lp-violet)" : "#f59e0b",
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, color: "var(--lp-text)" }}>{t.task}</span>
              <span style={{ fontSize: 11, color: "var(--lp-violet)", background: "rgba(139,124,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>{t.agent}</span>
              <span style={{ fontSize: 11, color: t.priority === "P1" ? "#f59e0b" : "var(--lp-text2)", fontWeight: 600 }}>{t.priority}</span>
              <span style={{ fontSize: 11, color: "var(--lp-text2)" }}>{t.est}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const problems = [
    {
      emoji: "😵",
      title: "Client briefs are chaos",
      desc: "Requirements arrive as unstructured text, scattered emails, or informal chats. No structure, missing budgets, and unclear deliverables.",
    },
    {
      emoji: "📊",
      title: "Estimating is painful",
      desc: "Freelancers spend hours calculating scope, writing proposals, and generating line-item quotations — hours you cannot bill for.",
    },
    {
      emoji: "🧩",
      title: "Context switching kills flow",
      desc: "Juggling 5 clients across separate spreadsheets, calendars, and invoicing portals causes missed follow-ups and lost revenue.",
    },
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "Paste Client Brief or Upload RFP",
      desc: "Drop raw emails, Slack messages, or upload .pdf/.docx files directly into the AI Requirement Analyzer.",
    },
    {
      number: "02",
      title: "AI Extracts Scope, Timeline & Budget",
      desc: "Natural language processing analyzes the input, extracting objectives, deliverables checklist, budget range, and tech stack.",
    },
    {
      number: "03",
      title: "1-Click Proposal & PDF Export",
      desc: "Convert analyzed requirements into professional proposals (Standard, Modern, Formal) with downloadable ReportLab PDFs.",
    },
    {
      number: "04",
      title: "Autonomous Multi-Agent Execution",
      desc: "Developer Agent scaffolds APIs and tests; Design Agent generates UI specs and tokens, with a client review and revision feedback loop.",
    },
  ];

  const features = [
    {
      title: "AI Requirement Analyzer",
      desc: "Extracts structured scope, milestones, deliverables, and estimated budgets from unstructured text or uploaded documents.",
      accent: "#8B7CFF",
      icon: "🧩",
      action: "analyzer",
    },
    {
      title: "Proposals & Quotations with PDF",
      desc: "Generate professional agreements using multiple templates with live Markdown editing and instant ReportLab PDF downloads.",
      accent: "#66A6FF",
      icon: "📄",
      action: "proposals",
    },
    {
      title: "Multi-Agent Task Orchestrator",
      desc: "State machine routing work to Developer Agent (code, tests) and Design Agent (tokens, wireframes) with client review loops.",
      accent: "#34d399",
      icon: "🤖",
      action: "tasks",
    },
    {
      title: "Client CRM & Follow-Up Advice",
      desc: "Track client lifecycle (Lead, Active, Completed), store communication history, and get smart AI follow-up suggestions.",
      accent: "#f59e0b",
      icon: "🤝",
      action: "clients",
    },
    {
      title: "Invoices & Payment Tracking",
      desc: "Create line-item invoices with automated sum calculations, due dates, payment status tracking, and PDF receipts.",
      accent: "#f472b6",
      icon: "💳",
      action: "invoices",
    },
    {
      title: "Smart Scheduler & Outreach",
      desc: "Calendar timeline with automatic conflict warnings, Google Calendar sync, and AI email/WhatsApp message drafting.",
      accent: "#8B7CFF",
      icon: "📅",
      action: "scheduler",
    },
  ];

  const faqs = [
    {
      q: "How does TaskMate AI help freelancers?",
      a: "It eliminates administrative overhead by automating client requirement extraction, proposal generation, PDF invoices, client outreach, meeting scheduling, and multi-agent task execution from one unified workspace.",
    },
    {
      q: "Does it require an OpenAI API key?",
      a: "No! TaskMate AI includes an intelligent built-in heuristic NLP engine that operates 100% offline with zero external API dependencies. If you do provide an OpenAI key in Admin settings, it seamlessly upgrades to GPT-4o.",
    },
    {
      q: "Can I edit AI-generated proposals before sending them to clients?",
      a: "Yes. In strict compliance with Business Rule BR-4 and BR-8, all AI-generated proposals, quotations, and requirements remain fully editable via live rich text before PDF export or dispatch.",
    },
    {
      q: "How does the Multi-Agent Orchestrator work?",
      a: "When you dispatch a task, the AI Orchestrator routes it to either the Developer Agent (for APIs, logic, code, tests) or the Design Agent (for layout, design tokens, wireframes). Deliverables are presented for quality review, with full support for client revisions and reworking.",
    },
    {
      q: "Is data stored locally and securely?",
      a: "Yes. All client records, proposals, tasks, and audit logs are stored in your private SQLite database using encrypted password hashes and JWT session tokens, with zero telemetry or data leaks.",
    },
  ];

  return (
    <div className="landing" style={{
      minHeight: "100vh",
      background: "var(--lp-bg)",
      color: "var(--lp-text)",
      fontFamily: "var(--font-family)",
      position: "relative"
    }}>
      {/* Dynamic Landing CSS Tokens */}
      <style>{`
        .landing {
          --lp-bg: #090B10;
          --lp-bg2: #0F121A;
          --lp-card: #141925;
          --lp-card2: #1A2030;
          --lp-text: #F5F7FB;
          --lp-text2: #A1A9B8;
          --lp-violet: #8B7CFF;
          --lp-blue: #66A6FF;
          --lp-border: rgba(255, 255, 255, 0.08);
          --lp-border2: rgba(255, 255, 255, 0.13);
          color-scheme: dark;
        }

        .lp-header-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--lp-border);
          background: rgba(9, 11, 16, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }

        .lp-3col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .lp-feature-card:hover {
          border-color: rgba(139, 124, 255, 0.4) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-3col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="lp-header-nav">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", height: 64, gap: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <LogoMark size={30} />
              <span style={{ fontWeight: 800, fontSize: 18, color: "var(--lp-text)", letterSpacing: "-0.02em" }}>
                TaskMate <span style={{ color: "var(--lp-violet)" }}>AI</span>
              </span>
            </div>

            <nav style={{ display: "flex", gap: 6, flex: 1, justifyContent: "center" }} className="lp-desktop-nav">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "var(--lp-text2)",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--lp-text)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--lp-text2)"; e.currentTarget.style.background = "transparent"; }}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }}>
              {currentUser ? (
                <button
                  onClick={() => onNavigate("dashboard")}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    border: "none",
                    background: "linear-gradient(135deg, #8B7CFF, #66A6FF)",
                    boxShadow: "0 0 20px rgba(139,124,255,0.35)",
                  }}
                >
                  Enter Workspace ({currentUser.full_name.split(' ')[0]}) &rarr;
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate("login")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 14,
                      color: "var(--lp-text)",
                      cursor: "pointer",
                      border: "1px solid var(--lp-border2)",
                      background: "transparent",
                    }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate("register")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      cursor: "pointer",
                      border: "none",
                      background: "linear-gradient(135deg, #8B7CFF, #66A6FF)",
                      boxShadow: "0 0 20px rgba(139,124,255,0.35)",
                    }}
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section id="product" style={{ padding: "80px 24px 96px", position: "relative", overflow: "hidden" }}>
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: "-120px", left: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,124,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "60px", right: "10%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,166,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "6px 16px" }}>
              <span style={{ fontSize: 11, background: "linear-gradient(90deg, #8B7CFF, #66A6FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Built for Independent Freelancers & Micro-Studios
              </span>
            </div>
          </div>

          <div className="lp-hero-grid">
            {/* Left Column: Heading and CTAs */}
            <div>
              <h1 style={{
                fontSize: "clamp(36px, 4.8vw, 58px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "var(--lp-text)",
                margin: "0 0 24px",
              }}>
                Turn messy client briefs into{" "}
                <span style={{ background: "linear-gradient(135deg, #8B7CFF, #66A6FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  structured projects
                </span>
              </h1>
              <p style={{ fontSize: 18, color: "var(--lp-text2)", lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
                TaskMate AI unifies requirement analysis, proposal generation, client CRM, PDF invoicing, and autonomous Developer & Design agents into one seamless workspace.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => onNavigate("register")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                    color: "#fff", border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #8B7CFF, #66A6FF)",
                    boxShadow: "0 0 32px rgba(139,124,255,0.4)",
                  }}
                >
                  Start Free Now <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onNavigate("dashboard")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                    color: "var(--lp-text2)", border: "1px solid var(--lp-border2)",
                    background: "transparent", cursor: "pointer"
                  }}
                >
                  Open Live Workspace
                </button>
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
                {["No credit card required", "ReportLab PDF Export", "Autonomous Multi-Agent Loop"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckIcon size={14} />
                    <span style={{ fontSize: 13, color: "var(--lp-text2)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Interactive Window Mockup */}
            <div>
              <div style={{
                borderRadius: 16,
                border: "1px solid var(--lp-border2)",
                background: "var(--lp-card)",
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(139,124,255,0.15)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderBottom: "1px solid var(--lp-border)", background: "var(--lp-bg2)" }}>
                  {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                  <div style={{ flex: 1, margin: "0 12px", height: 22, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", paddingLeft: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--lp-text2)" }}>taskmate.ai/dashboard</span>
                  </div>
                </div>

                <div style={{ display: "flex", height: 350 }}>
                  {/* Mock Sidebar */}
                  <div style={{ width: 180, borderRight: "1px solid var(--lp-border)", background: "var(--lp-bg2)", padding: "16px 0" }}>
                    <div style={{ padding: "0 14px 12px", borderBottom: "1px solid var(--lp-border)", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <LogoMark size={20} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--lp-text)" }}>TaskMate AI</span>
                      </div>
                    </div>
                    {[
                      { label: "Dashboard", active: true },
                      { label: "Clients (CRM)", active: false },
                      { label: "AI Analyzer", active: false },
                      { label: "Proposals & PDF", active: false },
                      { label: "Multi-Agent Tasks", active: false },
                      { label: "Smart Scheduler", active: false },
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: "7px 14px",
                        fontSize: 12,
                        color: item.active ? "var(--lp-violet)" : "var(--lp-text2)",
                        background: item.active ? "rgba(139,124,255,0.12)" : "transparent",
                        margin: "1px 8px",
                        borderRadius: 6,
                        fontWeight: item.active ? 600 : 400
                      }}>
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Mock Workspace Content */}
                  <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                      {[
                        { label: "Active Clients", val: "3", col: "var(--lp-violet)" },
                        { label: "Net Earnings", val: "$4,200", col: "#10b981" },
                        { label: "Pending Invoices", val: "$1,500", col: "#f59e0b" },
                      ].map((s) => (
                        <div key={s.label} style={{ background: "var(--lp-bg2)", borderRadius: 8, border: "1px solid var(--lp-border)", padding: "10px 12px" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: s.col }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: "var(--lp-text2)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: "var(--lp-bg2)", borderRadius: 8, border: "1px solid var(--lp-border)", padding: "12px", marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--lp-text2)", marginBottom: 8, textTransform: "uppercase" }}>Active Pipelines</p>
                      {[
                        { title: "Warehouse Inventory OCR Pipeline", status: "Active", client: "Acme Dynamics" },
                        { title: "FinTech Anomaly Classifier API", status: "Proposal Sent", client: "FinTech Global" },
                      ].map((t, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--lp-text)" }}>{t.title}</div>
                            <div style={{ fontSize: 10, color: "var(--lp-text2)" }}>Client: {t.client}</div>
                          </div>
                          <span style={{ fontSize: 10, color: "var(--lp-violet)", background: "rgba(139,124,255,0.12)", padding: "2px 8px", borderRadius: 4 }}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: "var(--lp-bg2)", borderRadius: 8, border: "1px solid rgba(139,124,255,0.3)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, #8B7CFF, #66A6FF)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--lp-text2)", fontStyle: "italic" }}>AI Assistant: 1 client follow-up recommended today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Section ─────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-border)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-violet)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", textTransform: "uppercase" }}>The Problem</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "var(--lp-text)", margin: "0 0 16px" }}>
              Freelancing is rewarding. Administrative chaos is not.
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text2)", maxWidth: 600, margin: "0 auto" }}>
              Freelancers lose 10+ hours every week deciphering raw client briefs, drafting proposals, tracking overdue payments, and coordinating schedules.
            </p>
          </div>

          <div className="lp-3col">
            {problems.map((p, idx) => (
              <div key={idx} style={{ background: "var(--lp-card)", border: "1px solid var(--lp-border)", borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{p.emoji}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--lp-text)", margin: "0 0 10px" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "var(--lp-text2)", lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workflow Steps ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, var(--lp-bg) 0%, var(--lp-bg2) 100%)", borderTop: "1px solid var(--lp-border)", borderBottom: "1px solid var(--lp-border)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="lp-hero-grid">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-violet)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", textTransform: "uppercase" }}>How It Works</span>
              </div>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "var(--lp-text)", margin: "0 0 16px" }}>
                From messy brief to signed project in minutes
              </h2>
              <p style={{ fontSize: 16, color: "var(--lp-text2)", lineHeight: 1.7, maxWidth: 480 }}>
                TaskMate AI provides a structured, automated pipeline so you spend less time writing proposals and more time shipping code.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {workflowSteps.map((step) => (
                <div key={step.number} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, background: "rgba(139,124,255,0.12)", border: "1px solid rgba(139,124,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--lp-violet)" }}>{step.number}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-text)", margin: "0 0 4px" }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--lp-text2)", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Bento Section ───────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-border)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-violet)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", textTransform: "uppercase" }}>Features</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "var(--lp-text)", margin: "0 0 16px" }}>
              Complete Suite for Solo Freelancers
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text2)", maxWidth: 600, margin: "0 auto" }}>
              Click any feature below to jump directly into the workspace module.
            </p>
          </div>

          <div className="lp-3col">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="lp-feature-card"
                onClick={() => onNavigate(f.action)}
                style={{
                  background: "var(--lp-card)",
                  border: "1px solid var(--lp-border)",
                  borderRadius: 16,
                  padding: "28px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.accent}18`,
                  border: `1px solid ${f.accent}30`,
                  marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-text)", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--lp-text2)", lineHeight: 1.7, margin: "0 0 16px" }}>{f.desc}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: f.accent }}>
                  Launch Module &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interactive Demo Preview ─────────────────────────────────── */}
      <section id="demo" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-border)", background: "var(--lp-bg2)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-violet)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", textTransform: "uppercase" }}>Interactive Demo</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "var(--lp-text)", margin: "0 0 16px" }}>
              See It in Action
            </h2>
            <p style={{ fontSize: 16, color: "var(--lp-text2)" }}>
              Watch how raw client requirements transform into structured plans and tasks.
            </p>
          </div>

          <div style={{ background: "var(--lp-card)", border: "1px solid var(--lp-border2)", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--lp-border)", background: "var(--lp-bg)" }}>
              {previewTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActivePreviewTab(t.id)}
                  style={{
                    padding: "14px 24px",
                    fontSize: 13,
                    fontWeight: activePreviewTab === t.id ? 700 : 500,
                    color: activePreviewTab === t.id ? "var(--lp-violet)" : "var(--lp-text2)",
                    background: "none",
                    border: "none",
                    borderBottom: activePreviewTab === t.id ? "2px solid var(--lp-violet)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              {previewTabs.find(t => t.id === activePreviewTab)?.content}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ──────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(139,124,255,0.1)", border: "1px solid rgba(139,124,255,0.25)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-violet)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-violet)", textTransform: "uppercase" }}>FAQ</span>
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "var(--lp-text)", margin: "0 0 16px" }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "var(--lp-card)",
                  border: `1px solid ${openFaq === i ? "rgba(139,124,255,0.4)" : "var(--lp-border)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 22px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", color: "var(--lp-text)"
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{faq.q}</span>
                  <span style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <ChevronDown size={18} />
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 22px 20px", fontSize: 14, color: "var(--lp-text2)", lineHeight: 1.75 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Banner ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", overflow: "hidden", borderTop: "1px solid var(--lp-border)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(139,124,255,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 900, color: "var(--lp-text)", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Stop wrestling with admin.{" "}
            <span style={{ background: "linear-gradient(135deg, #8B7CFF, #66A6FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Start shipping.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: "var(--lp-text2)", lineHeight: 1.7, marginBottom: 32 }}>
            TaskMate AI runs locally and securely. Pre-seeded demo account included so you can get started in seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => onNavigate("register")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700,
                color: "#fff", border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #8B7CFF, #66A6FF)",
                boxShadow: "0 0 36px rgba(139,124,255,0.4)",
              }}
            >
              Create Workspace Account <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate("login")}
              style={{
                padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                color: "var(--lp-text2)", border: "1px solid var(--lp-border2)",
                background: "transparent", cursor: "pointer"
              }}
            >
              Sign In to Demo
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--lp-border)", padding: "40px 24px", background: "var(--lp-bg)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={24} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--lp-text)" }}>TaskMate AI</span>
            <span style={{ fontSize: 13, color: "var(--lp-text2)", marginLeft: 8 }}>— Intelligent Personal Assistant for Freelancers</span>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <button onClick={() => onNavigate("dashboard")} style={{ background: "none", border: "none", color: "var(--lp-text2)", cursor: "pointer", fontSize: 13 }}>
              Dashboard
            </button>
            <button onClick={() => onNavigate("analyzer")} style={{ background: "none", border: "none", color: "var(--lp-text2)", cursor: "pointer", fontSize: 13 }}>
              Requirement Analyzer
            </button>
            <button onClick={() => onNavigate("proposals")} style={{ background: "none", border: "none", color: "var(--lp-text2)", cursor: "pointer", fontSize: 13 }}>
              Proposals
            </button>
            <button onClick={() => onNavigate("tasks")} style={{ background: "none", border: "none", color: "var(--lp-text2)", cursor: "pointer", fontSize: 13 }}>
              Multi-Agent Tasks
            </button>
            <button onClick={() => onNavigate("login")} style={{ background: "none", border: "none", color: "var(--lp-violet)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Sign In
            </button>
          </div>

          <p style={{ fontSize: 12, color: "var(--lp-text2)", margin: 0 }}>
            © {new Date().getFullYear()} TaskMate AI. PCCOE Pune.
          </p>
        </div>
      </footer>
    </div>
  );
}
