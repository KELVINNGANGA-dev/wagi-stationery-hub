import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | WAGI - STATIONARIES" },
      { name: "description", content: "Manage products, orders and inventory for WAGI." },
      { property: "og:title", content: "Admin Dashboard | WAGI - STATIONARIES" },
      { property: "og:description", content: "Internal store management area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();

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

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Manage the storefront. More tools — products, inventory, orders and reports — are coming
        next.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/categories"
          className="group rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-elevated"
        >
          <span className="block font-semibold group-hover:text-primary">Categories</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Create, edit, reorder, hide or delete storefront categories.
          </span>
        </Link>
      </div>
    </div>
  );
}
