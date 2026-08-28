import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProduktFlade } from "@/components/rummet/ProduktFlade";
import {
  artistById,
  loadHouse,
  shelfVaerker,
  vaerkByEditionHandle,
  vaerkLabel,
} from "@/lib/content";
import { productByHandle } from "@/lib/storefront";

export const dynamicParams = true;

export function generateStaticParams() {
  return shelfVaerker(loadHouse().vaerker).map((v) => ({ handle: v.edition_ref }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const house = loadHouse();
  const vaerk = vaerkByEditionHandle(house.vaerker, handle);
  if (!vaerk) return { title: "Mærket · Ink & Art" };
  const artist = artistById(house.artists, vaerk.artist);
  return {
    title: `${vaerkLabel(vaerk, artist)} · Mærket · Ink & Art`,
    alternates: { canonical: `/maerket/${vaerk.edition_ref}` },
  };
}

export default async function ProduktPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const house = loadHouse();
  const vaerk = vaerkByEditionHandle(house.vaerker, handle);
  if (!vaerk) notFound();
  const artist = artistById(house.artists, vaerk.artist);
  const product = await productByHandle(vaerk.edition_ref);
  return <ProduktFlade vaerk={vaerk} artist={artist} product={product} />;
}
