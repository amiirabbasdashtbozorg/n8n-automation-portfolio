"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  BookOpen, Check, ChevronDown, CircleHelp, Copy, GraduationCap, Menu,
  MessageSquare, MoreHorizontal, Plus, Send, ShieldCheck, Sparkles,
  Trash2, Edit2, X, PanelRightClose, PanelRightOpen, RotateCcw, Wifi, WifiOff
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  error?: boolean;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

const STORAGE_KEY = "sut-copilot-conversations-v2";
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const suggestions = [
  { icon: BookOpen, title: "شرایط مشروطی در ارشد چیست؟", description: "معدل و پیامدهای آموزشی" },
  { icon: GraduationCap, title: "مدت مجاز تحصیل چقدر است؟", description: "سنوات و شرایط تمدید" },
  { icon: CircleHelp, title: "حداقل نمره قبولی هر درس چند است؟", description: "قوانین نمره و قبولی" }
];

function getAnswerText(payload: unknown): string {
  let value: unknown = payload;
  if (Array.isArray(value)) value = value[0];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.data !== undefined) return getAnswerText(obj.data);
    for (const key of ["output", "text", "response", "answer", "message"]) {
      if (typeof obj[key] === "string" && obj[key]) return obj[key] as string;
    }
    if (obj.json !== undefined) return getAnswerText(obj.json);
  }
  if (typeof value === "string") return value;
  return "";
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [sessionId, setSessionId] = useState(Date.now().toString());
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [connection, setConnection] = useState<"unknown" | "online" | "offline">("unknown");
  
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToRename, setChatToRename] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // لود کردن گفتگوها از حافظه محلی بدون ساختن چت اجباری
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Conversation[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      }
    } catch {
      // Ignore
    }
    // اگر چیزی نبود، بگذار لیست کاملاً خالی بماند تا کاربر خودش چت بسازد
    setConversations([]);
    setActiveId("");
  }, []);

  useEffect(() => {
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); 
    } catch { 
      /* ignore */ 
    }
  }, [conversations]);

  const active = conversations.find((item) => item.id === activeId);
  const messages = active?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function updateMessages(conversationId: string, updater: (old: Message[]) => Message[]) {
    setConversations((old) => old.map((conversation) => conversation.id === conversationId
      ? { ...conversation, messages: updater(conversation.messages), updatedAt: Date.now() }
      : conversation));
  }

  function newConversation() {
    const conversation: Conversation = {
      id: makeId(), title: "گفتگوی جدید", updatedAt: Date.now(), messages: []
    };
    setConversations((old) => [conversation, ...old]);
    setActiveId(conversation.id);
    setSessionId(Date.now().toString()); 
    setInput("");
    setSidebarOpen(false);
    setConnection("unknown");
    window.setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function confirmDeleteConversation() {
    if (!chatToDelete) return;
    setConversations((old) => {
      const filtered = old.filter((c) => c.id !== chatToDelete);
      if (filtered.length === 0) {
        setActiveId("");
      } else if (activeId === chatToDelete) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
    setChatToDelete(null);
  }

  function saveRename() {
    if (!chatToRename || !renameInput.trim()) return;
    setConversations((old) => old.map(c => c.id === chatToRename ? { ...c, title: renameInput.trim() } : c));
    setChatToRename(null);
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    let targetId = activeId;

    // اگر هیچ گفتگویی انتخاب نشده بود، به صورت خودکار یک گفتگوی جدید می‌سازیم
    if (!targetId || !conversations.some(c => c.id === targetId)) {
      const newConv: Conversation = {
        id: makeId(),
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        updatedAt: Date.now(),
        messages: []
      };
      setConversations((old) => [newConv, ...old]);
      setActiveId(newConv.id);
      targetId = newConv.id;
      setSessionId(Date.now().toString());
    }

    if (!overrideText) setInput("");
    setLoading(true);

    const userMessage: Message = {
      id: makeId(),
      role: "user",
      content: text,
      createdAt: Date.now()
    };

    updateMessages(targetId, (old) => [...old, userMessage]);

    // اگر اولین پیام بود، اسم چت را بر اساس متن کاربر تنظیم کن
    setConversations((old) => old.map((c) => {
      if (c.id === targetId && c.messages.length === 0) {
        return { ...c, title: text.slice(0, 30) + (text.length > 30 ? "..." : "") };
      }
      return c;
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const content = getAnswerText(data) || "متاسفانه نتوانستم پاسخی تولید کنم.";
      
      const aiMessage: Message = {
        id: makeId(),
        role: "assistant",
        content,
        createdAt: Date.now()
      };
      
      updateMessages(targetId, (old) => [...old, aiMessage]);
      setConnection("online");

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: makeId(),
        role: "assistant",
        content: "ارتباط با دستیار شریف قطع شده است. لطفا بررسی کنید ورک‌فلوی n8n در حال اجرا باشد.",
        createdAt: Date.now(),
        error: true
      };
      updateMessages(targetId, (old) => [...old, errorMessage]);
      setConnection("offline");
    } finally {
      setLoading(false);
      window.setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void sendMessage();
    }
  }

  async function copyMessage(message: Message) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(""), 1500);
    } catch { /* ignore */ }
  }

  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser && !loading) {
      updateMessages(activeId, (old) => old.filter((m) => !m.error));
      void sendMessage(lastUser.content);
    }
  }

  return (
    <main className="app-shell" dir="rtl">
      {sidebarOpen && <button aria-label="بستن منو" className="mobile-scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.1} /></div>
          <div className="brand-copy"><strong>SUT Copilot</strong><span>Academic Assistant</span></div>
          <button className="icon-button sidebar-close" aria-label="بستن منو" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <button className="new-chat-button" onClick={newConversation}>
          <Plus size={18} /><span>گفتگوی جدید</span><span className="shortcut">⌘ K</span>
        </button>

        <div className="side-label">فضای گفتگو <span>{conversations.length}</span></div>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button key={conversation.id}
              className={`conversation-item ${activeId === conversation.id ? "conversation-active" : ""}`}
              onClick={() => { setActiveId(conversation.id); setSidebarOpen(false); }}>
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              
              <span style={{ flex: 1, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {conversation.title}
              </span>
              
              <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatToRename(conversation.id);
                    setRenameInput(conversation.title);
                  }}
                  className="action-btn"
                  title="تغییر نام"
                  style={{ opacity: 0.5, display: "flex", padding: "4px", borderRadius: "4px" }}>
                  <Edit2 size={14} />
                </div>

                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatToDelete(conversation.id);
                  }}
                  className="action-btn"
                  title="حذف گفتگو"
                  style={{ opacity: 0.5, display: "flex", padding: "4px", borderRadius: "4px" }}>
                  <Trash2 size={14} />
                </div>
              </div>
              
              {activeId === conversation.id && <span className="active-dot" />}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="trust-card">
            <div className="trust-icon"><ShieldCheck size={18} /></div>
            <div><strong>پاسخ‌گویی مبتنی بر دانش</strong><p>برای تصمیم‌های آموزشی مهم، متن رسمی آیین‌نامه را بررسی کن.</p></div>
          </div>
          <div className="profile-row">
            <div className="avatar">ش</div>
            <div className="profile-copy"><strong>دستیار آموزشی شریف</strong><span>نسخه آزمایشی</span></div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-title">
            <button className="icon-button mobile-menu" aria-label="باز کردن منو" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div><strong>دستیار آیین‌نامه آموزشی</strong><span className="breadcrumb">دانشگاه صنعتی شریف <ChevronDown size={13} /></span></div>
          </div>
          <div className="topbar-actions">
            <span className={`connection-pill ${connection === "offline" ? "connection-error" : ""}`}>
              <span className="status-dot" />
              {connection === "online" ? "متصل" : connection === "offline" ? "خطای اتصال" : "آماده پاسخ‌گویی"}
            </span>
            <button className="icon-button sources-toggle" aria-label="پنل منابع" onClick={() => setSourcesOpen((v) => !v)}>
              {sourcesOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          </div>
        </header>

        <div className={`workspace ${sourcesOpen ? "workspace-with-sources" : ""}`}>
          <section className="chat-column">
            <div className={`chat-scroll ${messages.length === 0 ? "chat-empty" : ""}`}>
              {messages.length === 0 ? (
                <div className="welcome">
                  <div className="welcome-badge"><Sparkles size={18} /><span>دستیار هوشمند آموزشی</span></div>
                  <div className="welcome-icon"><GraduationCap size={32} /></div>
                  <h1>سلام، چطور می‌تونم کمکت کنم؟</h1>
                  <p className="welcome-subtitle">سؤالت رو درباره آیین‌نامه آموزشی کارشناسی ارشد بپرس.<br />من کمک می‌کنم مسیر و مقررات مرتبط رو بهتر پیدا کنی.</p>
                  <div className="suggestion-grid">
                    {suggestions.map(({ icon: Icon, title, description }) => (
                      <button key={title} className="suggestion-card" onClick={() => void sendMessage(title)} disabled={loading}>
                        <div className="suggestion-icon"><Icon size={19} /></div>
                        <div className="suggestion-copy"><strong>{title}</strong><span>{description}</span></div>
                        <span className="suggestion-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                  <div className="welcome-note"><ShieldCheck size={15} /><span>پاسخ‌ها ممکن است کامل نباشند؛ برای تصمیم‌های مهم، منبع رسمی را بررسی کن.</span></div>
                </div>
              ) : (
                <div className="message-list">
                  <div className="conversation-date"><span /> گفتگوی شما <span /></div>
                  {messages.map((message) => (
                    <article key={message.id} className={`message-row ${message.role === "user" ? "message-user" : "message-assistant"}`}>
                      {message.role === "assistant" && <div className="assistant-avatar"><Sparkles size={16} /></div>}
                      <div className="message-body">
                        <div className="message-author">{message.role === "user" ? "شما" : "دستیار آموزشی"} {message.error && <span className="error-tag">خطا</span>}</div>
                        <div className={`message-bubble ${message.role === "user" ? "user-bubble" : "assistant-bubble"} ${message.error ? "error-bubble" : ""}`}>
                          <p dir="auto">{message.content}</p>
                        </div>
                        {message.role === "assistant" && (
                          <div className="message-tools">
                            <button onClick={() => void copyMessage(message)}><Copy size={14} />{copiedId === message.id ? "کپی شد" : "کپی پاسخ"}</button>
                            {message.error && <button onClick={retryLast}><RotateCcw size={14} />تلاش دوباره</button>}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                  {loading && <div className="message-row message-assistant"><div className="assistant-avatar"><Sparkles size={16} /></div><div className="message-body"><div className="message-author">دستیار آموزشی</div><div className="typing-bubble"><span /><span /><span /><p>در حال آماده‌سازی پاسخ...</p></div></div></div>}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="composer-wrap">
              <form className="composer" onSubmit={handleSubmit}>
                <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="سؤالت رو اینجا بنویس..." rows={1}
                  aria-label="متن سؤال" maxLength={5000} disabled={loading} />
                <div className="composer-footer">
                  <div className="composer-hints"><span className="hint-chip"><Sparkles size={13} /> پاسخ هوشمند</span><span className="keyboard-hint">Enter برای ارسال · Shift + Enter برای خط جدید</span></div>
                  <button type="submit" className="send-button" disabled={!input.trim() || loading} aria-label="ارسال پیام">
                    <Send size={17} /><span>{loading ? "در حال ارسال" : "ارسال"}</span>
                  </button>
                </div>
              </form>
              <p className="disclaimer">این دستیار جایگزین مرجع رسمی دانشگاه نیست.</p>
            </div>
          </section>

          {sourcesOpen && (
            <aside className="sources-panel">
              <div className="sources-heading"><div><BookOpen size={18} /><strong>منابع و اطلاعات</strong></div><button className="icon-button" aria-label="بستن منابع" onClick={() => setSourcesOpen(false)}><X size={17} /></button></div>
              <div className="sources-empty"><div className="sources-empty-icon"><BookOpen size={22} /></div><strong>منبعی برای نمایش نداریم</strong><p>در حال حاضر رابط، منبع ساختاریافته‌ای از پاسخ دریافت نکرده است. برای نمایش استنادها باید خروجی workflow در n8n گسترش یابد.</p></div>
              <div className="sources-footnote"><ShieldCheck size={15} /><span>منابع ساختگی نمایش داده نمی‌شوند.</span></div>
            </aside>
          )}
        </div>
      </section>

      {/* مودال تایید حذف گفتگو */}
      {chatToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--surf, #fff)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text, #111)' }}>حذف گفتگو</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--mute, #555)' }}>آیا از پاک کردن این گفتگو اطمینان دارید؟ این عمل غیرقابل بازگشت است.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => setChatToDelete(null)} 
                style={{ padding: '8px 16px', border: 'none', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                انصراف
              </button>
              <button 
                onClick={confirmDeleteConversation} 
                style={{ padding: '8px 16px', border: 'none', backgroundColor: '#ef4444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                بله، پاک کن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تغییر نام گفتگو */}
      {chatToRename && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--surf, #fff)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text, #111)' }}>تغییر نام گفتگو</h3>
            <input
              autoFocus
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); }}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              placeholder="نام جدید را وارد کنید..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button 
                onClick={() => setChatToRename(null)} 
                style={{ padding: '8px 16px', border: 'none', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                انصراف
              </button>
              <button 
                onClick={saveRename} 
                style={{ padding: '8px 16px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}