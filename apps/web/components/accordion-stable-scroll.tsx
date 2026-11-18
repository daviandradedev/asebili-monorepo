"use client";

import { useEffect, type ReactNode } from "react";

function getScrollParent(element: Element | null): HTMLElement | null {
  let node = element?.parentElement ?? null;

  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return document.documentElement;
}

function isInstructorAccordion(details: HTMLDetailsElement) {
  return (
    details.classList.contains("dashboard-accordion") ||
    details.classList.contains("builder-accordion")
  );
}

export function AccordionStableScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lockedScroll: { element: HTMLElement; top: number; left: number } | null =
      null;

    function restoreScroll(element: HTMLElement, top: number, left: number) {
      element.scrollTop = top;
      element.scrollLeft = left;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const summary = target.closest("summary");
      const details = summary?.closest("details");
      if (!(details instanceof HTMLDetailsElement)) return;
      if (!isInstructorAccordion(details)) return;

      const scrollParent = getScrollParent(details);
      if (!scrollParent) return;

      lockedScroll = {
        element: scrollParent,
        top: scrollParent.scrollTop,
        left: scrollParent.scrollLeft,
      };
    }

    function onToggle(event: Event) {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      if (!isInstructorAccordion(details)) return;

      const scrollParent = getScrollParent(details);
      if (!scrollParent) return;

      const top = lockedScroll?.top ?? scrollParent.scrollTop;
      const left = lockedScroll?.left ?? scrollParent.scrollLeft;

      requestAnimationFrame(() => {
        restoreScroll(scrollParent, top, left);
        requestAnimationFrame(() => {
          restoreScroll(scrollParent, top, left);
          lockedScroll = null;
        });
      });
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("toggle", onToggle, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);

  return children;
}
