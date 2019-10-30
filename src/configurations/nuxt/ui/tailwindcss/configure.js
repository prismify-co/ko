const recast = require('recast')
const builders = recast.types.builders;

function hasProperty(key) {
  return function (property) {
    return (property.key.type === 'Identifier') &&
      (property.key.name === key)
  }
}

function hasElement(key) {
  return function (element) {
    return (element.value.includes(key))
  }
}

module.exports = function configure(config) {
  let ast = recast.parse(`module.exports = { }`, {
    parser: require('acorn')
  })

  recast.visit(ast, {
    visitExpressionStatement(path) {
      this.traverse(path)
    },
    visitObjectExpression(path) {
      const buildModules = path.node.properties.find(hasProperty('buildModules'))
      // Check if 'buildModules' exists
      if (buildModules) {
        const elements = buildModules.value.elements;
        // Check if any elements exists
        if (elements) {
          const tailwind = elements.find(hasElement('@nuxtjs/tailwindcss'))

          // Add tailwind to the config
          if (!tailwind) {
            elements.push(builders.literal('@nuxtjs/tailwindcss'))
          }

          // Set the elements
          buildModules.value.elements = elements
        }
      } else {
        // Add tailwind to the buildModules property
        // and assign add it to the AST
        path.node.properties.push(
          builders.property(
            'init',
            builders.literal('buildModules'),
            builders.arrayExpression([builders.literal('@nuxtjs/tailwindcss')])
          )
        )
      }
      return false
    }
  })

  return recast.print(ast, { useTabs: false, tabWidth: 2 }).code
}
