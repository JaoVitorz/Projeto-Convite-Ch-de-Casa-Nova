"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { adminData } from "@/lib/data";

type Data = Awaited<ReturnType<typeof adminData>>;
type Tab = "convidados" | "itens" | "convite";

export function AdminDashboard({ initial }: { initial: Data }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("convidados");
  const [event, setEvent] = useState(initial.event);
  const [newItem, setNewItem] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const attendingCount = initial.guests.filter((guest) => guest.attending).length;
  const reservedCount = initial.items.filter((item) => item.reserved).length;

  useEffect(() => setEvent(initial.event), [initial.event]);

  async function request(path: string, method: "POST" | "PATCH" | "DELETE", body?: object) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error ?? "Não foi possível salvar."); return false; }
      setMessage("Alterações salvas."); router.refresh(); return true;
    } catch { setMessage("Falha de conexão. Tente novamente."); return false; }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login"); router.refresh();
  }

  return <main className="min-h-screen bg-cream">
    <header className="border-b border-olive/10 bg-white/70"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">Chá de Casa Nova</p><h1 className="font-serif text-3xl">Painel da Cilce</h1></div><div className="flex items-center gap-5 text-sm"><a href="/" target="_blank" rel="noreferrer" className="text-olive hover:underline">Ver convite ↗</a><button onClick={logout} className="rounded-full border border-olive/30 px-4 py-2 text-olive hover:bg-olive hover:text-white">Sair</button></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-9">
      <div className="grid gap-4 sm:grid-cols-3">{[
        ["Respostas", initial.guests.length], ["Presenças confirmadas", attendingCount], ["Presentes reservados", reservedCount],
      ].map(([title, count]) => <div key={title} className="paper rounded-2xl border border-olive/10 p-6"><p className="text-sm text-stone-500">{title}</p><p className="mt-2 font-serif text-4xl text-olive">{count}</p></div>)}</div>
      <nav aria-label="Seções do painel" className="mt-9 flex gap-2 overflow-x-auto border-b border-olive/20">{(["convidados", "itens", "convite"] as const).map((value) => <button key={value} onClick={() => { setTab(value); setMessage(""); }} className={`whitespace-nowrap px-5 py-4 text-sm font-semibold capitalize transition ${tab === value ? "border-b-2 border-olive text-olive" : "text-stone-500 hover:text-olive"}`}>{value}</button>)}</nav>
      {message && <p role="status" className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-olive">{message}</p>}

      {tab === "convidados" && <section className="mt-7"><h2 className="font-serif text-3xl">Confirmações</h2><p className="mt-2 text-sm text-stone-500">Nome, presença e escolhas de cada pessoa.</p><div className="mt-6 space-y-3">{initial.guests.map((guest) => <article key={guest.id} className="paper grid gap-4 rounded-2xl border border-olive/10 p-5 md:grid-cols-[1fr_1.5fr_auto_auto]"><div><h3 className="font-serif text-xl">{guest.name}</h3><p className="mt-1 text-xs text-stone-500">{new Date(guest.createdAt).toLocaleString("pt-BR")}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-olive">Presentes</p><p className="mt-1 text-sm">{guest.items.length ? guest.items.join(", ") : "Nenhum"}</p><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-olive">Para a mesa</p><p className="mt-1 text-sm">{guest.contributions.length ? guest.contributions.join(", ") : "Nenhum"}</p></div><span className={`h-fit rounded-full px-3 py-1.5 text-xs font-medium ${guest.attending ? "bg-[#E9EDE5] text-olive" : "bg-[#F7EBE5] text-rose"}`}>{guest.attending ? "Vai comparecer" : "Não poderá ir"}</span><button disabled={busy} onClick={() => { if (window.confirm(`Excluir a confirmação de ${guest.name}? Os presentes escolhidos voltarão a ficar disponíveis.`)) request(`/api/admin/guests/${guest.id}`, "DELETE"); }} className="h-fit text-xs text-rose hover:underline disabled:opacity-40">Excluir confirmação</button></article>)}{initial.guests.length === 0 && <p className="rounded-2xl border border-dashed border-olive/30 p-10 text-center text-stone-500">Ainda não há confirmações.</p>}</div></section>}

      {tab === "itens" && <section className="mt-7"><h2 className="font-serif text-3xl">Lista de presentes</h2><p className="mt-2 text-sm text-stone-500">Edite nomes, oculte itens ou adicione novos. Itens reservados não podem ser excluídos.</p><form onSubmit={async (e) => { e.preventDefault(); if (await request("/api/admin/items", "POST", { label: newItem })) setNewItem(""); }} className="mt-6 flex max-w-xl gap-3"><input value={newItem} onChange={(e) => setNewItem(e.target.value)} required minLength={2} maxLength={100} placeholder="Novo item" className="min-w-0 flex-1 rounded-xl border border-olive/20 bg-white px-4 py-3 outline-none focus:border-olive" /><button disabled={busy} className="rounded-xl bg-olive px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">Adicionar</button></form><div className="mt-7 grid gap-3 md:grid-cols-2">{initial.items.map((item) => <div key={item.id} className="paper flex flex-wrap items-center gap-3 rounded-xl border border-olive/10 p-4"><div className="min-w-0 flex-1">{editing === item.id ? <form onSubmit={async (e) => { e.preventDefault(); if (await request(`/api/admin/items/${item.id}`, "PATCH", { label })) setEditing(null); }} className="flex gap-2"><input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} required minLength={2} maxLength={100} className="min-w-0 flex-1 rounded-lg border border-olive/30 px-2 py-1" /><button disabled={busy} className="text-sm font-semibold text-olive">Salvar</button></form> : <p className="font-medium">{item.label}</p>}<p className="mt-1 text-xs text-stone-500">{item.reserved ? "Reservado" : "Disponível"} · {item.active ? "Visível" : "Oculto"}</p></div><button onClick={() => { setEditing(item.id); setLabel(item.label); }} className="text-xs text-olive hover:underline">Editar</button><button disabled={busy} onClick={() => request(`/api/admin/items/${item.id}`, "PATCH", { active: !item.active })} className="text-xs text-olive hover:underline">{item.active ? "Ocultar" : "Exibir"}</button><button disabled={busy || item.reserved} onClick={() => { if (window.confirm(`Excluir ${item.label}?`)) request(`/api/admin/items/${item.id}`, "DELETE"); }} className="text-xs text-rose hover:underline disabled:opacity-40">Excluir</button></div>)}</div></section>}

      {tab === "convite" && <section className="mt-7 max-w-2xl"><h2 className="font-serif text-3xl">Detalhes do convite</h2><p className="mt-2 text-sm text-stone-500">Deixe os campos em branco enquanto não estiverem definidos.</p><form onSubmit={(e) => { e.preventDefault(); request("/api/admin/event", "PATCH", event); }} className="paper mt-6 space-y-5 rounded-2xl border border-olive/10 p-6">{(["date", "time", "address", "note"] as const).map((key) => <label key={key} className="block text-sm font-medium">{{ date: "Data", time: "Horário", address: "Endereço", note: "Recado adicional" }[key]}{key === "note" ? <textarea value={event[key]} onChange={(e) => setEvent({ ...event, [key]: e.target.value })} maxLength={300} rows={3} className="mt-2 w-full rounded-xl border border-olive/20 bg-white px-4 py-3 outline-none focus:border-olive" /> : <input value={event[key]} onChange={(e) => setEvent({ ...event, [key]: e.target.value })} maxLength={key === "address" ? 200 : 80} placeholder={{ date: "Ex.: sábado, 15 de novembro", time: "Ex.: às 16h", address: "Rua, número, bairro e cidade", note: "" }[key]} className="mt-2 w-full rounded-xl border border-olive/20 bg-white px-4 py-3 outline-none focus:border-olive" />}</label>)}<button disabled={busy} className="rounded-full bg-olive px-6 py-3 font-semibold text-white disabled:opacity-60">Salvar detalhes</button></form></section>}
    </div>
  </main>;
}
