import {NPMPackage} from "../types";
import {isDevPackage} from "./is-dev-package";
import {formatPackage} from "./format-package";
import {complement} from "rambda";

export const splitPackageByType = (packages: (string | NPMPackage)[]) => {
  const devDependencies: string[] = packages
    .filter(isDevPackage)
    .map(formatPackage)

  const dependencies: string[] = packages
    .filter(complement(isDevPackage))
    .map(formatPackage)

  return {devDependencies, dependencies }
}
