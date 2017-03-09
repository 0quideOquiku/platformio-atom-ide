/** @babel */
/** @jsx jsxDOM */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as utils from '../../utils';

import { BaseView, jsxDOM } from '../../view';


export default class PioVersions extends BaseView {

  constructor() {
    super(...arguments);
    utils.getCoreVersion().then(
      version => {
        this.update({
          coreVersion: version
        });
      },
      (err) => {
        return utils.notifyError('Failed to retrieve PIO Core version', err);
      }
    );
  }

  renderCoreVersion() {
    if (this.props.coreVersion) {
      return this.props.coreVersion;
    }
    return (
      <span className='loading loading-spinner-tiny'></span>
    );
  }

  render() {
    return (
      <div className='block versions'>
        <ul className='list-inline'>
          <li>
            IDE <a href='https://github.com/platformio/platformio-atom-ide/blob/develop/HISTORY.md'><code>{ utils.getIDEVersion() }</code></a>
          </li>
          <li>
            ·
          </li>
          <li>
            Core <a href='https://github.com/platformio/platformio/blob/develop/HISTORY.rst'><code className='inline-block'>{ this.renderCoreVersion() }</code></a>
          </li>
        </ul>
      </div>
    );
  }
}
