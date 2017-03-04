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

import { BaseView, jsxDOM } from '../view';
import { CompositeDisposable, Emitter } from 'atom';

import AboutPanel from './components/panel-about';
import BoardsExplorerPanel from '../platform/components/panel-boards';
import LibsPanel from '../libraries/panel';
import MemoryCache from '../memory-cache';
import MenuView from './components/menu-view';
import { PanelsView } from './components/panels-view';
import PlatformPanel from '../platform/panel';
import WelcomePanel from './components/panel-welcome';


export default class HomeView extends BaseView {

  static homebus = null;

  constructor(props) {
    super(props);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.homebus.on(
      'panel-show', ::this.onDidPanelShow));

    this._selectedIndex = 0;
    this.getMenuItems().map((item, index) => {
      if (props.uri.startsWith(`platformio://home/${item.title.toLowerCase()}`)) {
        this._selectedIndex = index;
      }
    });
    // update menu and panels with new selected item
    this.refs.menu.update({
      selectedIndex: this._selectedIndex
    });
    this.refs.panels.update({
      selectedIndex: this._selectedIndex
    });
  }

  get homebus() {
    if (!HomeView.homebus) {
      HomeView.homebus = new Emitter();
    }
    return HomeView.homebus;
  }

  getMenuItems() {
    return [
      {
        icon: 'home',
        title: 'Welcome',
        component: (<WelcomePanel homebus={ this.homebus } />)
      },
      {
        icon: 'code',
        title: 'Libraries',
        component: (<LibsPanel homebus={ this.homebus } />)
      },
      {
        icon: 'circuit-board',
        title: 'Boards',
        component: (<BoardsExplorerPanel homebus={ this.homebus } />)
      },
      {
        icon: 'device-desktop',
        title: 'Platforms',
        component: (<PlatformPanel homebus={ this.homebus } />)
      },
      {
        icon: 'info',
        title: 'About',
        component: (<AboutPanel homebus={ this.homebus } />)
      }
    ];
  }

  getURI() {
    return this.props.uri;
  }

  getTitle() {
    return 'PlatformIO Home';
  }

  getIconName() {
    return 'home';
  }

  onDidMenuItemSelect(index) {
    this.refs.panels.update({
      selectedIndex: index
    });
  }

  onDidPanelShow(id) {
    this.getMenuItems().forEach((item, index) => {
      if (item.title.toLowerCase() === id) {
        this.onDidMenuItemSelect(index);
        this.refs.menu.update({
          selectedIndex: index
        });
      }
    });
  }

  destroy() {
    if (HomeView.homebus) {
      HomeView.homebus.dispose();
      HomeView.homebus = null;
    }
    this.subscriptions.dispose();
    new MemoryCache().clear();
    return super.destroy();
  }

  render() {
    return (
      <div className='pane-item home-view'>
        <MenuView ref='menu' items={ this.getMenuItems() } onselect={ (index) => this.onDidMenuItemSelect(index) } />
        <PanelsView ref='panels' items={ this.getMenuItems() } />
      </div>
    );
  }
}
