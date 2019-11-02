import { exec } from 'shelljs'

import * as config from '../utils/config'
import { manage } from '../utils/task-manager'

// import {start} from './task-manager'
export default async function () {
  // Load the configuration
  const koConfig = config.load()

  // Install the repository
  exec(`yarn add -s -D ${koConfig.repository.url}`)

  // Run the task manager
  manage(koConfig)
}
