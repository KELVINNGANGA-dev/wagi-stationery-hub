import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Category } from "@/lib/db-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin_/categories")({
  head: () => ({
    meta: [
      { title: "Manage Categories | WAGI - STATIONARIES" },
      {
        name: "description",
        content: "Create, edit, reorder and remove storefront categories for WAGI stationery.",
      },
      { property: "og:title", content: "Manage Categories | WAGI - STATIONARIES" },
      { property: "og:description", content: "Internal category management for WAGI staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCategoriesPage,
});

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(60, { message: "Name must be under 60 characters" }),
  slug: z
    .string()
    .trim()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(60, { message: "Slug must be under 60 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Use lowercase letters, numbers and hyphens only",
    }),
  description: z
    .string()
    .trim()
    .max(300, { message: "Description must be under 300 characters" })
    .optional()
    .or(z.literal("")),
  icon: z.string().trim().max(8, { message: "Use a single emoji or short icon" }).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof categorySchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = { name: "", slug: "", description: "", icon: "", is_active: true };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const PAGE_SIZE = 8;

function AdminCategoriesPage() {
  const { isAdmin, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"order" | "name" | "newest" | "products">("order");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setFetching(true);
    const [{ data, error }, { data: products }] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order").order("name"),
      supabase.from("products").select("category_id"),
    ]);
    if (error) toast.error("Could not load categories");
    setCategories(data ?? []);
    const map: Record<string, number> = {};
    for (const p of products ?? []) {
      if (p.category_id) map[p.category_id] = (map[p.category_id] ?? 0) + 1;
    }
    setCounts(map);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const reorderEnabled = sortBy === "order" && status === "all" && search.trim() === "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = categories.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q);
      const matchesStatus =
        status === "all" || (status === "active" ? c.is_active : !c.is_active);
      return matchesQuery && matchesStatus;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "products") return (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });
    return list;
  }, [categories, counts, search, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, status, sortBy]);


  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="h-40 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is reserved for WAGI staff accounts.
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link to="/">Back to store</Link>
        </Button>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setSlugTouched(false);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "",
      is_active: category.is_active,
    });
    setErrors({});
    setSlugTouched(true);
    setDialogOpen(true);
  };

  const submit = async () => {
    const parsed = categorySchema.safeParse(form);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    const values = parsed.data;
    const duplicate = categories.some(
      (c) => c.slug === values.slug && c.id !== editing?.id,
    );
    if (duplicate) {
      setErrors({ slug: "Another category already uses this slug" });
      return;
    }

    setBusy(true);
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description ? values.description : null,
      icon: values.icon ? values.icon : null,
      is_active: values.is_active,
    };

    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Category updated");
    } else {
      const nextOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;
      const { error } = await supabase
        .from("categories")
        .insert({ ...payload, sort_order: nextOrder });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Category created");
    }
    setDialogOpen(false);
    await load();
  };

  const toggleActive = async (category: Category, isActive: boolean) => {
    setBusy(true);
    const { error } = await supabase
      .from("categories")
      .update({ is_active: isActive })
      .eq("id", category.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isActive ? `${category.name} is live` : `${category.name} hidden from store`);
    await load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    if (!a || !b) return;

    // Optimistic reorder
    const reordered = [...categories];
    reordered[index] = b;
    reordered[target] = a;
    setCategories(reordered);

    setBusy(true);
    const [r1, r2] = await Promise.all([
      supabase.from("categories").update({ sort_order: target }).eq("id", a.id),
      supabase.from("categories").update({ sort_order: index }).eq("id", b.id),
    ]);
    setBusy(false);
    if (r1.error || r2.error) {
      toast.error("Could not save the new order");
    }
    await load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const inUse = counts[deleteTarget.id] ?? 0;
    if (inUse > 0) {
      toast.error(`${deleteTarget.name} still has ${inUse} product(s). Move them first.`);
      setDeleteTarget(null);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget.id);
    setBusy(false);
    setDeleteTarget(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category deleted");
    await load();
  };

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
        <Link to="/admin" className="hover:text-primary">
          Admin
        </Link>{" "}
        / <span className="text-foreground">Categories</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control what customers see in the shop menu, and the order it appears in.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/admin">
              <ArrowLeft className="mr-1 size-4" /> Dashboard
            </Link>
          </Button>
          <Button onClick={openCreate} className="rounded-full">
            <Plus className="mr-1 size-4" /> New category
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, slug or description"
            aria-label="Search categories"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Hidden only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]" aria-label="Sort categories">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Sort order</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="products">Most products</SelectItem>
          </SelectContent>
        </Select>
        {(search || status !== "all" || sortBy !== "order") && (
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setSortBy("order");
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {!reorderEnabled && !fetching && (
        <p className="mt-2 text-xs text-muted-foreground">
          Reordering is available when search and filters are cleared and sorting is set to
          “Sort order”.
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-card">
        {fetching ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No categories yet. Create your first one.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No categories match your search or filters.
          </div>
        ) : (
          <ul className="divide-y">
            {pageItems.map((c) => {
              const index = categories.findIndex((x) => x.id === c.id);
              return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-lg">
                  {c.icon ?? "✏️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{c.name}</span>
                    {!c.is_active && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    /{c.slug} · {counts[c.id] ?? 0} product(s)
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Move ${c.name} up`}
                    disabled={busy || index === 0}
                    onClick={() => void move(index, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Move ${c.name} down`}
                    disabled={busy || index === categories.length - 1}
                    onClick={() => void move(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Switch
                    checked={c.is_active}
                    disabled={busy}
                    aria-label={`Toggle ${c.name} visibility`}
                    onCheckedChange={(v) => void toggleActive(c, v)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${c.name}`}
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${c.name}`}
                    onClick={() => setDeleteTarget(c)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Categories group products in the shop menu and on the storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                maxLength={60}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: slugTouched ? f.slug : slugify(name),
                  }));
                }}
                placeholder="Whiteboard Supplies"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                maxLength={60}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                placeholder="whiteboard-supplies"
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">Icon</Label>
              <Input
                id="cat-icon"
                value={form.icon ?? ""}
                maxLength={8}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🖊️"
              />
              {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description ?? ""}
                maxLength={300}
                rows={3}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Markers, dusters, cleaning fluid and refill ink."
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Visible in store</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to hide without deleting.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                aria-label="Visible in store"
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={busy}>
              {busy && <Loader2 className="mr-1 size-4 animate-spin" />}
              {editing ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Categories that still hold products cannot be deleted —
              hide them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
