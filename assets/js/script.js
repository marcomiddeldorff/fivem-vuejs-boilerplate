import { ContextMenu } from './contextMenu.js';
import { Inventory } from './inventory.js';
import { NuiCallback } from './nuicallback.js';

let playerInventory = null;
let otherInventory = null;

const globalData = {
    isOpen: false,
    inventory: null,
    loadout: {},
    openType: '',
    limit: 0,
    currentWeight: 0
};

let lastDroppedItemInfo = {};

let lastRightClickedItem = null;

let lastGiveItemData = {
    item: {},
    playerId: null,
    count: 0,
};

let moveItem = {
    target: null,
    item: null
};

let translations = {}

window.addEventListener('message', async (event) => {
    switch (event.data.action) {
        case 'open':
            globalData.openType = event.data.openType;

            playerInventory = null;
            otherInventory = null;

            switch (globalData.openType) {
                case 'single':
                    playerInventory = new Inventory(event.data.inv, event.data.weight, event.data.limit, 'player');

                    otherInventory = null;
                    toggleOpenState(true);
                    $('#menu_single').show();
                    $('#menu_multiple').hide();
                    break;
                case 'multiple':
                    const player = event.data.playerInventory;
                    playerInventory = new Inventory(player.inventory, player.currentWeight, player.maxWeight, 'player');

                    const other = event.data.otherInventory;

                    otherInventory = new Inventory(other.inventory, other.currentWeight, other.maxWeight, 'other');

                    $('#otherInventoryTitle').html(event.data.title);

                    toggleOpenState(true);
                    $('#menu_single').hide();
                    $('#menu_multiple').show();
                    break;
            }

            ContextMenu.toggleState(false);

            break;
        case 'removeItem':
            globalData.currentWeight = event.data.weight;
            switch (event.data.type) {
                case 'item':
                    playerInventory.removeInventoryItemFromUI(event.data.name, event.data.count)
                    break;
                case 'weapon':
                    playerInventory.removeWeaponFromUI(event.data.name, event.data.count)
                    break;
            }

            playerInventory.setInventoryWeight(event.data.weight);
            break;
        case 'showDroppedItemInfo':
            lastDroppedItemInfo = event.data.item;
            $('#droppedItemName').text(event.data.item.name);
            $('#droppedItemCount').text(event.data.item.amount);
            $('.item-drop-info').removeClass('animate__backOutUp');
            $('.item-drop-info').addClass('animate__backInDown');
            $('#itemDroppedInfo').show();
            break;
        case 'hideDroppedItemInfo':
            if (lastDroppedItemInfo.id == event.data.item.id) {
                $('.item-drop-info').addClass('animate__backOutUp');
                $('.item-drop-info').removeClass('animate__backInDown');
                setTimeout(() => {
                    $('#itemDroppedInfo').hide();
                    $('#droppedItemName').text('');
                    $('#droppedItemCount').text('');
                }, 1500);
            }
            break;
        case 'addItem':
            const droppedItem = event.data.item;
            playerInventory.addInventoryItem(droppedItem);
            break;
        case 'showItemAddedNotification':
            const target1 = $('#itemNotifications');
            const template1 = `
                <div class="pointer-events-auto bg-gray-900 px-6 py-2.5 rounded-xl animate__animated">
                    <p class="leading-6 text-white font-gilroyBold">
                        ${event.data.count}x ${event.data.label}
                        <span class="font-gilroyRegular primary">hinzugefügt</span>
                    </p>
                </div>
            `;

            const element1 = $(template1);

            target1.append(element1);

            element1
                .addClass('animate__slideOutRight')
                .delay(10000)
                .removeClass('animate__slideOutRight')
                .addClass('animate__slideInRight')
                .delay(1500)
                .fadeOut(function () {
                    element1.remove();
                });
            break;
        case 'showItemRemovedNotification':
            const target2 = $('#itemNotifications');
            const template2 = `
                <div class="pointer-events-auto bg-gray-900 px-6 py-2.5 rounded-xl animate__animated">
                    <p class="leading-6 text-white font-gilroyBold">
                        ${event.data.count}x ${event.data.label}
                        <span class="font-gilroyRegular primary">entfernt</span>
                    </p>
                </div>
            `;

            const element2 = $(template2);

            target2.append(element2);

            element2
                .addClass('animate__slideOutRight')
                .delay(3000)
                .removeClass('animate__slideOutRight')
                .addClass('animate__slideInRight')
                .delay(1500)
                .fadeOut(function () {
                    element2.remove();
                });
            break;
        case 'itemUsed':
            playerInventory.setInventoryWeight(event.data.weight);
            playerInventory.setInventoryItems(event.data.inventory, true);
            break;
        case 'close':
            toggleOpenState(false)
            break;
        case 'setTranslations':
            translations = event.data.translations;
            break;
    }
});

$('#switchBag').click(function() {
    $('#playerDocumentList').hide();
    $('#otherDocumentList').hide();
    $('#playerItemList').show();
    $('#otherItemList').show();
    $('#switchBag').addClass('primary bg-black/40').removeClass('hover:bg-black/40 hover-primary')
    $('#switchDocuments').removeClass('primary bg-black/40').removeClass('hover:bg-black/40 hover-primary')
});

$('#switchDocuments').click(function() {
    $('#playerDocumentList').show();
    $('#otherDocumentList').show();
    $('#playerItemList').hide();
    $('#otherItemList').hide();
    $('#switchDocuments').addClass('primary bg-black/40').addClass('hover:bg-black/40 hover-primary')
    $('#switchBag').removeClass('primary bg-black/40').removeClass('hover:bg-black/40 hover-primary')
});

function toggleOpenState(bool) {
    globalData.isOpen = bool;

    if (bool) {
        if (globalData.openType == 'single') {
            $('#primaryInventory').show().removeClass('w-1/2');
            $('#primaryInventory').show().addClass('w-full');
            $('#secondaryInventory').hide();
            $('#switchBag').show();
            $('#switchDocuments').show();
            $('#playerItemList').removeClass('grid-cols-5').addClass('grid-cols-10');
        } else {
            $('#primaryInventory').show().removeClass('w-full');
            $('#primaryInventory').show().addClass('w-1/2');
            $('#secondaryInventory').show().addClass('w-1/2');
            $('#switchBag').hide();
            $('#switchDocuments').hide();
            $('#playerItemList').addClass('grid-cols-5').removeClass('grid-cols-10');
        }
        $("#inventoryMain").show();
    } else {
        $("#inventoryMain").hide();
    }
}

$(document).click(function () {
    // Calling a timeout in order to catch a click event.
    setTimeout(() => {
        // If the context menu is currently visible we're going to hide it.
        if ($('#contextMenu').is(':visible')) {
            ContextMenu.toggleState(false);
        }
    }, 100);
});

$(document).on('click', '#dropItemSubmit', ThrowItem);

$(document).on('click', '#dropItemCancel', CancelThrowItem);

$(document).on('click', '#moveItemSubmit', SubmitMoveItem);
$(document).on('click', '#moveItemCancel', CancelMoveItem);

$(document).on('contextmenu', 'img', function (event) {
    // Do not open the context menu if the item does not have the required attribute.
    const itemName = $(event.target).attr('data-item');
    const type = $(event.target).attr('data-type');
    const inventoryType = $(event.target).attr('data-inventory');
    const inventory = inventoryType == 'player' ? playerInventory : otherInventory;

    if (itemName === undefined) {
        console.error('We couldn\'t find the required attribute "data-item" on the item image tag.');
        return;
    }

    if (type === undefined) {
        console.error('We couldn\'t find the required attribute "data-type" on the item image tag.');
        return;
    }

    const item = inventory.findInventoryItem(itemName, type);
    if (item === undefined || item === null || item.count == 0) {
        console.error('Either the item does not exist or you do not have the item in your inventory.');
        return;
    }

    // We do not allow the player to open the context menu if the inventory type is different than player.
    // The reason why we are doing this is simple. We would need to add the logic to give items from the inventory to the player or make the player use it.
    if (inventoryType != 'player') {
        console.info('[^3Info^0] You cannot open the context menu if the item is not stored in your personal inventory.')
        return;
    }

    lastRightClickedItem = item;

    // Open the context menu with the current location of the cursor.
    ContextMenu.toggleState(true, { x: event.clientX, y: event.clientY }, item, type);
});

$(document).on('mouseenter', '.item-img', (event) => {
    const target = $(event.target);
    const itemName = target.attr('data-item');
    const type = target.attr('data-type');
    const inventoryType = target.attr('data-inventory');
    const index = target.attr('data-index');

    if (itemName === undefined || type === undefined || inventoryType === undefined || index === undefined) {
        return;
    }


    const item = eval(`${inventoryType}Inventory.findInventoryItem('${itemName}', '${type}', '${type === 'custom' ? index : null}')`);

    if (item === null || item === undefined) {
        // console.error('Wir konnten das zu verschiebende Item leider nicht finden.');
        // Only activate the log above if you need to debug. This print would appear every time whenever a user's mouse enters an item and would spam the entire console.
        return;
    }

    $('#itemInfo').show().css({
        top: (20 + Number(event.clientY)) + 'px',
        left: (20 + Number(event.clientX)) + 'px',
    });

    $('#itemInfoList').html('');

    let itemWeight = item.weight;

    switch (item.type) {
        case 'item':
            itemWeight = item.weight * item.count;
            break;
        case 'weapon' || 'custom':
            itemWeight = item.weight;
            break;
    }

    $('#itemInfoList').append(`
        <li class="p-3 flex items-center justify-between">
          <p class="font-gilroyBold">Name:</p>
          <p class="text-white/60">${item.label}</p>
        </li>
        <li class="p-3 flex items-center justify-between">
          <p class="font-gilroyBold">Benutzbar:</p>
          <p class="text-white/60">${item.usable ? 'Ja' : 'Nein'}</p>
        </li>
        <li class="p-3 flex items-center justify-between">
          <p class="font-gilroyBold">Gewicht:</p>
          <p class="text-white/60">${itemWeight} kg</p>
        </li>
    `);

    if (item.type === 'custom') {
        if (!item.data) {
            return;
        }

        if (typeof item.data != 'object') {
            item.data = JSON.parse(item.data);
        }

        Object.keys(item.data).forEach((key) => {
            $('#itemInfoList').append(`
              <li class="p-3 flex items-center justify-between">
                <p class="font-gilroyBold">${Config.Labels[key] ? Config.Labels[key]: key}:</p>
                <p class="text-white/60">${item.data[key]}</p>
              </li>
            `);
        });
    }
});

$(document).on('mouseleave', '.item-img', (event) => {
    $('#itemInfo').hide();
});

function giveItemToPlayer() {
    $('#giveItemModal').hide();
    NuiCallback.invoke('giveItemToPlayer', lastGiveItemData)

    lastRightClickedItem = null;
    lastGiveItemData = {
        item: {},
        playerId: 0,
        count: 0
    }
}

function openCountToGivePlayer(player) {
    lastGiveItemData.item = lastRightClickedItem;
    lastGiveItemData.playerId = player;

    $('#playerList').hide();
    switch(lastRightClickedItem.type) {
        case 'weapon' || 'custom':
            giveItemToPlayer();
            break;
        default:
            $('#giveItemModal').show();
            break;
    }
}

$('#giveItemSubmit').click(function() {
    const val = $('#giveItemCount').val();
    if (val === undefined || val === null || val === 0) {
        return;
    }

    lastGiveItemData.count = val;
    giveItemToPlayer();
    NuiCallback.invoke('closeContextMenu')
});

$('#giveItemCancel').click(function() {
    $('#giveItemModal').hide();
    NuiCallback.invoke('closeContextMenu');
});

$(document).on('click', '.playerItem', function(event) {
    const playerId = $(event.target).attr('data-player-id');

    openCountToGivePlayer(Number(playerId))
});

$(document).on('click', '#giveItem', async function() {
    if (lastRightClickedItem === null) {
        console.error('It seems like you did not select any item.');
        return;
    }

    const item = lastRightClickedItem;

    const result = await NuiCallback.invoke('getClosestPlayers');
    const json = await result.json();

    if (json.length === 0) {
        $('#useItem').hide();
        $('#warning').removeClass('animate__flipOutX');
        $('#warning').addClass('animate__flipInX');
        $('#warningMessage').text('Es befinden sich keine Spieler in deiner Nähe.');
        $('#warning').show();

        setTimeout(() => {
            $('#warning').hide();
            $('#warningMessage').text('');
            $('#warning').removeClass('animate__flipInX');
            $('#warning').addClass('animate__flipInX');
        }, 5000);
        return;
    }

    $('#playerList').html('');
    for (let i=0; i < json.length; i++) {
        $('#playerList').append(`
            <li data-player-id="${json[i]}" class="playerItem p-2 border-b last:border-b-0 hover:bg-primary/60 cursor-pointer transition-all">
              ${json[i]}
            </li>
        `);
    }

    $('#playerList').show();
});

$(document).on('click', '#useItem', async function () {
    if (lastRightClickedItem === null) {
        console.error('It seems like you did not select any item.');
        return;
    }

    const item = lastRightClickedItem;

    // If the selected item is not usable.
    if (!item.usable) {
        $('#useItem').hide();
        $('#warning').removeClass('animate__flipOutX');
        $('#warning').addClass('animate__flipInX');
        $('#warningMessage').text('Den Gegenstand, den du ausgewählt hast, kannst du leider nicht konsumieren.');
        $('#warning').show();

        setTimeout(() => {
            $('#warning').hide();
            $('#warningMessage').text('');
            $('#warning').removeClass('animate__flipInX');
            $('#warning').addClass('animate__flipInX');
        }, 5000);
        return;
    }

    // This code will run whenever the item is actually usable.
    await NuiCallback.invoke('useItem', {
        item
    });

    lastRightClickedItem = null;
});

window.addEventListener('keydown', async (event) => {
    switch (event.key) {
        case 'Escape':
            CloseAll()
            break;
        case 'Enter':
            if ($('#dropItemModal').is(':visible')) {
                ThrowItem();
            }

            if ($('#moveItemModal').is(':visible')) {
                SubmitMoveItem();
            }
            break;
    }
});

async function CloseAll() {
    if ($('#dropItemModal').is(':visible')) {
        CancelThrowItem();
        return;
    }

    if ($('#moveItemModal').is(':visible')) {
        CancelMoveItem();
        return;
    }

    if ($('#playerList').is(':visible')) {
        $('#playerList').hide();
        NuiCallback.invoke('closeContextMenu');
        return
    }

    if ($('#giveItemModal').is(':visible')) {
        $('#giveItemModal').hide();
        NuiCallback.invoke('closeContextMenu');
        return;
    }

    toggleOpenState(false);
    await NuiCallback.invoke('close');
}

function ThrowItem() {
    const itemValue = $('#dropItemInput').val();
    if (!isNaN(Number(itemValue)) && Number(itemValue) > 0 && playerInventory.lastDropped) {
        playerInventory.removeInventoryItem(playerInventory.lastDropped.name, itemValue);
        $('#dropItemModal').hide();
        NuiCallback.invoke('throwItem', {
            item: playerInventory.lastDropped.name,
            type: playerInventory.lastDropped.type,
            count: itemValue
        });
    }
};

function CancelThrowItem() {
    $('#dropItemInput').val('1');
    $('#dropItemModal').hide();
}

function SubmitMoveItem() {
    if (moveItem.item === null || moveItem.item === undefined || moveItem.target === null || moveItem.target === undefined) {
        return;
    }

    NuiCallback.invoke('moveItem', {
        target: moveItem.target,
        count: $('#moveItemInput').val() > moveItem.item.count ? moveItem.item.count : $('#moveItemInput').val(),
        item: moveItem.item
    });

    $('#moveItemModal').hide();
}

function MoveItem(itemName, type, targetType) {
    moveItem.target = targetType;
    const item = eval(`${moveItem.target == 'other' ? 'player' : 'other'}Inventory.findInventoryItem('${itemName}', '${type}')`);
    if (item === null || item === undefined) {
        console.error('Wir konnten das zu verschiebende Item leider nicht finden.');
        return;
    }

    moveItem.item = item;

    switch (item.type) {
        case 'item':
            $('#moveItemInput').attr('max', item.count);
            $('#moveItemModal').show();
            break;
        case 'weapon':
            SubmitMoveItem();
            break;
        case 'custom':
            SubmitMoveItem();
    }
}

function CancelMoveItem() {
    moveItem = {
        item: null,
        target: null,
    };

    $('#moveItemModal').hide();
}

$('#playerItemList').droppable({
    over: function (event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'player') {
            $(target).css({
                'scale': '1.05'
            })
        }
    },
    out: function (event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'player') {
            $(target).css({
                'scale': '1.0'
            })
        }
    },
    drop: function(event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'player') {
            $(target).css({
                'scale': '1.0'
            });

            const itemName = $(ui.draggable[0]).attr('data-item');
            const type = $(ui.draggable[0]).attr('data-type');

            MoveItem(itemName, type, 'player');
        }
    }
});

$('#otherItemList').droppable({
    over: function (event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'other') {
            $(target).css({
                'scale': '1.05'
            })
        }
    },
    out: function (event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'other') {
            $(target).css({
                'scale': '1.0'
            })
        }
    },

    drop: function (event, ui) {
        const target = event.target;
        const item = ui.draggable[0];
        const inventoryType = $(item).attr('data-inventory');
        if (inventoryType != 'other') {
            $(target).css({
                'scale': '1.0'
            });

            const itemName = $(ui.draggable[0]).attr('data-item');
            const type = $(ui.draggable[0]).attr('data-type');

            MoveItem(itemName, type, 'other');
        }
    }
});

// Droppable to throw an item away.
$('#dropzoneThrow').droppable({
    over: function (event, ui) {
        const inventory = $(ui.draggable[0]).attr('data-inventory');

        if (inventory != 'player') {
            return;
        }

        const target = event.target;
        target.classList.remove('border-dashed', 'text-red-500');
        target.classList.add('border-solid', 'bg-red-500', 'text-white');
    },
    out: function (event, ui) {
        const inventory = $(ui.draggable[0]).attr('data-inventory');

        if (inventory != 'player') {
            return;
        }

        const target = event.target;
        target.classList.add('border-dashed', 'text-red-500');
        target.classList.remove('border-solid', 'bg-red-500', 'text-white');
    },
    drop: function (event, ui) {
        const inventory = $(ui.draggable[0]).attr('data-inventory');

        if (inventory != 'player') {
            return;
        }
        const target = event.target;
        target.classList.add('border-dashed', 'text-red-500');
        target.classList.remove('border-solid', 'bg-red-500', 'text-white');

        if (!ui.hasOwnProperty('draggable') || !ui.draggable.hasOwnProperty(0)) {
            console.error('An error occured while trying to throw an item. This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'draggablePropertyDoesNotExist',
                data: {}
            });
            return;
        }

        const itemName = $(ui.draggable[0]).attr('data-item');
        const type = $(ui.draggable[0]).attr('data-type');

        const item = playerInventory.findInventoryItem(itemName, type);

        if (item === undefined || item === null) {
            console.log('Could not find item you wanted to drop. This incident has been automatically reported to our development team.');
            NuiCallback.invoke('reportIncident', {
                error: 'itemNotFound',
                data: {
                    name: itemName,
                }
            });
            return;
        }

        switch (item.type) {
            case 'item':
                $('#dropItemModal').show();
                playerInventory.lastDropped = item;
                break;
            case 'item_account':
                $('#dropItemModal').show();
                playerInventory.lastDropped = item;
                break;
            case 'weapon':
                NuiCallback.invoke('throwItem', {
                    item: itemName,
                    type: 'weapon',
                    count: item.ammo
                });
                break;
            case 'custom':
                NuiCallback.invoke('throwItem', {
                    item: item,
                    type: 'custom',
                    count: 1
                });
                break;
        }
    }
});