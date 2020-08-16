import { REGISTER_INSTANCE } from 'ts-node'
import dbg from 'debug'
const debug = dbg('ko:utils:setup-ts-node')

export const setupTsnode = () => {
  try {
    if (!process[REGISTER_INSTANCE]) {
      require('ts-node').register({ compilerOptions: { module: 'commonjs' } })
    }
    require('tsconfig-paths/register')
  } catch (error) {
    debug('An error occurred while configuring ts-node')
    debug(error)
  }
}
