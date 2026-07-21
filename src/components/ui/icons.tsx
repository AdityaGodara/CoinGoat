import {
  MagnifyingGlassIcon,
  ListIcon,
  XIcon,
  SunIcon as PhosphorSunIcon,
  MoonIcon as PhosphorMoonIcon,
  ArrowUpIcon as PhosphorArrowUpIcon,
  XLogoIcon,
  LinkedinLogoIcon,
  GlobeIcon,
  LinkSimpleIcon,
  ClockIcon as PhosphorClockIcon,
  CaretLeftIcon as PhosphorCaretLeftIcon,
  CaretRightIcon as PhosphorCaretRightIcon,
  TrendUpIcon as PhosphorTrendUpIcon,
  TrendDownIcon as PhosphorTrendDownIcon,
  ShareNetworkIcon,
  CopyIcon as PhosphorCopyIcon,
} from "@phosphor-icons/react/ssr";

interface IconProps {
  className?: string;
}

const WEIGHT = "regular" as const;

export function SearchIcon({ className }: IconProps) {
  return <MagnifyingGlassIcon className={className} weight={WEIGHT} />;
}

export function MenuIcon({ className }: IconProps) {
  return <ListIcon className={className} weight={WEIGHT} />;
}

export function CloseIcon({ className }: IconProps) {
  return <XIcon className={className} weight={WEIGHT} />;
}

export function SunIcon({ className }: IconProps) {
  return <PhosphorSunIcon className={className} weight={WEIGHT} />;
}

export function MoonIcon({ className }: IconProps) {
  return <PhosphorMoonIcon className={className} weight={WEIGHT} />;
}

export function ArrowUpIcon({ className }: IconProps) {
  return <PhosphorArrowUpIcon className={className} weight={WEIGHT} />;
}

export function TwitterIcon({ className }: IconProps) {
  return <XLogoIcon className={className} weight={WEIGHT} />;
}

export function LinkedinIcon({ className }: IconProps) {
  return <LinkedinLogoIcon className={className} weight={WEIGHT} />;
}

export function WebsiteIcon({ className }: IconProps) {
  return <GlobeIcon className={className} weight={WEIGHT} />;
}

export function LinkIcon({ className }: IconProps) {
  return <LinkSimpleIcon className={className} weight={WEIGHT} />;
}

export function ClockIcon({ className }: IconProps) {
  return <PhosphorClockIcon className={className} weight={WEIGHT} />;
}

export function CaretLeftIcon({ className }: IconProps) {
  return <PhosphorCaretLeftIcon className={className} weight={WEIGHT} />;
}

export function CaretRightIcon({ className }: IconProps) {
  return <PhosphorCaretRightIcon className={className} weight={WEIGHT} />;
}

export function TrendUpIcon({ className }: IconProps) {
  return <PhosphorTrendUpIcon className={className} weight={WEIGHT} />;
}

export function TrendDownIcon({ className }: IconProps) {
  return <PhosphorTrendDownIcon className={className} weight={WEIGHT} />;
}

export function ShareIcon({ className }: IconProps) {
  return <ShareNetworkIcon className={className} weight={WEIGHT} />;
}

export function CopyIcon({ className }: IconProps) {
  return <PhosphorCopyIcon className={className} weight={WEIGHT} />;
}
