$(document).ready(function () {
    $(`input[type=checkbox],input[type=search]`).on('change', function () {
        // if($('input[type=search]').change()){
        //     var  searchValue = document.querySelector('input[type=search]').value;
        //     console.log(searchValue)
        // }
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            // var searchValue;
            $.each($('input:checked'), function (index, input) {
                values.push(input.value);
            });

            // console.log(document.querySelector('input[type=search]').value);
            console.log(values)
         //   $.post('/shop-filter', values);
            $.ajax({
                            type: 'post',
                            url: '/shop-filter',
                            data: {types:values},
                            success: (response) => {
                                console.log(response);
                            },
                            error: (e) => {
                                console.log(e)
                            }
                        })
            alert(values.join(','));
        }else{
            var  searchValue = document.querySelector('input[type=search]').value;
            console.log(searchValue)
        }




    });
})