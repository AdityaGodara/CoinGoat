import type { Author } from "@/types";

export const authors: Author[] = [
  {
    id: "auth-elena-vasquez",
    slug: "elena-vasquez",
    name: "Elena Vasquez",
    avatar: "/images/avatars/elena-vasquez.svg",
    title: "Senior Markets Reporter",
    bio: "Elena covers price action and macro trends across major crypto assets, with a decade of experience reporting on financial markets before moving into digital assets.",
    social: {
      twitter: "https://twitter.com/elenavasquez",
      linkedin: "https://linkedin.com/in/elenavasquez",
    },
  },
  {
    id: "auth-marcus-chen",
    slug: "marcus-chen",
    name: "Marcus Chen",
    avatar: "/images/avatars/marcus-chen.svg",
    title: "DeFi & Protocols Editor",
    bio: "Marcus tracks the decentralized finance landscape, from lending protocols to liquid staking, and has a background in smart contract auditing.",
    social: {
      twitter: "https://twitter.com/marcuschen",
      website: "https://marcuschen.dev",
    },
  },
  {
    id: "auth-priya-nair",
    slug: "priya-nair",
    name: "Priya Nair",
    avatar: "/images/avatars/priya-nair.svg",
    title: "Regulation Correspondent",
    bio: "Priya reports on the evolving policy landscape for digital assets, translating dense regulatory filings into coverage that traders and builders can act on.",
    social: {
      twitter: "https://twitter.com/priyanair",
      linkedin: "https://linkedin.com/in/priyanair",
    },
  },
  {
    id: "auth-jordan-blake",
    slug: "jordan-blake",
    name: "Jordan Blake",
    avatar: "/images/avatars/jordan-blake.svg",
    title: "NFT & Culture Writer",
    bio: "Jordan writes about digital collectibles, on-chain art, and the communities forming around them, with a focus on where culture and crypto intersect.",
    social: {
      twitter: "https://twitter.com/jordanblake",
    },
  },
  {
    id: "auth-sofia-marchetti",
    slug: "sofia-marchetti",
    name: "Sofia Marchetti",
    avatar: "/images/avatars/sofia-marchetti.svg",
    title: "Technology Reporter",
    bio: "Sofia covers protocol upgrades, scaling research, and the infrastructure layer of crypto, with a background in distributed systems engineering.",
    social: {
      linkedin: "https://linkedin.com/in/sofiamarchetti",
      website: "https://sofiamarchetti.com",
    },
  },
  {
    id: "auth-david-okafor",
    slug: "david-okafor",
    name: "David Okafor",
    avatar: "/images/avatars/david-okafor.svg",
    title: "Chief Markets Analyst",
    bio: "David leads market analysis coverage, drawing on a background in quantitative trading to explain what's actually moving prices.",
    social: {
      twitter: "https://twitter.com/davidokafor",
      linkedin: "https://linkedin.com/in/davidokafor",
    },
  },
  {
    id: "auth-ava-thompson",
    slug: "ava-thompson",
    name: "Ava Thompson",
    avatar: "/images/avatars/ava-thompson.svg",
    title: "Breaking News Editor",
    bio: "Ava leads breaking news coverage, getting fast, accurate reporting out the door the moment markets move.",
    social: {
      twitter: "https://twitter.com/avathompson",
    },
  },
  {
    id: "auth-ren-takahashi",
    slug: "ren-takahashi",
    name: "Ren Takahashi",
    avatar: "/images/avatars/ren-takahashi.svg",
    title: "Layer-2 & Scaling Reporter",
    bio: "Ren covers the rollup ecosystem and scaling research, having previously worked as a protocol engineer before moving into journalism.",
    social: {
      twitter: "https://twitter.com/rentakahashi",
      website: "https://rentakahashi.dev",
    },
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((author) => author.slug === slug);
}
