import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/db-types";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Stationery Categories | WAGI - STATIONARIES" },
      {
        name: "description",
        content:
          "Explore WAGI categories: whiteboard supplies, Casio calculators, mathematical tables and sets, pens and writing, art supplies and more.",
      },
      { property: "og:title", content: "Stationery Categories | WAGI - STATIONARIES" },
      {
        property: "og:description",
        content: "Find exactly what you need — organised by category.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setCategories(data ?? []);
      const { data: products } = await supabase
        .from("products")
        .select("category_id")
        .eq("is_active", true);
      const map: Record<string, number> = {};
      for (const p of products ?? []) {
        if (p.category_id) map[p.category_id] = (map[p.category_id] ?? 0) + 1;
      }
      setCounts(map);
    })();
  }, []);

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>{" "}
        / <span className="text-foreground">Categories</span>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">Shop by category</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything from whiteboard markers to scientific calculators.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/categories/$slug"
            params={{ slug: c.slug }}
            className="group flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-elevated"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl">
              {c.icon ?? "✏️"}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold group-hover:text-primary">{c.name}</span>
              {c.description && (
                <span className="mt-0.5 block line-clamp-2 text-sm text-muted-foreground">
                  {c.description}
                </span>
              )}
              <span className="mt-1 block text-xs text-muted-foreground">
                {counts[c.id] ?? 0} product(s)
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
