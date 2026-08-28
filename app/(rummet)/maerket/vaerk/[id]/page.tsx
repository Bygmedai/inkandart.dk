import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProduktFlade } from "@/components/rummet/ProduktFlade";
import {
  artistById,
  loadHouse,
  shelfVaerker,
  vaerkById,
  vaerkLabel,
} from "@/lib/content";
import { productByHandle } from "@/lib/storefront";

export const dynamicParams = true;

export function generateStaticParams() {
  return shelfVaerker(loadHouse().vaerker).map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const house = loadHouse();
  const vaerk = vaerkById(house.vaerker, id);
  if (!vaerk?.edition_ref) return { title: "Mærket · Ink & Art" };
  const artist = artistById(house.artists, vaerk.artist);
  return {
    title: `${vaerkLabel(vaerk, artist)} · Mærket · Ink & Art`,
    alternates: { canonical: `/maerket/${vaerk.edition_ref}` },
  };
}

export default async function VaerkProduktPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = loadHouse();
  const vaerk = vaerkById(house.vaerker, id);
  if (!vaerk?.edition_ref) notFound();
  const artist = artistById(house.artists, vaerk.artist);
  const product = await productByHandle(vaerk.edition_ref);
  return <ProduktFlade vaerk={vaerk} artist={artist} product={product} />;
}
