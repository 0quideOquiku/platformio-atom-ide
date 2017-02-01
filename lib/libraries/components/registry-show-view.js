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
import { dom as etchDom } from 'etch';
import relativeDate from 'relative-date';
import shell from 'shell';

export default class LibRegistryShowView extends EtchComponent {

  getAuthorNames() {
    return this.props.data.authors.map(item => item.name);
  }

  onDidAuthorSearch(name) {
    this.props.homebus.emit('lib-search', {
      query: `author:"${name}"`
    });
  }

  onDidFrameworkSearch(name) {
    this.props.homebus.emit('lib-search', {
      query: `framework:${name}`
    });
  }

  onDidPlatformSearch(name) {
    this.props.homebus.emit('lib-search', {
      query: `platform:${name}`
    });
  }

  onDidKeywordSearch(name) {
    this.props.homebus.emit('lib-search', {
      query: `keyword:"${name}"`
    });
  }

  onDidEmail(email) {
    shell.openExternal(`mailto:${email}`);
  }

  render() {
    if (!this.props.data) {
      return (
        <div className='lib-show'>
          <ul className='background-message text-center'>
            <li>
              <span className='loading loading-spinner-small inline-block'></span> Loading...
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div className='lib-show native-key-bindings' tabIndex={-1}>
        <h1 className='section-heading icon icon-book'>{ this.props.data.name } <small>by { this.getAuthorNames().join(', ') }</small></h1>
        <div className='block text-highlight'>
          { this.props.data.description }
        </div>
        <dl className='row inset-panel padded'>
          <dt className='col-xs-2'>Registry</dt>
          <dd className='col-xs-10'>
            <a href={ `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}` }>
              { `http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}` }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.homepage ? 'block' : 'none' } }>Homepage</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.homepage ? 'block' : 'none' } }>
            <a href={ this.props.data.homepage }>
              { this.props.data.homepage }
            </a>
          </dd>
          <dt className='col-xs-2' style={ { display: this.props.data.repository ? 'block' : 'none' } }>Repository</dt>
          <dd className='col-xs-10' style={ { display: this.props.data.repository ? 'block' : 'none' } }>
            <a href={ this.props.data.repository }>
              { this.props.data.repository }
            </a>
          </dd>
          <dt className='col-xs-2'>Authors</dt>
          <dd className='col-xs-10'>
            { this.props.data.authors.map(item => (
                <div className='lib-author'>
                  <strong>{ item.name }</strong> <span>{ item.maintainer ? '(maintainer)' : '' }</span>
                  { item.email ? (
                    <div>
                      <span className='icon icon-mail'></span>
                      <a onclick={ () => this.onDidEmail(item.email) }>
                        { item.email }
                      </a>
                    </div>
                    ) : ('') }
                  { item.url ? (
                    <div>
                      <span className='icon icon-link'></span>
                      <a href={ item.url }>
                        { item.url }
                      </a>
                    </div>
                    ) : ('') }
                  <div>
                    <span className='icon icon-code'></span><a onclick={ () => this.onDidAuthorSearch(item.name) }>Libraries</a>
                  </div>
                </div>
              )) }
          </dd>
          <dt className='col-xs-2'>Compatibility</dt>
          <dd className='col-xs-10 lib-compatibility'>
            { this.props.data.frameworks.length ? (
              <div className='block'>
                <span title='Compatible frameworks' className='icon icon-gear'></span>
                { this.props.data.frameworks.map(item => (
                    <a onclick={ () => this.onDidFrameworkSearch(item.name) }>
                      { item.title }
                    </a>
                  )) }
              </div>
              ) : ('') }
            { this.props.data.platforms.length ? (
              <div>
                <span title='Compatible development platforms' className='icon icon-device-desktop'></span>
                { this.props.data.platforms.map(item => (
                    <a onclick={ () => this.onDidPlatformSearch(item.name) }>
                      { item.title }
                    </a>
                  )) }
              </div>
              ) : ('') }
          </dd>
          <dt className='col-xs-2'>Keywords</dt>
          <dd className='col-xs-10 lib-keywords'>
            { this.props.data.keywords.map(name => (
                <button onclick={ () => this.onDidKeywordSearch(name) } className='btn btn-sm icon icon-tag inline-block-tight'>
                  { name }
                </button>
              )) }
          </dd>
          <dt className='col-xs-2'>Downloads</dt>
          <dd className='col-xs-10'>
            <div>
              { this.props.data.dlstats.day } downloads in the last day
            </div>
            <div>
              { this.props.data.dlstats.week } downloads in the last week
            </div>
            <div>
              { this.props.data.dlstats.month } downloads in the last month
            </div>
          </dd>
          <dt className='col-xs-2'>Version</dt>
          <dd className='col-xs-10'>
            <strong>{ this.props.data.version.name }</strong>
            <small title={ this.props.data.version.released }> last updated { relativeDate(new Date(this.props.data.version.released)) }</small>
          </dd>
        </dl>
        <br />
      </div>
    );
  }
}
