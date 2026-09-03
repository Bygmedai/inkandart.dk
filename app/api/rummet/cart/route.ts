import { cookies } from "next/headers";
import { cartUrl } from "@/lib/commerce";
import { addCartLine, cartQuantity, readCartById } from "@/lib/storefront";

export const dynamic = "force-dynamic";

const COOKIE = "rummet_cart";
const MAX_AGE = 60 * 60 * 24 * 14;

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET() {
  try {
    const jar = await cookies();
    const id = jar.get(COOKIE)?.value || "";
    if (!id) return json({ count: 0 });
    const cart = await readCartById(id);
    const count = cart && cart.totalQuantity > 0 ? cart.totalQuantity : await cartQuantity(id);
    if (count < 1) return json({ count: 0 });
    return json({
      count,
      checkoutUrl: cart?.checkoutUrl || "",
    });
  } catch {
    return json({ count: 0 });
  }
}

function redirectTo(url: string, cartId?: string): Response {
  const headers = new Headers();
  headers.set("Location", url);
  if (cartId) {
    headers.append(
      "Set-Cookie",
      `${COOKIE}=${encodeURIComponent(cartId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`,
    );
  }
  return new Response(null, { status: 303, headers });
}

export async function POST(req: Request) {
  const fallback = new URL("/shop", req.url).toString();
  try {
    const form = await req.formData();
    const variantId = String(form.get("variantId") || "").trim();
    if (!variantId) return redirectTo(fallback);
    const jar = await cookies();
    const existing = jar.get(COOKIE)?.value || "";
    const cart = await addCartLine(existing || null, variantId);
    if (cart?.checkoutUrl) {
      return redirectTo(cart.checkoutUrl, cart.id);
    }
    const numeric = variantId.replace(/\D/g, "");
    if (numeric) return redirectTo(cartUrl(numeric));
    return redirectTo(fallback);
  } catch {
    return redirectTo(fallback);
  }
}
