import {NPMPackage} from "../types";
import {always, and, complement, cond, F, is, isNil, pipe, T} from "rambda";

const isTrue = and(complement(isNil), (x: boolean | undefined) => x === true)

export const isDevPackage = (pkg: NPMPackage | string): boolean => cond([
  [is(String), always(false)],
  [is(Object), pipe((x: NPMPackage) => x.dev, isTrue)],
  [T, F]
])(pkg)
