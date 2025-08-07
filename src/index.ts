import { Views } from "./types";
import observe from "./observe";

export type {
  DestroyFn,
  UpdateFn,
  ViewFn,
  ViewFnReturnValue,
  Views,
  ViewProps,
} from "./types";

export default function defo({
  prefix = "defo",
  scope = document.documentElement,
  views = {},
}: {
  prefix?: string;
  scope?: HTMLElement;
  views?: Views;
} = {}) {
  const observer = observe({ prefix, scope, views });

  return {
    destroy: (): void => {
      observer.disconnect();
    },
  };
}
