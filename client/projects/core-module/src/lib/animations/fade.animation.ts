import { trigger, animate, style, transition } from '@angular/animations'

export function fade(name: string) {
  return trigger(name, [
    transition(':enter', [
      style({
        opacity: 0
      }),
      animate('.3s', style({
        opacity: 1
      }))
    ])
  ])
}
