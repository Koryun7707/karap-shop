$(document).ready(function () {

    var $searchTrigger = $('[data-ic-class="search-trigger"]'),
        $searchInput = $('[data-ic-class="search-input"]'),
        $searchClear = $('[data-ic-class="search-clear"]');

    $searchTrigger.click(function () {
        var $this = $('[data-ic-class="search-trigger"]');
        if ($this[0].getAttribute('class').includes('active')) {
            $this.removeClass('active');
            document.getElementById('search-div').style.display = 'none'
        } else {
            $this.addClass('active');
            $searchInput.focus();
            document.getElementById('search-div').style.display = 'block'
        }
    });

    // $searchInput.blur(function () {
    //     if ($searchInput.val().length > 0) {
    //         document.getElementById('search-div').style.display = 'block';
    //         var $this = $('[data-ic-class="search-trigger"]');
    //
    //         $this.addClass('active');
    //     } else {
    //         document.getElementById('search-div').style.display = 'none'
    //         $searchTrigger.removeClass('active');
    //     }
    // });

    $searchClear.click(function () {
        $searchInput.val('');
    });

    $searchInput.focus(function () {
        $searchTrigger.addClass('active');

    });

    var minVal = 1, maxVal = 20; // Set Max and Min values
// Increase product quantity on cart page
    $(".increaseQty").on('click', function () {
        var $parentElm = $(this).parents(".qtySelector");
        $(this).addClass("clicked");
        setTimeout(function () {
            $(".clicked").removeClass("clicked");
        }, 100);
        var value = $parentElm.find(".qtyValue").val();
        if (value < maxVal) {
            value++;
        }
        $parentElm.find(".qtyValue").val(value);
    });
// Decrease product quantity on cart page
    $(".decreaseQty").on('click', function () {
        var $parentElm = $(this).parents(".qtySelector");
        $(this).addClass("clicked");
        setTimeout(function () {
            $(".clicked").removeClass("clicked");
        }, 100);
        var value = $parentElm.find(".qtyValue").val();
        if (value > 1) {
            value--;
        }
        $parentElm.find(".qtyValue").val(value);
    });


    $(".product-size ul li, .product-color ul li").on('click', function () {
        $(this).toggleClass("active")
    });

    function changeNumberShoppingCard() {
        let Cardlocal = JSON.parse(localStorage.getItem('shoppingCard'));
        if (Cardlocal) {
            document.getElementById('shoppingCardNumber').innerHTML = `${Cardlocal.length}`;
            document.getElementById('shoppingCardNumberS').innerHTML = `${Cardlocal.length}`;

        } else {
            document.getElementById('shoppingCardNumber').innerHTML = '0';
            document.getElementById('shoppingCardNumberS').innerHTML = '0';

        }
    }

    changeNumberShoppingCard();
});
