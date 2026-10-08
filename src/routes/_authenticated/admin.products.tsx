import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/catalog";
import { resolveImage, useCatalog } from "@/lib/catalog";
import { adminField, slugify, uploadImage } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: Products,
});

type Row = Tables<"products">;
interface V { label: string; price: number }

function Products() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const [search, setSearch] = useState("");
  const q = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["catalog"] });
  };
  const del = async (p: Row) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    refresh();
  };
  const toggleStock = async (p: Row) => {
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };
  const rows = (q.data ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Products</h1>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={`${adminField} w-44`} />
          <Button onClick={() => setEdit("new")}><Plus /> Add product</Button>
        </div>
      </div>
      {q.isLoading ? <p className="text-muted-foreground">Loading…</p> : (
        <ul className="space-y-2">
          {rows.map((p) => {
            const vs = (p.variants as unknown as V[]) ?? [];
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
                <img src={resolveImage(p.image_url)} alt="" className="size-14 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate font-medium">{p.name}</b>
                  <span className="text-sm text-muted-foreground">{p.category_slug ?? "—"} · {vs.length ? `from ${formatPrice(Math.min(...vs.map((v) => v.price)))}` : "no sizes"}{p.featured ? " · Featured" : ""}</span>
                </span>
                <button onClick={() => toggleStock(p)} className={`rounded-full px-3 py-1 text-xs font-medium ${p.in_stock ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {p.in_stock ? "In stock" : "Out of stock"}
                </button>
                <button onClick={() => setEdit(p)} className="p-2 text-muted-foreground hover:text-primary" aria-label="Edit"><Pencil className="size-4" /></button>
                <button onClick={() => del(p)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="size-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{edit === "new" ? "Add product" : "Edit product"}</DialogTitle></DialogHeader>
          {edit !== null && <ProductForm row={edit === "new" ? null : edit} nextOrder={q.data?.length ?? 0} onDone={() => { setEdit(null); refresh(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ row, nextOrder, onDone }: { row: Row | null; nextOrder: number; onDone: () => void }) {
  const { categories } = useCatalog();
  const [image, setImage] = useState<string | null>(row?.image_url ?? null);
  const [gallery, setGallery] = useState<string[]>(row?.gallery ?? []);
  const [variants, setVariants] = useState<V[]>(((row?.variants as unknown as V[]) ?? []).length ? (row!.variants as unknown as V[]) : [{ label: "250g", price: 0 }]);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null, main: boolean) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage));
      if (main) setImage(urls[0]!);
      else setGallery((g) => [...g, ...urls].slice(0, 8));
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const name = s("name");
    const slug = slugify(s("slug") || name);
    const vs = variants.filter((v) => v.label.trim() && v.price > 0).map((v) => ({ label: v.label.trim(), price: Math.round(v.price) }));
    if (!name || !slug) { toast.error("Name is required"); return; }
    if (!vs.length) { toast.error("Add at least one size with a price"); return; }
    const data = {
      name, slug,
      category_slug: s("category") || null,
      image_url: image,
      gallery: image ? [image, ...gallery.filter((g) => g !== image)] : gallery,
      variants: vs,
      in_stock: f.get("in_stock") === "on",
      featured: f.get("featured") === "on",
      badge: s("badge") || null,
      short: s("short"), description: s("description"), ingredients: s("ingredients"), storage: s("storage"),
      sort_order: Number(s("sort_order")) || 0,
    };
    setBusy(true);
    const { error } = row
      ? await supabase.from("products").update(data).eq("id", row.id)
      : await supabase.from("products").insert(data);
    setBusy(false);
    if (error) { toast.error(error.message.includes("duplicate") ? "That URL slug is already used" : error.message); return; }
    toast.success("Product saved");
    onDone();
  };

  const L = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{children}</label>;
  const ta = `${adminField} h-auto py-2`;

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><L htmlFor="p-name">Name *</L><input id="p-name" name="name" required defaultValue={row?.name} className={adminField} /></div>
        <div><L htmlFor="p-slug">URL slug</L><input id="p-slug" name="slug" defaultValue={row?.slug} placeholder="auto from name" className={adminField} /></div>
        <div>
          <L htmlFor="p-cat">Category</L>
          <select id="p-cat" name="category" defaultValue={row?.category_slug ?? ""} className={adminField}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <L htmlFor="p-badge">Badge</L>
          <select id="p-badge" name="badge" defaultValue={row?.badge ?? ""} className={adminField}>
            <option value="">None</option><option>Bestseller</option><option>New</option><option>Premium</option>
          </select>
        </div>
      </div>

      <div>
        <L>Sizes & prices *</L>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label="Size" value={v.label} onChange={(e) => setVariants((a) => a.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="e.g. 500g" className={adminField} />
              <input aria-label="Price" type="number" min={0} value={v.price || ""} onChange={(e) => setVariants((a) => a.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))} placeholder="Price Rs." className={adminField} />
              <button type="button" onClick={() => setVariants((a) => a.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove size"><X className="size-4" /></button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => setVariants((a) => [...a, { label: "", price: 0 }])}><Plus /> Add size</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <L>Main image</L>
          <div className="flex items-center gap-3">
            <img src={resolveImage(image)} alt="" className="size-16 rounded object-cover" />
            <input type="file" accept="image/*" onChange={(e) => upload(e.target.files, true)} className="min-w-0 text-sm" />
          </div>
        </div>
        <div>
          <L>Extra gallery images</L>
          <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files, false)} className="text-sm" />
          <div className="mt-2 flex flex-wrap gap-2">
            {gallery.filter((g) => g !== image).map((g) => (
              <span key={g} className="relative">
                <img src={resolveImage(g)} alt="" className="size-12 rounded object-cover" />
                <button type="button" onClick={() => setGallery((a) => a.filter((x) => x !== g))} className="absolute -top-1.5 -right-1.5 rounded-full bg-card p-0.5 shadow" aria-label="Remove image"><X className="size-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div><L htmlFor="p-short">Short description</L><input id="p-short" name="short" defaultValue={row?.short} className={adminField} /></div>
      <div><L htmlFor="p-desc">Description</L><textarea id="p-desc" name="description" rows={3} defaultValue={row?.description} className={ta} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><L htmlFor="p-ing">Ingredients</L><textarea id="p-ing" name="ingredients" rows={2} defaultValue={row?.ingredients} className={ta} /></div>
        <div><L htmlFor="p-sto">Storage</L><textarea id="p-sto" name="storage" rows={2} defaultValue={row?.storage} className={ta} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="in_stock" defaultChecked={row?.in_stock ?? true} className="size-4 accent-primary" /> In stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={row?.featured ?? false} className="size-4 accent-primary" /> Featured on homepage</label>
        <label className="flex items-center gap-2">Sort order <input name="sort_order" type="number" defaultValue={row?.sort_order ?? nextOrder} className={`${adminField} w-20`} /></label>
      </div>
      <Button type="submit" block disabled={busy}>{busy ? "Please wait…" : "Save product"}</Button>
    </form>
  );
}
