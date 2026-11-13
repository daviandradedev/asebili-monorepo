export const layout = {
  pagePadding: 20,
  contentMaxWidth: 520,
  panelPadding: 22,
  codeSlotGap: 6,
  codeSlotMinHeight: 52,
  stimulusColorDiscSize: 40,
  quizOptionGap: 10,
  actionButtonMinHeight: 48,
  phoneMaxWidth: 430,
  phoneMaxHeight: 844,
  phoneAspect: 9 / 19.5,
  webChromeBreakpoint: 520,
} as const;

const HEADER_BLOCK = 64;
const FOOTER_BLOCK = 88;
const STAGE_PAD = 32;

export function phoneFrameSize(viewportWidth: number, viewportHeight: number) {
  const availableH = Math.max(
    360,
    Math.min(layout.phoneMaxHeight, viewportHeight - HEADER_BLOCK - FOOTER_BLOCK - STAGE_PAD),
  );
  const availableW = Math.min(layout.phoneMaxWidth, viewportWidth - STAGE_PAD);
  let width = availableW;
  let height = width / layout.phoneAspect;
  if (height > availableH) {
    height = availableH;
    width = height * layout.phoneAspect;
  }
  return { width, height };
}
