"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useParams as useNextParams } from "next/navigation";

type LinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  to: string;
};

export function Link({ to, ...props }: LinkProps) {
  return <NextLink href={to} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return (target: string | number) => {
    if (typeof target === "number") {
      if (target < 0) {
        router.back();
      } else {
        router.forward();
      }
      return;
    }

    router.push(target);
  };
}

export function useParams<T extends Record<string, string | string[]>>() {
  return useNextParams() as T;
}

export function useLocation() {
  const pathname = usePathname();

  return {
    pathname,
    search: typeof window === "undefined" ? "" : window.location.search,
  };
}
