import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProduktFlade } from "@/components/rummet/ProduktFlade";
import { loadHylden } from "@/lib/content";
import { productByHandle, vareFromCollectionProduct } from "@/lib/storefront";

export const dynamicParams = true;

export function generateStaticParams() {
  return loadHylden().map((v) => ({ handle: v.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const live = await productByHandle(handle);
  if (live?.title) {
    return {
      title: `${live.title} · Mærket · Ink & Art`,
      alternates: { canonical: `/maerket/${live.handle}` },
    };
  }
  const vare = loadHylden().find((v) => v.handle === handle);
  if (!vare) return { title: "Mærket · Ink & Art" };
  return {
    title: `${vare.titel} · Mærket · Ink & Art`,
    description: vare.linje || undefined,
    alternates: { canonical: `/maerket/${vare.handle}` },
  };
}

export default async function ProduktPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const live = await productByHandle(handle);
  if (live) {
    if (!live.availableForSale || !live.variantGid) notFound();
    return <ProduktFlade vare={vareFromCollectionProduct(live)} product={live} />;
  }
  const vare = loadHylden().find((v) => v.handle === handle);
  if (!vare) notFound();
  return <ProduktFlade vare={vare} product={null} />;
}
