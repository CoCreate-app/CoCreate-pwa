// https://web.dev/web-share-target/
/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

/**
 * Commercial Licensing Information:
 * For commercial use of this software without the copyleft provisions of the AGPLv3,
 * you must obtain a commercial license from CoCreate LLC.
 * For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.
 */

import Observer from '@cocreate/observer'
import Actions from '@cocreate/actions'

const selector = "[share]";

async function init(element) {
    if (element && !(element instanceof HTMLCollection) && !Array.isArray(element))
        element = [element]
    else if (!element) {
        element = document.querySelectorAll(selector)
    }

    for (let i = 0; i < element.length; i++)
        element[i].addEventListener('click', function (e) {
            share(e.target);
        });

}

function share(element) {
    if (navigator.share && element) {
        let title = element.getAttribute('share-title') || document.title;
        let text = element.getAttribute('share-text') || document.querySelector('meta[name="description"]')?.content || '';
        let url = element.getAttribute('share-url') || window.location.href;

        navigator.share({
            title: title,
            text: text,
            url: url
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        console.log('Web Share API is not supported or element is not provided.');
    }
}

Observer.init({
    name: 'webshare',
    observe: ['addedNodes'],
    selector: '[share]',
    callback: (mutation) => {
        init(mutation.target)
    }
});

Actions.init({
    name: "share",
    callback: (action) => {
        share(action.element);
    }
})

init()

export default { init }

