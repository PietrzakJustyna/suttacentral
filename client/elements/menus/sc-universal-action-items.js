import { css, html, LitElement, svg } from 'lit-element';

import './sc-more-menu.js';
import { store } from '../../redux-store';
import { LitLocalized } from '../addons/localization-mixin';

import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '@polymer/iron-location/iron-location.js';

import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import '@material/mwc-button';
import '@material/mwc-textfield';

import { icon } from '../../img/sc-icon';

class SCUniversalActionItems extends LitLocalized(LitElement) {
  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
        --mdc-theme-surface: var(--sc-secondary-background-color);

      }

      #close_button {
        opacity: 0;
        position: absolute;
        right: 16px;
        z-index: -1;
        color: var(--sc-disabled-text-color);
        transition: opacity 200ms ease 200ms;
      }

      #search_input {
       --mdc-theme-primary: var(--sc-secondary-accent-color);
       --mdc-text-field-fill-color: var(--sc-tertiary-background-color);
       --mdc-text-field-ink-color: var(--sc-primary-text-color);
       --mdc-text-field-label-ink-color: var(--sc-secondary-text-color);
       --mdc-typography-font-family: var(--sc-sans-font);
       --mdc-shape-small: 0px;
        visibility: hidden;
        width: 100%;
        position: absolute;
        left: 0;
        transform: scaleX(0);
        transition: transform 200ms ease;
        z-index: 100;
      }

#search_input.opened{
   visibility: visible;
  transform: scaleX(1);
}

      #sc-more-menu:focus {
        outline: none;
      }

      .more-menu-list {
        background-color: var(--sc-secondary-background-color);
      }

      mwc-icon-button {
        color: white;
      }

      #more_vert_button {
        margin: 0;
        padding: 0;
      }

      #more-menu {
        --mdc-menu-min-width: 275px;
        --mdc-menu-max-width: 290px;
      }
    `;
  }

  static get properties() {
    return {
      path: { type: String },
      query: { type: String },
      mode: { type: String },
      localizedStringsPath: { type: String },
      search_input: { type: Object },
      searchKeyword: { type: String },
      moreMenu: { type: Object },
    };
  }

  constructor() {
    super();
    this.path = '';
    this.query = '';
    this.mode = store.getState().toolbarOptions.mode;
    this.localizedStringsPath = '/localization/elements/sc-universal-action-items';
    this.searchKeyword = store.getState().searchQuery;
    this.search_input = this.shadowRoot.getElementById('search_input');
  }

  get actions() {
    return {
      toggleChangeSearchQuery(searchKeyword) {
        store.dispatch({
          type: 'CHANGE_SEARCH_QUERY',
          searchKeyword: searchKeyword,
        });
      },
    };
  }

  firstUpdated() {
    const moreMenuElement = this.shadowRoot.getElementById('sc-more-menu');
    if (moreMenuElement) {
      moreMenuElement.addEventListener('item-selected', () => {
        const moreVertButtonElement = this.shadowRoot.getElementById('more_vert_button');
        moreVertButtonElement.close();
      });
    }

    const moreVertButtonElement = this.shadowRoot.getElementById('more_vert_button');
    if (moreVertButtonElement) {
      moreVertButtonElement.addEventListener('click', () => {
        const scActionItems = document
          .querySelector('sc-site-layout')
          .shadowRoot.querySelector('#action_items');
        scActionItems.hideTopSheets();
      });
    }

    const searchInputElement = this.shadowRoot.getElementById('search_input');
    if (searchInputElement && this.searchKeyword.length !== 0) {
      searchInputElement.value = this.searchKeyword;
      this.openSearch();
    }
    this.moreMenu = this.shadowRoot.querySelector('#more-menu');
    this.moreMenu.anchor = this.shadowRoot.querySelector('#more-menu-button');
  }

  openMoreMenu() {
    (this.moreMenu || {}).show();
  }

  openSearch() {
    const searchInputElement = this.shadowRoot.getElementById('search_input');
    if (searchInputElement.classList.contains('opened')) {
      this._startSearch();
    } else {
      searchInputElement.classList.add('opened');
      this.shadowRoot.getElementById('close_button').style.opacity = '1';
      this.shadowRoot.getElementById('close_button').style.zIndex = '101';
      searchInputElement.focus();
      searchInputElement.value = '';
    }
  }

  // Closes the searchbox and resets original values.
  _closeSearch() {
    const searchInputElement = this.shadowRoot.getElementById('search_input');
    if (searchInputElement && searchInputElement.classList.contains('opened')) {
      searchInputElement.value = '';
      this.actions.toggleChangeSearchQuery('');

      searchInputElement.classList.remove('opened');
      searchInputElement.removeAttribute('style', 'width');

      this.shadowRoot.getElementById('close_button').style.opacity = '0';
      this.shadowRoot.getElementById('close_button').style.zIndex = '-1';
    }
  }

  _startSearch() {
    const searchQuery = this.shadowRoot.getElementById('search_input').value;
    this.actions.toggleChangeSearchQuery(searchQuery);
    this.path = '/search';
    this.query = `query=${searchQuery}`;
    const pageLocationElement = this.shadowRoot.getElementById('pageLocation');
    pageLocationElement.path = this.path;
    pageLocationElement.query = this.query;
  }

  render() {
    return html`
            <iron-location id="pageLocation" path="${this.path}" query="${this.query}"></iron-location>
      <iron-a11y-keys
        target=${this.search_input}
        keys="enter"
        @keys-pressed="${this._startSearch}"
      ></iron-a11y-keys>

      <mwc-icon-button
        title="${this.localize('searchTooltip')}"
        label="search"        
        @click="${this.openSearch}"
      >
        ${icon.search}
      </mwc-icon-button>
        <mwc-textfield
              fullwidth
              id="search_input"
              type="search"
              style="height: 48px"
              iconTrailing=""
              placeholder="${this.localize('Search')}"
              ></mwc-textfield>
              <mwc-icon-button
        label="close"
        id="close_button"
        @click="${this._closeSearch}"
      >
        ${icon.close}
      </mwc-icon-button>
      <mwc-icon-button
        label="menu"
        id="more-menu-button"
        @click="${this.openMoreMenu}"
        alt="menu"
      >
        ${icon.more_vert}
      </mwc-icon-button>
      <mwc-menu corner="BOTTOM_LEFT" id="more-menu">
        <sc-more-menu id="sc-more-menu"></sc-more-menu>
      </mwc-menu>
    `;
  }
}

customElements.define('sc-universal-action-items', SCUniversalActionItems);
