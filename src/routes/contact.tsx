import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact WAGI - STATIONARIES | Latema Road, Nairobi" },
      {
        name: "description",
        content:
          "Call 0705734326, email wagistationaries2026@gmail.com or visit our shop on Latema Road, Nairobi.",
      },
      { property: "og:title", content: "Contact WAGI - STATIONARIES" },
      { property: "og:description", content: "Talk to us about bulk orders, school lists and deliveries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const details = [
    { icon: MapPin, label: "Visit the shop", value: STORE.fullAddress },
    { icon: Phone, label: "Call us", value: STORE.phone, href: `tel:${STORE.phoneIntl}` },
    { icon: Mail, label: "Email", value: STORE.email, href: `mailto:${STORE.email}` },
    { icon: Clock, label: "Opening hours", value: STORE.hours },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Questions about bulk school orders, deliveries or payments? Our team is happy to help.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {details.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="rounded-2xl border bg-card p-5 shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft">
              <Icon className="size-5 text-primary" />
            </span>
            <h2 className="mt-3 text-sm font-semibold">{label}</h2>
            {href ? (
              <a href={href} className="mt-1 block break-all text-sm text-primary hover:underline">
                {value}
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="lg" className="rounded-full">
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 size-4" /> Chat on WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <a href={`tel:${STORE.phoneIntl}`}>Call {STORE.phone}</a>
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border shadow-card">
        <iframe
          title="WAGI - STATIONARIES location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.mapsQuery)}&output=embed`}
          loading="lazy"
          className="h-80 w-full border-0"
        />
      </div>
    </div>
  );
}
