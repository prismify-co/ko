import TypedEmitter from 'typed-emitter'

export interface KoEvents {
  start: () => void
  end: () => void
  error: (error: Error) => void
  event: (message: string) => void
}

export type KoEventType = 'start' | 'end' | 'error' | 'event'

export type KoEventEmitter = TypedEmitter<KoEvents>

export interface KoObservable {
  subscribe<T extends KoEventType>(event: T, listener: KoEvents[T]): this
  subscribeOnce<T extends KoEventType>(event: T, listener: KoEvents[T]): this
  unsubscribe<T extends KoEventType>(event: T, listener: KoEvents[T]): this
  unsubscribeAll<T extends KoEventType>(event?: T): this
}
