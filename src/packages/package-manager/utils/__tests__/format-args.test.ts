import {formatArgs} from "../format-args";

describe('format-args', () => {
  describe('npm', () => {
    describe('add', () => {
      it('should add "add" to the head of the args list', () => {
        expect(formatArgs('npm', 'add', []))
          .toEqual(['add'])
      })
      it('should add "react" to args', () => {
        expect(formatArgs('npm', 'add', ['react']))
          .toEqual(['add', 'react'])
      })
      it('should add "react" as dev dependency', () => {
        expect(formatArgs('npm', 'add', ['react'], {dev: true}))
          .toEqual(['add', 'react', '--save-dev'])
      })

      it('should add "react" and prefer offline', () => {
        expect(formatArgs('npm', 'add', ['react'], {offline: true}))
          .toEqual(['add', 'react', '--prefer-offline'])
      })
      it('should add "react" as dev and prefer offline', () => {
        expect(formatArgs('npm', 'add', ['react'], {dev: true, offline: true}))
          .toEqual(['add', 'react', '--save-dev', '--prefer-offline'])
      })
    })

    describe('remove', () => {
      it('should remove "react" to args', () => {
        expect(formatArgs('npm', 'remove', ['react']))
          .toEqual(['remove', 'react'])
      })
      it('should remove "react" as dev dependency', () => {
        expect(formatArgs('npm', 'remove', ['react'], {dev: true}))
          .toEqual(['remove', 'react'])
      })
    })
  })

  describe('yarn', () => {
    describe('add', () => {
      it('should add "add" to the head of the args list', () => {
        expect(formatArgs('yarn', 'add', []))
          .toEqual(['add'])
      })
      it('should add "react" to args', () => {
        expect(formatArgs('yarn', 'add', ['react']))
          .toEqual(['add', 'react'])
      })
      it('should add "react" as dev dependency', () => {
        expect(formatArgs('yarn', 'add', ['react'], {dev: true}))
          .toEqual(['add', 'react', '--dev'])
      })

      it('should add "react" and prefer offline', () => {
        expect(formatArgs('yarn', 'add', ['react'], {offline: true}))
          .toEqual(['add', 'react', '--offline'])
      })
      it('should add "react" as dev and prefer offline', () => {
        expect(formatArgs('yarn', 'add', ['react'], {dev: true, offline: true}))
          .toEqual(['add', 'react', '--dev', '--offline'])
      })
    })
    describe('remove', () => {
      it('should remove "react" to args', () => {
        expect(formatArgs('yarn', 'remove', ['react']))
          .toEqual(['remove', 'react'])
      })
      it('should remove "react" as dev dependency', () => {
        expect(formatArgs('yarn', 'remove', ['react'], { dev: true }))
          .toEqual(['remove', 'react'])
      })
    })
  })
})
