/** @babel */
/** @jsx etchDom */

/**
 * Copyright 2016-present Ivan Kravets <me@ikravets.com>
 *
 * This source file is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import { EtchComponent } from '../../etch-component';
import { LibStorageItem } from '../util';
import { dom as etchDom } from 'etch';

export default class LibItemCardView extends EtchComponent {

  getAuthorNames() {
    if (!this.props.item.authors) {
      return [];
    }
    return this.props.item.authors.map(item => item.name);
  }

  onDidShow(event, id) {
    event.stopPropagation();
    if (id) {
      this.props.homebus.emit('lib-show', id);
    }
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  render() {
    const authornames = this.getAuthorNames();
    return (
      <div onclick={ (e) => this.onDidShow(e, this.props.item.id) }
        className='block lib-summary-block native-key-bindings'
        tabIndex={ -1 }
        style={ { cursor: this.props.item.id ? 'pointer' : 'default' } }>
        <div className='row'>
          <div className='col-xs-9'>
            <h2>{ this.props.item.id ? (
                  <a onclick={ (e) => this.onDidShow(e, this.props.item.id) }>
                    { this.props.item.name }
                  </a>
                  ) : (
                  <span>{ this.props.item.name }</span>
                  ) } <small>{ authornames.length ? ` by ${authornames.join(', ')}` : '' }</small></h2>
          </div>
          <div className='col-xs-3 text-right text-nowrap'>
            <span className='icon icon-versions'></span>
            { this.props.item.version }
          </div>
        </div>
        <div className='block'>
          { this.props.item.description ? this.props.item.description : this.props.item.url }
        </div>
        <div className='row bottom-xs'>
          <div className='col-xs-7 lib-keywords'>
            { (this.props.item.keywords ? this.props.item.keywords : []).map(name => (
                <button onclick={ (e) => this.onDidKeywordSearch(e, name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </div>
          <div className='col-xs-5 text-right lib-action'>
            <div className='btn-group'>
              { this.props.onreveal && this.props.actions & LibStorageItem.ACTION_REVEAL ? (
                <button onclick={ (e) => this.props.onreveal(e) } className='btn btn-primary icon icon-file-directory'>
                  Reveal
                </button>
                ) : ('') }
              { this.props.onuninstall && this.props.actions & LibStorageItem.ACTION_UNINSTALL ? (
                <button onclick={ (e) => this.props.onuninstall(e) } className='btn btn-primary icon icon-trashcan'>
                  Uninstall
                </button>
                ) : ('') }
              { this.props.onupdate && this.props.actions & LibStorageItem.ACTION_UPDATE ? (
                <button onclick={ (e) => this.props.onupdate(e) } className='btn btn-primary icon icon-cloud-download'>
                  { this.props.item.versionLatest? `Update to ${this.props.item.versionLatest}` : 'Update' }
                </button>
                ) : ('') }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
