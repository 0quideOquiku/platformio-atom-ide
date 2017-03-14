/** @babel */

/**
 * Copyright 2016-present PlatformIO Plus <contact@pioplus.com>
 *
 * License: https://pioplus.com/license.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

import * as config from '../../config';
import * as utils from '../../utils';

import BaseStage from './base';
import semver from 'semver';


export default class AtomDependenciesStage extends BaseStage {

  get name() {
    return 'Atom dependencies';
  }

  getInstalled() {
    return atom.packages.getAvailablePackageNames().map(
      name => name.toLowerCase());
  }

  getMissed() {
    const installed = this.getInstalled();
    return Object.keys(config.ATOM_DEPENDENCIES).filter(
      name => !installed.includes(name)
    );
  }

  getIncompatible() {
    const manifests = atom.packages.getAvailablePackageMetadata();
    const incompatible = [];
    for (const manifest of manifests) {
      if (manifest.name in config.ATOM_DEPENDENCIES && !semver.satisfies(
          manifest.version, config.ATOM_DEPENDENCIES[manifest.name].requirements)) {
        incompatible.push(manifest.name);
      }
    }
    return incompatible;
  }

  getInactive() {
    const installed = this.getInstalled();
    return Object.keys(config.ATOM_DEPENDENCIES).filter(
      name => installed.includes(name) && config.ATOM_DEPENDENCIES[name].required && !atom.packages.isPackageActive(name)
    );
  }

  installMissed() {
    return new Promise((resolve, reject) => {
      let missed = this.getMissed();
      if (missed.length == 0) {
        return resolve(true);
      }
      missed = missed.map(name => {
        if (!config.ATOM_DEPENDENCIES[name].forceVersion) {
          return name;
        }
        return `${name}@${config.ATOM_DEPENDENCIES[name].forceVersion}`;
      });
      utils.runAPMCommand(
        ['install', ...missed, '--production', '--compatible'],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            utils.notifyError(`Install missed packages: ${missed}`, error);
            return reject(error);
          } else {
            console.debug(stdout);
            resolve(stdout);
          }
        }
      );
    });
  }

  uninstallIncompatible() {
    return new Promise((resolve, reject) => {
      const incompatible = this.getIncompatible();
      if (incompatible.length == 0) {
        return resolve(true);
      }

      utils.runAPMCommand(
        ['uninstall', ...incompatible],
        (code, stdout, stderr) => {
          if (code !== 0) {
            const error = new Error(stderr);
            utils.notifyError(`Uninstall incompatible packages: ${incompatible}`, error);
            return reject(error);
          } else {
            console.debug(stdout);
            resolve(stdout);
          }
        }
      );
    });
  }

  activateRequired() {
    this.getInactive().forEach(name => atom.packages.enablePackage(name));
    return true;
  }

  check() {
    const missed = this.getMissed();
    if (missed.length) {
      throw new Error(`Missed packages: ${missed}`);
    }
    const incompatible = this.getIncompatible();
    if (incompatible.length) {
      throw new Error(`Incompatible packages: ${incompatible}`);
    }
    const inactive = this.getInactive();
    if (inactive.length) {
      throw new Error(`Inactive packages: ${inactive}`);
    }
    this.status = BaseStage.STATUS_SUCCESSED;
    return true;
  }

  async install() {
    if (this.status === BaseStage.STATUS_SUCCESSED) {
      return true;
    }
    this.status = BaseStage.STATUS_INSTALLING;
    try {
      await this.uninstallIncompatible();
      await this.installMissed();
      await this.activateRequired();
    } catch (err) {
      this.status = BaseStage.STATUS_FAILED;
      throw new Error(err.toString());
    }
    return true;
  }

}
