"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.target === "_blank"
  );
}

function splitHref(href: string) {
  const url = new URL(href, "http://n.invalid");
  return {
    pathname: url.pathname || "/",
    hash: url.hash.replace(/^#/, ""),
  };
}

function scrollToHashOrTop(hash: string) {
  const behavior: ScrollBehavior = "smooth";

  if (hash) {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
      return;
    }
  }

  window.scrollTo({ top: 0, behavior });
}

type NavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function NavLink({
  href,
  className,
  children,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const { pathname: targetPath, hash } = splitHref(href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;

    const currentPath = pathname || "/";
    if (currentPath !== targetPath) return;

    event.preventDefault();

    const nextUrl = hash ? `${targetPath}#${hash}` : targetPath;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;
    if (currentUrl !== nextUrl) {
      window.history.pushState(null, "", nextUrl);
    }

    scrollToHashOrTop(hash);
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
