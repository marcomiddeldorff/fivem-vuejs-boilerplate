import {NuiCallback} from "./nuicallback.js";

export class ContextMenu {
    show = false
    position = {}
    item = {}

    /**
     * Either shows or hides the context menu.
     * @param {*} bool 
     * @param {*} position 
     * @param {*} item 
     * @returns 
     */
    static toggleState(bool, position = {}, item = {}, itemType) {
        const el = $('#contextMenu');
        if (bool) {
            if ($('#itemInfo').is(':visible')) {
                $('#itemInfo').hide();
            }

            this.item = item;
            if (!position.hasOwnProperty('x') || !position.hasOwnProperty('y')) {
                console.error('');
                return;
            }

            if (item.length === 0 && bool) {
                console.error('');
                return;
            }

            el.show().css({
                top: (20 + Number(position.y)) + 'px',
                left: (20 + Number(position.x)) + 'px',
            });

            // Only show the usable item if the item can actually be consumed.
            if (item.usable) {
                $('#useItem').show();
            } else {
                $('#useItem').hide();
            }
        } else {
            el.css({
                display: 'none'
            });
            this.item = {};
            this.position = {};
        }
    }
}