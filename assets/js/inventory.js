import { NuiCallback } from "./nuicallback.js";

export class Inventory {
    items = {};
    lastDropped = {};
    type = null;
    weight = 0;
    maxWeight = 0;
    placeholderItem = `<div class="item-placeholder bg-black/30 rounded border border-black/30 shadow-lg h-16 w-16 flex items-center justify-center"></div>`;
    customItems = []

    /**
     * Creates a new inventory instance.
     * @param {Array} items 
     * @param {Number} weight 
     * @param {Number} maxWeight 
     * @param {String} inventoryType 
     */
    constructor(items, weight, maxWeight, inventoryType) {
        this.items = items;
        this.type = inventoryType;
        this.weight = weight;
        this.maxWeight = maxWeight;

        this.setInventory();

        this.setInventoryWeight(this.weight);
        this.setInventoryMaxWeight(this.maxWeight);
    }

    /**
     * Updates the inventory weight on the ui and in the class.
     * @param {string|number} newWeight 
     */
    setInventoryWeight(newWeight) {
        $(`#${this.type}CurrentWeight`).text(newWeight.toFixed(2));
        this.weight = newWeight;
    }

    /**
     * Updates the inventory max weight on the ui and in the class.
     * @param {string|number} newMaxWeight 
     */
    setInventoryMaxWeight(newMaxWeight) {
        $(`#${this.type}MaxWeight`).text(newMaxWeight);
        this.maxWeight = newMaxWeight;
    }

    /**
     * Sets the inventory items of the inventory.
     * @param {Array} items 
     * @param {Boolean} updateInventoryUI
     */
    setInventoryItems(items, updateInventoryUI = false) {
        this.items = items;
        if (updateInventoryUI) {
            this.setInventory();
        }
    }

    getInventory() {
        return this.items;
    }

    setInventory() {
        // We are going to get the parent div which is required to add the items to the inventory.
        const parent = $(`#${this.type}ItemList`);

        // If the parent could not be found for any reasons we're going to report this to the player so they wont just get an error in their console.
        if (parent === null || parent === undefined) {
            console.error('Could\'nt find parent. Please contact our development team by creating a ticket or joining our support voice channels for further assistance!')
            return;
        }

        // Clears the inventory.
        $(`#${this.type}ItemList`).html('');

        // Get's all items with the same class name and removes them from the ui.
        const itemList = document.getElementsByClassName(`item-${this.type}`);

        for (let i = 0; i < itemList.length; i++) {
            itemList[i].remove();
        }

        // Gets all items in the inventory and adds them to the ui.
        const inventory = this.getInventory();
        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];

            if (item.type == 'item' && item.count == 0) {
                continue;
            }

            // Check if the item is not visible on the ui yet.
            if (item.type != 'item' || (item.type == 'item' && $(`.item-img[data-item="${item.name}"][data-inventory="${item.type}"]`).length === 0)) {
                const imgElement = `<img class="item-img" data-index="${i}" data-inventory="${this.type}" data-type="${item.type}" data-item="${item.name}" src="https://cfx-nui-dc_inventory/html/assets/images/${item.name}.png" onerror="this.src='https://cfx-nui-dc_inventory/html/assets/images/dc.png'" alt="${item.label}">`;
                const template = `<div class="basis-[15%] relative item-${this.type} bg-black/30 rounded border border-black/30 shadow-lg hover:bg-gray/80 transition-all cursor-pointer h-16 w-16 flex items-center justify-center">
                    <p id="itemCount" class="absolute text-xs font-gilroyBold" style="top: 2px; left: 3px; ${item.type == 'custom' ? 'display: none;' : ' '}">${item.count === undefined ? item.ammo : item.count}</p>
                    ${imgElement}
                </div>`;

                parent.prepend(template);
            } else {
                if (item.type != 'weapon') {
                    // Checks if the count is greater than zero.
                    if (item.count > 0) {
                        $(`.item-img[data-item="${item.name}"]`).parent().children('#itemCount').text(item.count);
                    } else {
                        $(`.item-img[data-item="${item.name}"]`).parent().remove();   
                    }
                }
            }
        }

        // We are calculating how many placeholder items we need to add to make the inventory not look empty even if the player has just a few items.
        const existingInventoryItems = $(`.item-${this.type}`).length; // 1
        const missingInventoryItems = 30 - existingInventoryItems; // 29
        const existingPlaceholderItems = $(`.item-${this.type}-placeholder`).length;

        const requiredPlaceholderItems = missingInventoryItems - existingPlaceholderItems;

        // After calculating we're going to add the items to the ui.
        for (let i = 0; i < requiredPlaceholderItems; i++) {
            const placeholder = `<div class="basis-[15%] item-${this.type}-placeholder bg-black/30 rounded border border-black/30 shadow-lg h-16 w-16 flex items-center justify-center"></div>`;;
            parent.append(placeholder);
        }

        // Each item needs to be draggable in order for the user to drag and drop them to another inventory or drop them.
        $('.item-img').draggable({
            appendTo: "body",
            revert: true,
        });
    }

    /**
     *
     * @param {String} itemName
     * @param {String} type
     * @param index
     * @returns
     */
    findInventoryItem(itemName, type, index = null) {
        const inv = this.getInventory();

        if (index) {
            if (inv[index]) {
                return inv[index];
            }
        }

        // Loop through our inventory.
        for (let i = 0; i < inv.length; i++) {
            // Check if the item name and type matches.
            if (inv[i].name == itemName && inv[i].type == type) {
                return inv[i];
            }
        }

        return null;
    }

    checkIfElementExistsOnUI(itemName) {
        const itemElement = $('.item-img[data-item=' + itemName + ']');

        // Returns false whenever the item could not be found.
        if (itemElement === null || itemElement === undefined) {
            return false;
        }

        return itemElement;
    }

    removeInventoryItemFromUI(itemName, count) {
        const itemElement = this.checkIfElementExistsOnUI(itemName);
        if (!itemElement) {
            console.error('An error occured while trying to find the item the player wanted to throw away. This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'itemDoesNotExistOnUI',
                data: {
                    name: itemName,
                }
            });
            return;
        }

        const itemIndex = Object.keys(this.items).findIndex((key) => this.items[key].name == itemName);

        if (itemIndex <= -1 || this.items[itemIndex] === undefined || !this.items[itemIndex].hasOwnProperty('count')) {
            console.error('Could not find item in inventory items. Missing item: ' + itemName + '. This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'itemNotFound',
                data: {
                    name: itemName,
                }
            });
            return;
        }

        const item = this.items[itemIndex];

        if (count === item.count) {
            // Remove the item from our list.
            itemElement.parent().remove();

            $('#itemList').append(this.placeholderItem);
        } else {
            itemElement.parent().children(':first-child').text(item.count)
        }
    }

    /**
     * 
     * @param {*} name 
     * @param {*} count 
     * @deprecated This function should get deleted after the transition was successful.
     * @returns 
     */
    removeWeaponFromUI(name, count) {
        const weaponElement = this.checkIfElementExistsOnUI(name);
        if (!weaponElement) {
            console.error('An error occured while trying to find the weapon the player wanted to throw away. This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'weaponNotFound',
                data: {
                    name: itemName,
                }
            });
            return;
        }

        weaponElement.parent().remove();

        $('#itemList').append(this.placeholderItem);
    }

    removeInventoryItem(itemName, count) {
        const inv = this.getInventory();

        for (let i = 0; i < inv.length; i++) {
            if (inv[i].name == itemName) {
                if (inv[i].count > 1) {
                    inv[i].count = inv[i].count - count;
                    this.setInventory(inv);
                } else {
                    this.setInventory(inv.slice(i));
                }
            }
        }
    }

    addInventoryItem(item) {
        const inv = this.getInventory();
        let foundItem = false;
        for (let i = 0; i < inv.length; i++) {
            // If the item has been found in the inventory.
            if (inv[i].name == item.name) {
                foundItem = true;
                inv[i].count = inv[i].count + item.count;
                this.setInventory(inv);
            }
        }

        if (!foundItem) {
            this.setInventory(inv.push(item));
        }
    }

    addInventoryItemToUI(item) {
        // Get the item element based on the itemName in the data-item attribute.
        const itemElement = $('.item-img[data-item=' + item.name + ']');

        // We have two logics we need to run whether the item exists already in the inventory or not.
        if (itemElement === null || itemElement === undefined) {
            // Get the parent element.
            const parent = $('#itemList');
            // Preparte the item template.
            const template = `<div class="relative item bg-black/30 rounded border border-black/30 shadow-lg hover:bg-gray/80 transition-all cursor-pointer h-16 w-16 flex items-center justify-center">
                <p id="itemCount" class="absolute text-xs font-gilroyBold" style="top: 2px; left: 3px;">${item.count}</p>
                <img class="item-img" data-item="${item.name}" src="https://cfx-nui-dc_inventory/html/assets/images/${item.name}.png" alt="${item.label}">
            </div>`;
            // Add the newly added item to the ui.
            parent.prepend(template);

            // Only remove the placeholder element if there is at least one of them.
            if ($('.item-placeholder').first() !== null || $('.item-placeholder').first() !== undefined) {
                $('.item-placeholder').first().remove();
            }
        } else {
            itemElement.parent().children(':first-child').text(item.count)
        }

        const itemIndex = Object.keys(this.items).findIndex((key) => this.items[key].name == itemName);

        if (itemIndex <= -1 || this.items[itemIndex] === undefined || !this.items[itemIndex].hasOwnProperty('count')) {
            console.error('Could not find item in inventory items. Missing item: ' + itemName + ' This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'itemNotFound',
                data: {
                    name: itemName,
                }
            });
            return;
        }

        if (count === item.count) {
            // Remove the item from our list.
            itemElement.parent().remove();

            $('#itemList').append(this.placeholderItem);
        } else {
            itemElement.parent().children(':first-child').text(item.count)
        }
    }
}