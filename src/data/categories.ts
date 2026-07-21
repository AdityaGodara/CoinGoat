import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "bitcoin",
    name: "Bitcoin",
    description: "News and analysis on the original cryptocurrency.",
    color: "#F7931A",
  },
  {
    slug: "ethereum",
    name: "Ethereum",
    description: "Coverage of Ethereum, its upgrades, and its ecosystem.",
    color: "#627EEA",
  },
  {
    slug: "defi",
    name: "DeFi",
    description: "Decentralized finance protocols, yields, and infrastructure.",
    color: "#22C55E",
  },
  {
    slug: "nfts",
    name: "NFTs",
    description: "Digital collectibles, marketplaces, and on-chain culture.",
    color: "#A855F7",
  },
  {
    slug: "markets",
    name: "Markets",
    description: "Price action, trading data, and macro market moves.",
    color: "#0EA5E9",
  },
  {
    slug: "regulation",
    name: "Regulation",
    description: "Policy developments and regulatory shifts worldwide.",
    color: "#64748B",
  },
  {
    slug: "technology",
    name: "Technology",
    description: "Protocol upgrades, scaling research, and infrastructure.",
    color: "#EC4899",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
