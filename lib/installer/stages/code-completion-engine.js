/** @babel */

/**
 * Copyright 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../../utils';

import BaseStage from './base';


export default class CodeCompletionEngineStage extends BaseStage {

  get name() {
    return 'Intelligent Code Completion';
  }

  check() {
    if ([-1, 1].includes(this.state)) {
      this.status = BaseStage.STATUS_SUCCESSED;
      return true;
    }
    return new Promise((resolve, reject) => {
      utils.runCommand('clang', ['--version'], code => {
        if (code === 0) {
          this.state = 1;
          this.status = BaseStage.STATUS_SUCCESSED;
          return resolve(true);
        }
        reject('Clang is not installed in your system');
      });
    });
  }

  install() {
    if (this.state === 1) {
      return true;
    }
    const selected = atom.confirm({
      message: 'Clang is not installed in your system!',
      detailedMessage: 'PlatformIO IDE uses "Clang" for the Intelligent Code Completion.\n' +
        'Please install it, otherwise this feature will be disabled.',
      buttons: ['Install Clang', 'Remind Later', 'Disable Code Completion']
    });
    switch (selected) {
      case 0:
        utils.openUrl('http://docs.platformio.org/page/ide/atom.html#clang-for-intelligent-code-completion');
        break;
      case 2:
        this.state = -1;
        break;
    }
    return true;
  }

}
