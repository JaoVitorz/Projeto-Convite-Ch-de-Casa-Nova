import { Invitation } from "@/components/invitation";
import { publicData } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  let data: Awaited<ReturnType<typeof publicData>>;
  try {
    data = await publicData();
  } catch (error) {
    console.error("Falha ao carregar convite", error);
    return <main className="min-h-screen grid place-items-center p-6 text-center"><div className="paper rounded-3xl p-10 max-w-lg"><h1 className="font-serif text-3xl">Chá de Casa Nova da Cilce</h1><p className="mt-4 text-stone-600">O convite está temporariamente indisponível. Tente novamente em alguns instantes.</p></div></main>;
  }
  return <Invitation initial={data} />;
}
