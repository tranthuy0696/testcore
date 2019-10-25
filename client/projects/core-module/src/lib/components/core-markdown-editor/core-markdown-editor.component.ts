import { Component, forwardRef, Input, ElementRef, ViewChild } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import * as marked from 'marked'

@Component({
  selector: 'core-markdown-editor',
  templateUrl: './core-markdown-editor.component.html',
  styleUrls: ['./core-markdown-editor.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CoreMarkdownEditorComponent),
    multi: true
  }]
})
export class CoreMarkdownEditorComponent implements ControlValueAccessor {
  @Input() mode = 'edit'
  @ViewChild('editor', {static: true}) editor: ElementRef
  @Input('maxLength') maxLength: number
  innerValue: string
  isFullScreen = false

  set value(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value
      this.onChange(value)
    }
  }

  get value() {
    return this.innerValue
  }

  onChange = (_: any) => {}
  onTouched = () => {}

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn
  }

  getPreviewValue() {
    return this.innerValue ? marked.setOptions({}).parse(this.innerValue) : ''
  }

  toggleMode() {
    let modes = ['edit', 'dual', 'preview']
    let curIdx = modes.indexOf(this.mode) + 1
    let newIdx = curIdx % modes.length
    this.mode = modes[newIdx]
  }

  format(s: string) {
    let el = this.editor.nativeElement
    let selectedText = this.getSelectedText(el)
    switch (s) {
      case 'bold':
        this.replaceSelectedText(el, `**${selectedText}**`)
        break
      case 'italic':
        this.replaceSelectedText(el, `*${selectedText}*`)
        break
      case 'underlined':
        this.replaceSelectedText(el, `<ins>${selectedText}</ins>`)
        break
      case 'heading':
        this.replaceSelectedText(el, `# ${selectedText}`)
        break
      case 'ul':
        this.replaceSelectedText(el, `- ${selectedText}`)
        break
      case 'ol':
        this.replaceSelectedText(el, `1. ${selectedText}`)
        break
      default:
        break
    }
    this.onChange(this.editor.nativeElement.value)
  }

  // functions to handle text selection got from community
  private getInputSelection(el: any) {
    let start = 0, end = 0, normalizedValue, range, textInputRange, len, endRange
    if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
      start = el.selectionStart
      end = el.selectionEnd
    } else {
      range = document['selection'].createRange()
      if (range && range.parentElement() === el) {
        len = el.value.length
        normalizedValue = el.value.replace(/\r\n/g, '\n')

        // Create a working TextRange that lives only in the input
        textInputRange = el.createTextRange()
        textInputRange.moveToBookmark(range.getBookmark())

        // Check if the start and end of the selection are at the very end
        // of the input, since moveStart/moveEnd doesn't return what we want
        // in those cases
        endRange = el.createTextRange()
        endRange.collapse(false)

        if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
          start = end = len
        } else {
          start = -textInputRange.moveStart('character', -len)
          start += normalizedValue.slice(0, start).split('\n').length - 1

          if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
            end = len
          } else {
            end = -textInputRange.moveEnd('character', -len)
            end += normalizedValue.slice(0, end).split('\n').length - 1
          }
        }
      }
    }
    return { start: start, end: end }
  }

  private getSelectedText(el: any) {
    let text = el.value
    let range = this.getInputSelection(el)
    return text.substring(range.start, range.end)
  }

  private replaceSelectedText(el: any, text: string) {
    let sel = this.getInputSelection(el), val = el.value
    el.value = val.slice(0, sel.start) + text + val.slice(sel.end)
  }
}
