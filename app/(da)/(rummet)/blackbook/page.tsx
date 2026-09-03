import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  alternates: { canonical: "/blackbook" },
  title: "Skriv dig op · Ink & Art",
  description: "Studiets liste. Vi skriver kun, når der er en dato, et drop eller en plads.",
};

export default function BlackbookPage() {
  redirect("/#doer");
}
