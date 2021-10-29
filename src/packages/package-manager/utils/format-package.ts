import {NPMPackage} from "../types";

export const formatPackage = (pkg: NPMPackage | string) => {
  if (typeof pkg === 'string') return pkg
  return pkg?.version ? `${pkg.name}@${pkg.version}` : pkg.name
}
