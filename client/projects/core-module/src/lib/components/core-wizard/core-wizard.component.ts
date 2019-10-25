import { Component, Input, AfterViewChecked, QueryList, ContentChildren } from '@angular/core'
import { fade } from '../../animations/fade.animation'
import { CoreWizardScreenComponent } from '../core-wizard-screen/core-wizard-screen.component'

@Component({
  selector: 'core-wizard',
  templateUrl: './core-wizard.component.html',
  animations: [
    fade('animation')
  ]
})
export class CoreWizardComponent implements AfterViewChecked {
  @Input('title') title: string
  @Input('screen') screen: string
  @Input() loading: boolean
  @ContentChildren(CoreWizardScreenComponent) screens: QueryList<CoreWizardScreenComponent>

  constructor() {}

  ngAfterViewChecked() {
    setTimeout(() => {
      this.screens.forEach((screen) => {
        if (screen.name === this.screen) {
          screen.visible = true
        } else {
          screen.visible = false
        }
      })
    })
  }
}
