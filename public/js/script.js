$(document).ready(function(){

    var $searchTrigger = $('[data-ic-class="search-trigger"]'),
        $searchInput = $('[data-ic-class="search-input"]'),
        $searchClear = $('[data-ic-class="search-clear"]');

    $searchTrigger.click(function(){

        var $this = $('[data-ic-class="search-trigger"]');
        $this.addClass('active');
        $searchInput.focus();

    });

    $searchInput.blur(function(){

        if($searchInput.val().length > 0){

            return false;

        } else {

            $searchTrigger.removeClass('active');

        }

    });

    $searchClear.click(function(){
        $searchInput.val('');
    });

    $searchInput.focus(function(){
        $searchTrigger.addClass('active');
    });
    // Contact US Send Message
    $(document).on("click", "#sendMessageContactUs", function(){
        const message = document.getElementById('messageContactUs').value;
        const email = document.getElementById('emailContactUs').value;
        const firstName = document.getElementById('firstNameContactUs').value;
        console.log(message,email,firstName);
        // console.log(11111111);
        $("#form2").submit((event) => {

            event.preventDefault();

            $.ajax({
                type: 'POST',
                url: '/sendMessageContactUs',
                data: $('#contactForm').serialize(),
                dataType: "json",
                success: (response) => {

                    alert("a");
                    console.log(response.Success);
                    $('#contactForm')[0].reset();
                    //alert("abc");
                    //document.getElementById("check").innerHTML = response.Success;

                    // setTimeout(() => {
                    //     document.getElementById("check").innerHTML = "";
                    // }, 3000);
                    // if (response.Success == "Password changed!") {
                    //     document.getElementById("aa").click();
                    // };
                },
                error: (e) => {
                    console.log(e)
                }
            })
        });
    })
});