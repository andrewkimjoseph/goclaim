"use client";

import { ViewTransition, type ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "page-forward",
        "nav-back": "page-back",
        default: "page-default",
      }}
      exit={{
        "nav-forward": "page-forward",
        "nav-back": "page-back",
        default: "page-default",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
