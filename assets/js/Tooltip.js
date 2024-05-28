

export class Tooltip {
    static toggleItemTooltip(bool, item) {
        switch (bool) {
            case true:
                $('#itemTooltip').fadeIn(function() {

                });
                break;
            case false:
                $('#itemTooltip').fadeOut();
                break;
        }
    }
}