/** @babel */

/**
 * Copyright (c) 2016-present, PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Disposable } from 'atom';


let currentService = null;

export function consumePlatformioIDETerminal(service) {
  // Only first registered provider will be consumed
  if (isEnabled()) {
    console.warn('Multiple terminal providers found.');
    return new Disposable(() => {
    });
  }
  currentService = service;
  updateTerminalProcessEnv();
  return new Disposable(() => {
    // Executed when provider package is deactivated
    currentService = null;
  });
}

function isEnabled() {
  return Boolean(currentService);
}

export function getTerminalViews() {
  if (isEnabled()) {
    return currentService.getTerminalViews();
  } else {
    return -1;
  }
}

export function updateTerminalProcessEnv() {
  if (!isEnabled()) {
    return false;
  }
  const variables = {
    PLATFORMIO_CALLER: process.env.PLATFORMIO_CALLER,
    PLATFORMIO_IDE: process.env.PLATFORMIO_IDE,
    PATH: process.env.PATH
  };
  if (process.env.Path) {
    variables.Path = process.env.Path;
  }
  return currentService.updateProcessEnv(variables);

}

export function runCmdsInTerminal(commands) {
  if (isEnabled()) {
    updateTerminalProcessEnv();
    return currentService.run(commands);
  }
  atom.notifications.addError('PlatformIO: Terminal service is not registered.', {
    detail: 'Make sure that "platformio-ide-terminal" package is installed.',
    dismissable: true
  });
  return -1;
}
