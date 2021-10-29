import {PackageManagerType} from "../types";
import execa from "execa";

export async function init(manager: PackageManagerType, cwd: string): Promise<void> {
  await execa(manager, ['init', '-y'], {cwd})
}

export function initSync(manager: PackageManagerType, cwd: string): void {
  execa.sync(manager, ['init', '-y'], {cwd})
}
