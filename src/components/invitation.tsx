"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Botanicals, SmallFlower } from "./ornament";
import type { publicData } from "@/lib/data";

type Data = Awaited<ReturnType<typeof publicData>>;
const contributionOptions = ["Doce", "Salgado", "Refrigerante"] as const;

export function Invitation({ initial }: { initial: Data }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [items, setItems] = useState<string[]>([]);
  const [contributions, setContributions] = useState<string[]>([]);
  const [otherGift, setOtherGift] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const available = initial.items.filter((item) => item.available).length;

  useEffect(() => {
    const valid = new Set(initial.items.filter((item) => item.available).map((item) => item.id));
    setItems((old) => old.filter((id) => valid.has(id)));
  }, [initial.items]);

  function toggle(value: string, selected: string[], update: (values: string[]) => void) {
    update(selected.includes(value) ? selected.filter((x) => x !== value) : [...selected, value]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attending, itemIds: attending ? items : [], contributions: attending ? contributions : [], otherGift: attending ? otherGift : "" }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Não foi possível confirmar.");
        if (response.status === 409) router.refresh();
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setMessage("Falha de conexão. Confira sua internet e tente novamente.");
    } finally { setSaving(false); }
  }

  return <main className="overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-[760px] -z-10 bg-gradient-to-b from-[#F7EBE5] via-[#FBF6F0] to-cream" />
    <div className="grain pointer-events-none fixed inset-0 opacity-30 -z-10" />
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:py-8">
      <a href="#inicio" className="font-serif text-xl tracking-tight text-olive">Cilce <span className="text-rose">✳</span> casa nova</a>
      <a href="#confirmar" className="rounded-full border border-olive/40 px-5 py-2 text-sm font-medium text-olive transition hover:bg-olive hover:text-white">Confirmar presença</a>
    </header>

    <section id="inicio" className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-12 md:grid-cols-[1fr_1.05fr] md:gap-14 md:pb-28 md:pt-20">
      <div className="rise relative z-10">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-rose/25 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[.24em] text-rose"><span className="h-2 w-2 rounded-full bg-rose" /> Você está convidado</div>
        <h1 className="font-serif text-[clamp(3.6rem,7vw,6.4rem)] leading-[.99] tracking-[-.055em]">Um novo lar,<br /><em className="font-normal text-rose">novas histórias.</em></h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-stone-600">A Cilce está começando um capítulo especial e quer celebrar esse momento com você. Venha compartilhar carinho, risadas e a alegria de uma casa cheia de vida.</p>
        <a href="#confirmar" className="mt-9 inline-flex items-center gap-3 rounded-full bg-olive px-7 py-4 font-medium text-white shadow-lg shadow-olive/20 transition hover:-translate-y-1 hover:bg-[#566348]">Quero participar <span aria-hidden="true">↗</span></a>
      </div>
      <div className="rise-delay relative mx-auto w-full max-w-[520px]">
        <div className="absolute -left-9 top-12 h-44 w-44 rounded-full bg-blush/40 blur-3xl" />
        <div className="absolute -right-8 bottom-4 h-52 w-52 rounded-full bg-[#C8D1BC]/50 blur-3xl" />
        <div className="paper relative isolate aspect-[.92] rotate-[2deg] overflow-hidden rounded-[2.5rem] border border-white p-8 shadow-2xl shadow-[#7e6151]/10 sm:p-12">
          <div className="absolute inset-5 rounded-[2rem] border border-rose/20" />
          <SmallFlower className="petal absolute right-8 top-8 w-16 rotate-12 opacity-80" />
          <Botanicals className="float absolute bottom-0 right-0 w-[58%] opacity-90" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-[.35em] text-rose">Convite especial</p>
            <div><p className="mb-4 font-serif text-xl italic text-olive">com muito carinho,</p><h2 className="font-serif text-[clamp(3.5rem,8vw,6rem)] leading-none tracking-[-.06em]">Chá de<br /><span className="text-rose">Casa Nova</span></h2><div className="mt-6 h-px w-20 bg-rose/60" /><p className="mt-5 font-serif text-2xl italic text-olive">da Cilce</p></div>
            <p className="text-sm text-stone-500">Uma casa fica ainda mais bonita com gente querida por perto.</p>
          </div>
        </div>
        <div className="absolute -bottom-7 -left-7 z-10 -rotate-6 rounded-2xl bg-[#D4A69A] px-5 py-4 font-serif text-lg italic text-white shadow-lg sm:-left-12">esperamos você ♡</div>
      </div>
    </section>

    <section className="border-y border-olive/10 bg-white/50 py-14">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
        {[
          { icon: "◷", title: "Quando", value: initial.event.date || "Data a confirmar", detail: initial.event.time || "Horário a confirmar" },
          { icon: "⌂", title: "Onde", value: initial.event.address || "Endereço a confirmar", detail: "Em breve, todos os detalhes" },
          { icon: "♡", title: "O motivo", value: "Celebrar a nova casa", detail: "E ter você por perto" },
        ].map((card) => <div key={card.title} className="rounded-3xl border border-olive/10 bg-[#FFFCF8] p-7"><span className="text-3xl text-rose" aria-hidden="true">{card.icon}</span><p className="mt-5 text-xs font-semibold uppercase tracking-[.22em] text-olive">{card.title}</p><h3 className="mt-2 font-serif text-2xl">{card.value}</h3><p className="mt-2 text-sm text-stone-500">{card.detail}</p></div>)}
      </div>
      {initial.event.note && <p className="mx-auto mt-8 max-w-3xl px-6 text-center text-stone-600">{initial.event.note}</p>}
    </section>

    <section id="confirmar" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="mb-12 text-center"><p className="text-xs font-semibold uppercase tracking-[.3em] text-rose">Sua presença faz a diferença</p><h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Vamos celebrar juntas?</h2><p className="mx-auto mt-5 max-w-2xl leading-relaxed text-stone-600">Confirme sua presença e, se quiser, escolha um ou mais mimos da lista. Você também pode levar doce, salgado ou refrigerante.</p></div>
      {done ? <div role="status" className="paper mx-auto max-w-2xl rounded-[2rem] border border-rose/20 p-10 text-center sm:p-14"><SmallFlower className="mx-auto w-20" /><h3 className="mt-4 font-serif text-4xl">Obrigada, {name.trim()}!</h3><p className="mt-4 text-stone-600">{attending ? "Sua presença e suas escolhas foram confirmadas. Nos vemos em breve!" : "Sua resposta foi registrada. Você fará falta!"}</p></div> :
      <form onSubmit={submit} className="paper mx-auto max-w-4xl rounded-[2rem] border border-rose/15 p-6 sm:p-10">
        <div className="grid gap-7 md:grid-cols-[1fr_1fr]">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-olive">Seu nome</span><input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos chamar você?" className="w-full rounded-2xl border border-olive/20 bg-white px-5 py-4 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20" /></label>
          <fieldset><legend className="mb-2 text-sm font-semibold text-olive">Você vem?</legend><div className="flex gap-3"><label className={`flex-1 cursor-pointer rounded-2xl border px-4 py-4 text-center transition ${attending ? "border-olive bg-olive text-white" : "border-olive/20 bg-white"}`}><input type="radio" name="attending" className="sr-only" checked={attending} onChange={() => setAttending(true)} />Sim, estarei lá</label><label className={`flex-1 cursor-pointer rounded-2xl border px-4 py-4 text-center transition ${!attending ? "border-olive bg-olive text-white" : "border-olive/20 bg-white"}`}><input type="radio" name="attending" className="sr-only" checked={!attending} onChange={() => setAttending(false)} />Não poderei ir</label></div></fieldset>
        </div>
        {attending && <>
          <div className="mt-10 border-t border-olive/10 pt-9"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-serif text-2xl">Escolha seus presentes</h3><p className="mt-2 text-sm text-stone-500">Pode escolher quantos quiser. {available} {available === 1 ? "item disponível" : "itens disponíveis"}.</p></div><span className="rounded-full bg-[#E9EDE5] px-4 py-2 text-sm text-olive">{items.length} {items.length === 1 ? "selecionado" : "selecionados"}</span></div>
            <div className="mt-6 grid max-h-[350px] gap-2 overflow-y-auto rounded-2xl border border-olive/10 bg-white/70 p-3 sm:grid-cols-2 sm:p-4">{initial.items.map((item) => <label key={item.id} className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${item.available ? "cursor-pointer border-transparent hover:border-olive/20 hover:bg-cream" : "border-transparent text-stone-400"}`}><input type="checkbox" disabled={!item.available} checked={items.includes(item.id)} onChange={() => toggle(item.id, items, setItems)} className="h-5 w-5 shrink-0 accent-olive" /><span className="flex-1">{item.label}</span>{!item.available && <span className="text-xs">Reservado</span>}</label>)}{initial.items.length === 0 && <p className="p-4 text-sm text-stone-500">A lista de presentes será publicada em breve.</p>}</div>
            <label className="mt-6 block"><span className="block font-serif text-xl">Não encontrou o presente na lista?</span><span className="mt-1 block text-sm text-stone-500">Escreva o que gostaria de levar. Você também pode marcar itens acima.</span><input value={otherGift} onChange={(event) => setOtherGift(event.target.value)} maxLength={120} placeholder="Ex.: conjunto de toalhas" className="mt-3 w-full rounded-2xl border border-olive/20 bg-white px-5 py-4 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20" /></label>
          </div>
          <fieldset className="mt-9 border-t border-olive/10 pt-9"><legend className="font-serif text-2xl">Quer levar algo para a mesa?</legend><p className="mb-5 mt-2 text-sm text-stone-500">Opcional. Escolha uma ou mais opções.</p><div className="flex flex-wrap gap-3">{contributionOptions.map((value) => <label key={value} className={`cursor-pointer rounded-full border px-5 py-3 text-sm transition ${contributions.includes(value) ? "border-olive bg-olive text-white" : "border-olive/20 bg-white hover:border-olive"}`}><input type="checkbox" className="sr-only" checked={contributions.includes(value)} onChange={() => toggle(value, contributions, setContributions)} />{value}</label>)}</div></fieldset>
        </>}
        {message && <p role="alert" className="mt-7 rounded-xl bg-[#FFF0ED] px-4 py-3 text-sm text-[#9A4F48]">{message}</p>}
        <button disabled={saving} className="mt-9 w-full rounded-full bg-olive px-6 py-4 font-semibold text-white transition hover:bg-[#566348] disabled:cursor-wait disabled:opacity-60">{saving ? "Salvando sua resposta..." : "Confirmar minha resposta"}</button>
        <p className="mt-4 text-center text-xs text-stone-500">Seu nome e suas escolhas ficarão visíveis apenas para a organização do evento.</p>
      </form>}
    </section>
    <footer className="border-t border-olive/10 px-6 py-9 text-center text-sm text-stone-500">Feito com carinho para o Chá de Casa Nova da Cilce <span className="text-rose">♡</span></footer>
  </main>;
}
