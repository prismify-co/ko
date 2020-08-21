import Steps from '..'

describe('packages/steps', () => {
  let s = new Steps()
  beforeEach(() => {
    s = new Steps()
  })

  it('should add a dependency step', () => {
    const step = {
      name: 'test',
      packages: ['node'],
      condition: true,
      summary: 'Hello',
    }
    s.addDependencyStep(step)

    expect(s.steps.length).toEqual(1)
    expect(s.steps[0]).toEqual({ type: 'dependency', ...step })
  })

  it('should add a file step', () => {
    const step = {
      name: 'test',
      source: 'path',
      destination: 'target',
      condition: true,
      context: { hello: 'world' },
      summary: 'Hello',
    }
    s.addFileStep(step)
    expect(s.steps.length).toEqual(1)
    expect(s.steps[0]).toEqual({ type: 'file', ...step })
  })

  it('should add a transform step', () => {
    const step = {
      name: 'test',
      source: ['file'],
      transform(ast: any) {
        return ast
      },
    }
    s.addTransformStep(step)
    expect(s.steps.length).toEqual(1)
    expect(s.steps[0]).toEqual({ type: 'transform', ...step })
  })

  it('should add a custom step', () => {
    const step = {
      name: 'test',
      run() {},
    }
    s.addCustomStep(step)
    expect(s.steps.length).toEqual(1)
    expect(s.steps[0]).toEqual({ type: 'custom', ...step })
  })
})
