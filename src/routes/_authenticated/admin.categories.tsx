import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage, useCatalog, type Category } from "@/lib/catalog";
import { adminField, slugify, uploadImage } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: Categories,
});

function Categories() {
  const { categories, countIn, isPreview } = useCatalog();
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Category | "new" | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["catalog"] });

  const del = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Its products will become uncategorised.`)) return;
    const { error } = await supabase.from("categories").delete().eq("slug", c.slug);
    if (error) { toast.error(error.message); return; }
    toast.success("Category deleted");
    refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl">Categories</h1>
        <Button onClick={() => setEdit("new")}><Plus /> Add category</Button>
      </div>
      {isPreview && <p role="status" className="mb-5 rounded-lg border border-border bg-secondary p-4 text-sm">Showing preview categories. Set up the live catalog database before editing categories.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <img src={c.image} alt="" className="size-14 rounded object-cover" />
            <span className="min-w-0 flex-1"><b className="block truncate font-medium">{c.name}</b><span className="text-sm text-muted-foreground">{countIn(c.slug)} products · /{c.slug}</span></span>
            <button onClick={() => setEdit(c)} className="p-2 text-muted-foreground hover:text-primary" aria-label="Edit"><Pencil className="size-4" /></button>
            <button onClick={() => del(c)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
      <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit === "new" ? "Add category" : "Edit category"}</DialogTitle></DialogHeader>
          {edit !== null && <CategoryForm cat={edit === "new" ? null : edit} nextOrder={categories.length} onDone={() => { setEdit(null); refresh(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({ cat, nextOrder, onDone }: { cat: Category | null; nextOrder: number; onDone: () => void }) {
  const [image, setImage] = useState<string | null>(cat?.imageRaw ?? null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try { setImage(await uploadImage(file)); } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    const slug = slugify(String(f.get("slug")) || name);
    if (!name || !slug) { toast.error("Name is required"); return; }
    const row = { slug, name, short: String(f.get("short")).trim() || name, image_url: image, sort_order: Number(f.get("sort_order")) || 0 };
    setBusy(true);
    const { error } = cat
      ? await supabase.from("categories").update(row).eq("slug", cat.slug)
      : await supabase.from("categories").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Category saved");
    onDone();
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div><label className="mb-1.5 block text-sm font-medium" htmlFor="c-name">Name</label><input id="c-name" name="name" required defaultValue={cat?.name} className={adminField} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="mb-1.5 block text-sm font-medium" htmlFor="c-short">Short name</label><input id="c-short" name="short" defaultValue={cat?.short} className={adminField} /></div>
        <div><label className="mb-1.5 block text-sm font-medium" htmlFor="c-slug">URL slug</label><input id="c-slug" name="slug" defaultValue={cat?.slug} placeholder="auto" className={adminField} /></div>
      </div>
      <div><label className="mb-1.5 block text-sm font-medium" htmlFor="c-order">Sort order</label><input id="c-order" name="sort_order" type="number" defaultValue={cat?.sortOrder ?? nextOrder} className={adminField} /></div>
      <div>
        <span className="mb-1.5 block text-sm font-medium">Image</span>
        <div className="flex items-center gap-3">
          <img src={resolveImage(image)} alt="" className="size-16 rounded object-cover" />
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
        </div>
      </div>
      <Button type="submit" block disabled={busy}>{busy ? "Please wait…" : "Save"}</Button>
    </form>
  );
}
