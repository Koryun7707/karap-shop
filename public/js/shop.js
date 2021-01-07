$(document).ready(function () {
    let searchValue;
    $(`input[type=checkbox],input[type=search]`).on('change', function () {
        searchValue = ''
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandId = [];
            $.each($('input:checked'), function (index, input) {
                if(input.value.length > 20){
                    brandId.push(input.value);
                }else{
                    values.push(input.value);
                }
            });
            console.log(brandId)
            alert(values.join(','));
        }
        searchValue = document.querySelector('input[type=search]').value;
        console.log(searchValue)
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {types: values,brandIds:brandId, searchValue: searchValue},
            success: (response) => {
                console.log(response);
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                response.results.forEach(function (item) {
                    let newDiv = document.createElement('div');
                    newDiv.setAttribute('class', 'col-md-6 col-lg-4 d-flex justify-content-center');
                    newDiv.innerHTML = `    
                        <div class="card shop-card">
                            <a href="/product">
                                <div class="img-area">
                                    <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                </div>
                                <div class="title">${item.name}</div>
                            </a>
                            <a href="#" class="btn btn-green-gradient py-3">AD TO CART</a>
                        </div>
                    `
                    ;
                    filterDiv.append(newDiv);
                })
                console.log(response);
            },
            error: (e) => {
                console.log(e)
            }
        })
    });
})