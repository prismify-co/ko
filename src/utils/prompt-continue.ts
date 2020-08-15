import inquirer from 'inquirer'

export default async function promptContinue(reason: string, primary = 'Yes') {
  const result = await inquirer.prompt([
    {
      name: 'continue',
      message: `${reason} Would you like to continue?`,
      type: 'list',
      choices: ['Yes', 'No'],
      default: primary,
    },
  ])
  return result === 'Yes'
}
