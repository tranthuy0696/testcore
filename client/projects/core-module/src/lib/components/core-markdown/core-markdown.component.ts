import { Component, Input } from '@angular/core'
import * as marked from 'marked'

@Component({
  selector: 'core-markdown',
  templateUrl: './core-markdown.component.html'
})
export class CoreMarkdownComponent {
  markdown: string

  @Input() set data(value: string) {
    if (value) {
      this.markdown = marked.setOptions({}).parse(value)
    }
  }
}
