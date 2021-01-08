$(document).ready(function () {
    let searchValue;
    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example
    var $input = $('input[type=search]');

//on keyup, start the countdown
    $input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

//on keydown, clear the countdown
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });

//user is "finished typing," do something
    function doneTyping () {
        //do something
        searchValue = document.querySelector('input[type=search]').value;
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
                }
        $.ajax({
                    type: 'post',
                    url: '/shop-filter',
                    data: {types: values,brandIds:brandId, searchValue: searchValue},
                    success: (response) => {
                        console.log(response);
                        let filterDiv = document.getElementById('shopFilter');
                        $("#shopFilter").empty();
                        if(response.results.length) {
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
                        }else {
                            let newDiv = document.createElement('div');
                            newDiv.innerHTML = `
                            <h1>No Found Data</h1>`
                            filterDiv.append(newDiv);
                        }

                        console.log(response);
                    },
                    error: (e) => {
                        console.log(e)
                    }
                })
    }
    $(`input[type=checkbox]`).on('change', function () {
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
                if(response.results.length) {
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
                }else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                    <h1>No Found Data</h1>`
                    filterDiv.append(newDiv);
                }

                console.log(response);
            },
            error: (e) => {
                console.log(e)
            }
        })
    });
})