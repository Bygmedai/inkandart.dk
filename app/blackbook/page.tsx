import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  alternates: { canonical: "/blackbook" },
  title: "Blackbook · Ink & Art",
  description: "Studiets liste. Vi sender kun natten.",
};

export default function BlackbookPage() {
  redirect("/#doer");
}
