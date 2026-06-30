"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import {
  MessageCircle, Minus, Send, ArrowLeft,
  ShieldCheck, DoorOpen, FlaskConical, Bot, Headset,
} from "lucide-react";
import type { ChatContact, ChatMessage } from "@/types";

const CONTACTS: { key: ChatContact; label: string; Icon: React.ElementType; desc: string; color: string }[] = [
  { key: "admin",    label: "Admin Sistem", Icon: ShieldCheck,  desc: "Bantuan akun & sistem",    color: "bg-rose-500"    },
  { key: "pengelola",label: "PJ Ruangan",   Icon: DoorOpen,     desc: "Ruangan & lokasi aset",    color: "bg-orange-500"  },
  { key: "laboran",  label: "Laboran",      Icon: FlaskConical, desc: "Peralatan laboratorium",   color: "bg-emerald-500" },
];
const contactLabel = (c: ChatContact) => CONTACTS.find((x) => x.key === c)?.label || c;
const fmtTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
};

export function ChatWidget() {
  const currentUser    = useAppStore((s) => s.currentUser);
  const chatMessages   = useAppStore((s) => s.chatMessages);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const startChat      = useAppStore((s) => s.startChat);
  const markChatRead   = useAppStore((s) => s.markChatRead);
  const addNotifikasi  = useAppStore((s) => s.addNotifikasi);

  const [open,   setOpen]   = useState(false);
  const [thread, setThread] = useState<string | null>(null);
  const [text,   setText]   = useState("");
  const [sending, setSending] = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  // simpan timestamp pesan terakhir yang sudah kita tarik dari server
  const lastPull = useRef<string>(new Date(0).toISOString());

  /* ── siapa saya sebagai staff? ── */
  const myStaffContact: ChatContact | null = currentUser
    ? currentUser.role === "admin"     ? "admin"
    : currentUser.role === "pengelola" ? "pengelola"
    : currentUser.subRole === "laboran"? "laboran"
    : null
    : null;

  /* ── pesan yang relevan untuk saya ── */
  const relevant = useMemo(() => {
    if (!currentUser) return [] as ChatMessage[];
    return chatMessages.filter(
      (m) => m.userId === currentUser.id || m.contactRole === myStaffContact
    );
  }, [chatMessages, currentUser, myStaffContact]);

  const unread = useMemo(
    () => relevant.filter((m) => !m.dibaca && m.senderId !== currentUser?.id).length,
    [relevant, currentUser]
  );

  const threads = useMemo(() => {
    const map = new Map<string, ChatMessage[]>();
    relevant.forEach((m) => {
      if (!map.has(m.threadId)) map.set(m.threadId, []);
      map.get(m.threadId)!.push(m);
    });
    return Array.from(map.entries()).map(([tid, msgs]) => {
      const sorted = [...msgs].sort((a, b) => a.waktu.localeCompare(b.waktu));
      const last   = sorted[sorted.length - 1];
      const [ownerId] = tid.split("::");
      const iAmCitizen  = ownerId === currentUser?.id;
      const unreadCount = sorted.filter((m) => !m.dibaca && m.senderId !== currentUser?.id).length;
      return { tid, sorted, last, iAmCitizen, unreadCount };
    }).sort((a, b) => b.last.waktu.localeCompare(a.last.waktu));
  }, [relevant, currentUser]);

  const incoming = threads.filter((t) => !t.iAmCitizen);
  const mine     = threads.filter((t) =>  t.iAmCitizen);
  const active   = thread ? threads.find((t) => t.tid === thread) ?? null : null;

  /* ════════════════════════════════════════════════════════
     POLLING — tarik pesan baru dari server tiap 2 detik
  ════════════════════════════════════════════════════════ */
  const poll = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res  = await fetch(`/api/chat?since=${encodeURIComponent(lastPull.current)}`);
      if (!res.ok) return;
      const json = await res.json() as { ok: boolean; data: ChatMessage[] };
      if (!json.ok || !json.data?.length) return;

      // update timestamp terakhir
      const latest = json.data.reduce((max, m) => m.waktu > max ? m.waktu : max, lastPull.current);
      lastPull.current = latest;

      // masukkan ke store hanya yang belum ada (hindari duplikat)
      const existing = new Set(chatMessages.map((m) => m.id));
      json.data.forEach((m) => {
        if (!existing.has(m.id)) addChatMessage(m);
      });
    } catch { /* abaikan error jaringan */ }
  }, [currentUser, chatMessages, addChatMessage]);

  useEffect(() => {
    if (!currentUser) return;
    poll(); // tarik sekali langsung saat mount
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [currentUser, poll]);

  /* ── scroll ke bawah saat pesan baru ── */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.sorted.length, open, thread]);

  /* ── buka dari halaman lain (mis. tracking) ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const role = (e as CustomEvent).detail?.role as ChatContact | undefined;
      setOpen(true);
      if (role) { const id = startChat(role); setThread(id); }
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, [startChat]);

  /* ── tandai dibaca saat thread aktif ── */
  useEffect(() => {
    if (!open || !thread || !currentUser) return;
    const hasUnread = chatMessages.some(
      (m) => m.threadId === thread && !m.dibaca && m.senderId !== currentUser.id
    );
    if (!hasUnread) return;
    const [ownerId] = thread.split("::");
    markChatRead(thread, ownerId === currentUser.id ? "user" : "staff");
  }, [open, thread, chatMessages, currentUser, markChatRead]);

  if (!currentUser) return null;

  const openThread = (tid: string) => {
    setThread(tid);
    const [ownerId] = tid.split("::");
    markChatRead(tid, ownerId === currentUser.id ? "user" : "staff");
  };
  const startNew = (c: ChatContact) => { const id = startChat(c); openThread(id); };

  /* ── kirim pesan: simpan ke store + POST ke server ── */
  const send = async () => {
    const body = text.trim();
    if (!body || !thread || sending) return;
    setSending(true);

    const [ownerId, contact] = thread.split("::") as [string, ChatContact];
    const citizen    = ownerId === currentUser.id;
    const ownerNama  = active?.last.userNama || currentUser.nama;
    const now        = new Date().toISOString();
    const msg: ChatMessage = {
      id:          "chat-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      threadId:    thread,
      userId:      ownerId,
      userNama:    ownerNama,
      contactRole: contact,
      senderId:    currentUser.id,
      senderNama:  currentUser.nama,
      fromSide:    citizen ? "user" : "staff",
      text:        body,
      waktu:       now,
      dibaca:      false,
    };

    // 1) tampilkan di UI seketika (optimistic)
    addChatMessage(msg);
    setText("");

    // 2) simpan ke server (background, tidak block UI)
    fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(msg),
    }).catch(() => { /* abaikan, data sudah ada di store lokal */ });

    // 3) notifikasi ke pihak lain
    if (citizen) {
      addNotifikasi({
        id:    "ntf-" + Date.now().toString(36),
        tipe:  "laporan",
        judul: `Pesan baru dari ${currentUser.nama.split(" ")[0]}`,
        pesan: body.slice(0, 80),
        waktu: now,
        dibaca: false,
        refId: thread,
        ...(contact === "admin"
          ? { untukRole: "admin"     as const }
          : contact === "pengelola"
          ? { untukRole: "pengelola" as const }
          : { untukRole: "user"      as const, untukSubRole: "laboran" as const }),
      });
    } else {
      addNotifikasi({
        id:       "ntf-" + Date.now().toString(36),
        tipe:     "laporan",
        judul:    `Balasan dari ${currentUser.nama.split(" ")[0]}`,
        pesan:    body.slice(0, 80),
        waktu:    now,
        dibaca:   false,
        refId:    thread,
        untukUserId: ownerId,
      });
    }

    setSending(false);
  };

  /* ════════════ RENDER ════════════ */
  return (
    <>
      {/* Tombol mengambang */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl gradient-brand text-white shadow-lg shadow-brand-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Buka pusat bantuan"
        >
          <Headset size={22} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {/* Panel chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[370px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">

          {/* ── Header ── */}
          <div className="gradient-brand text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {active && (
                <button onClick={() => setThread(null)} className="hover:bg-white/15 rounded-lg p-1 -ml-1" aria-label="Kembali">
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight truncate">
                  {active
                    ? (active.iAmCitizen ? contactLabel(active.last.contactRole) : active.last.userNama)
                    : "Pusat Bantuan"}
                </p>
                <p className="text-[11px] text-white/70 leading-tight">
                  {active
                    ? (active.iAmCitizen ? "Biasanya membalas beberapa menit" : "Pengguna menghubungi Anda")
                    : "Kami siap membantu Anda"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/15 rounded-lg p-1.5" aria-label="Minimalkan">
              <Minus size={16} />
            </button>
          </div>

          {/* ── Body: daftar kontak / thread ── */}
          {!active ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">

              {/* Pesan masuk untuk staff */}
              {incoming.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">Perlu Dibalas</p>
                  <div className="space-y-1.5">
                    {incoming.map((t) => (
                      <button key={t.tid} onClick={() => openThread(t.tid)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left">
                        <div className="w-9 h-9 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {t.last.userNama.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{t.last.userNama}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {t.last.fromSide === "bot" ? "Menunggu balasan Anda" : t.last.text}
                          </p>
                        </div>
                        {t.unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {t.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pilih kontak baru */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">Mulai Percakapan</p>
                <div className="space-y-1.5">
                  {CONTACTS.map(({ key, label, Icon, desc, color }) => (
                    <button key={key} onClick={() => startNew(key)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left">
                      <div className={cn("w-9 h-9 rounded-xl text-white flex items-center justify-center flex-shrink-0", color)}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                      </div>
                      <MessageCircle size={15} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Riwayat percakapan saya */}
              {mine.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">Percakapan Anda</p>
                  <div className="space-y-1.5">
                    {mine.map((t) => (
                      <button key={t.tid} onClick={() => openThread(t.tid)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                          <Headset size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{contactLabel(t.last.contactRole)}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{t.last.text}</p>
                        </div>
                        {t.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Body: isi percakapan ── */
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-muted/20">
                {active.sorted.map((m) => {
                  const mineMsg = m.senderId === currentUser.id;
                  const isBot   = m.fromSide === "bot";
                  return (
                    <div key={m.id} className={cn("flex", mineMsg ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
                        mineMsg ? "bg-brand-600 text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                      )}>
                        {!mineMsg && (
                          <p className={cn("text-[10px] font-bold mb-0.5 flex items-center gap-1",
                            isBot ? "text-brand-600" : "text-foreground")}>
                            {isBot && <Bot size={11} />}{m.senderNama}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words leading-snug">{m.text}</p>
                        <p className={cn("text-[9px] mt-0.5 text-right",
                          mineMsg ? "text-white/60" : "text-muted-foreground")}>
                          {fmtTime(m.waktu)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Input kirim pesan */}
              <div className="p-2.5 border-t border-border flex items-center gap-2 flex-shrink-0 bg-card">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Tulis pesan…"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
                  aria-label="Kirim pesan"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
