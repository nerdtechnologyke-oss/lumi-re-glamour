import { createFileRoute } from "@tanstack/react-router";
import LumiereHome from "@/components/LumiereHome";

export const Route = createFileRoute("/")({
  component: LumiereHome,
  head: () => ({
    meta: [
      { title: "LUMIÈRE Nail Studio · Luxury Nail Artistry in Nairobi" },
      { name: "description", content: "Premium nail artistry crafted for melanin-rich skin tones. Black-owned studio in Nairobi CBD. Book via WhatsApp." },
      { property: "og:title", content: "LUMIÈRE Nail Studio · Nairobi" },
      { property: "og:description", content: "Where Brown Skin Meets Brilliant Art. Editorial nail artistry in Nairobi." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=85" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
