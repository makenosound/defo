export interface DefoHTMLElement extends HTMLElement {
  _defoDestroy?: Record<string, DestroyFn>;
  _defoUpdate?: Record<string, UpdateRawAttributeFn>;
}

export type ViewProps = Record<string, unknown> | string | undefined;

export type DestroyFn = () => void;

export type UpdateRawAttributeFn = (
  nextProps: string,
  prevProps: string
) => void;

export type UpdateFn<P extends ViewProps = ViewProps> = (
  nextProps: P,
  prevProps: P
) => void;

export type ViewFnReturnValue<P extends ViewProps = ViewProps> = {
  update?: UpdateFn<P>;
  destroy?: DestroyFn;
} | void;

export type ViewFn<
  P extends ViewProps = ViewProps,
  T extends HTMLElement = HTMLElement,
> = (node: T, props: P) => ViewFnReturnValue<P> | Promise<ViewFnReturnValue<P>>;

export type Views = Record<string, ViewFn>;
