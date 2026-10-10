"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "Não foi possível entrar."); return; }
      router.replace("/admin"); router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setBusy(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#F7EBE5] via-cream to-[#E9EDE5] p-6"><div className="paper w-full max-w-md rounded-[2rem] border border-white p-8 sm:p-10"><a href="/" className="text-sm text-olive hover:underline">← Voltar ao convite</a><p className="mt-9 text-xs font-bold uppercase tracking-[.3em] text-rose">Área reservada</p><h1 className="mt-3 font-serif text-4xl">Painel da Cilce</h1><p className="mt-3 text-sm leading-relaxed text-stone-500">Entre para ver as confirmações e organizar a lista do chá.</p><form onSubmit={submit} className="mt-9 space-y-5"><label className="block text-sm font-medium">Usuário<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-olive/20 bg-white px-4 py-3 outline-none focus:border-olive" /></label><label className="block text-sm font-medium">Senha<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-olive/20 bg-white px-4 py-3 outline-none focus:border-olive" /></label>{error && <p role="alert" className="rounded-xl bg-[#FFF0ED] p-3 text-sm text-[#9A4F48]">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-olive px-5 py-3.5 font-semibold text-white transition hover:bg-[#566348] disabled:opacity-60">{busy ? "Entrando..." : "Entrar"}</button></form></div></main>;
}
