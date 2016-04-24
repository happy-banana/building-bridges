import {Constants} from '../../../../shared/js/Constants';
import ContentBase from '../../../../shared/js/classes/ContentBase';

export default class MegaPuddingSlide extends ContentBase {

  constructor($slideHolder) {
    super($slideHolder);

    this.$webview = $slideHolder.find('webview');
    this.webview = this.$webview[0];

    this.webview.addEventListener("dom-ready", (function(){
      //this.webview.openDevTools();
    }).bind(this));
  }

  onStateChanged() {
    if(this.state === Constants.STATE_ACTIVE) {
      this.webview.setAttribute('src', 'demos/megapudding/index.html');
    } else {
      this.webview.setAttribute('src', '');
    }
  }

}
