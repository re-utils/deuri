import type { Runnable } from "measure-loop/api/types";

import reporter from 'measure-loop/reporter';
import { env } from 'measure-loop';

export default <T extends Runnable>(meta: ImportMeta, b: T): T => {
  meta.main && b.run({ env, reporter });
  return b;
}
