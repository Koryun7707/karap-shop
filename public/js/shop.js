function addToCard(id){
    let shoppingCard = Number(document.getElementById('shoppingCardNumber').innerHTML);
    shoppingCard++;
    let Cardlocal = JSON.parse(localStorage.getItem('shoppingCard'));
    console.log(Cardlocal);
    if(Cardlocal){
        if(Cardlocal.includes(id.value)){
            alert('Sorry but product is already added');
        }else{
            document.getElementById('shoppingCardNumber').innerHTML = `${shoppingCard}`;
            Cardlocal.push(id.value);
            Cardlocal= JSON.stringify(Cardlocal);
            localStorage.setItem('shoppingCard',Cardlocal);
        }

    }else{
        document.getElementById('shoppingCardNumber').innerHTML = `${shoppingCard}`;
        let array = [];
        array.push(id.value);
        array= JSON.stringify(array);
        localStorage.setItem('shoppingCard',array);
    }
}
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

    //when shop page render first time called ==>
    function getProductByPagination() {

        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {page: 1},
            success: (response) => {
                console.log('first',response)
                if (response.results.pageCount > 0) {
                    document.getElementById('pagination-place').setAttribute('value', response.results.pageCount);
                    let paginatinPlace = document.getElementById('pagination-place');
                    for (let i = -1; i < response.results.pageCount + 1; i++) {
                        let a = document.createElement('a');
                        a.setAttribute('onclick', 'giveChosenPage(this);');
                        if (i === -1) {
                            a.setAttribute('id', `-1`);
                            a.setAttribute('value', `-1`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `&laquo;`
                        } else if (i === 0) {
                            a.setAttribute('id', '1');
                            a.setAttribute('value', '1');
                            a.setAttribute('class', `active`);
                            a.innerHTML = '1'
                        } else if (i > 0 && i !== response.results.pageCount) {
                            a.setAttribute('id', `${i + 1}`);
                            a.setAttribute('value', `${i + 1}`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `${i + 1}`
                        } else {
                            a.setAttribute('id', `+1`);
                            a.setAttribute('value', `+1`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `&raquo;`
                        }
                        paginatinPlace.append(a);
                    }
                }
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'col-md-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="title">${item.name}</div>
                                    </a>
                                    
                                    <button value="${item._id}"  class="btn btn-green-gradient py-3" onclick="addToCard(this)">
                                        ADD TO CART</button>                 
                                </div>
                            `
                        ;

                        filterDiv.append(newDiv);
                    })
                } else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                            <h1>No Found Data</h1>`
                    filterDiv.append(newDiv);
                }
            },
            error: (e) => {
                console.log(e)
            }
        })
    };
    window.addEventListener('load', getProductByPagination);
    //works when user click on page items
    window.giveChosenPage = (item) => {
        let pagesCount = document.getElementById('pagination-place').getAttribute('value');
        const elementValue = item.getAttribute('value');
        const elementAttributes = item.getAttribute('class');
        let pageNumber;
        if (elementValue === '-1') {
            console.log(1111);
            for (let i = 1; i <= Number(pagesCount); i++) {
                if (document.getElementById(`${i}`).getAttribute('class').includes('active')) {
                    if (i === 1) {
                        pageNumber = i;
                        document.getElementById(`${i}`).setAttribute("class", "page-item active");
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item disabled");
                        break;
                    } else {
                        pageNumber = i - 1;
                        document.getElementById(`${i - 1}`).setAttribute("class", "page-item active");
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                        break;
                    }
                }
            }
        } else if (elementValue === '+1') {
            console.log(2222);
            for (let i = 1; i <= Number(pagesCount); i++) {
                if (document.getElementById(`${i}`).getAttribute('class').includes('active')) {
                    if (i === Number(pagesCount)) {
                        pageNumber = i;
                        document.getElementById(`${i}`).setAttribute("class", "page-item active");
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item disabled");
                        break;
                    } else {
                        pageNumber = i + 1;
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                        document.getElementById(`${i + 1}`).setAttribute("class", "page-item active");
                        break;
                    }
                }
            }
        } else {
            console.log(3333);
            if (elementAttributes.includes('active')) {
                for (let i = 1; i <= Number(pagesCount); i++) {
                    if (i === Number(elementValue)) {
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item active");
                    } else {
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                    }
                }
            } else {
                console.log(8);
                console.log(Number(pagesCount));
                for (let i = 1; i <= Number(pagesCount); i++) {
                    console.log(i);
                    if (i === Number(elementValue)) {
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item active");
                    } else {
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                    }
                }
            }
        }
        if (pageNumber === undefined) {
            pageNumber = Number(elementValue);
        }
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {page: pageNumber},
            success: function (response) {
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'col-md-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                  <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="title">${item.name}</div>
                                    </a>
                                    <button value="${item._id}"  class="btn btn-green-gradient py-3" onclick="addToCard(this)">
                                        ADD TO CART</button>  
                                </div>
                            `
                        ;
                        filterDiv.append(newDiv);
                    })
                } else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                            <h1>No Found Data</h1>`
                    filterDiv.append(newDiv);
                }
            },
            error: function (data) {
                console.log('User creation failed :' + data);
            }
        });
    };

// user is "finished typing, or choose checkbox" get page number and send to back end
    window.givePageNumber = (item) => {
        let pagesCount = document.getElementById('pagination-place').getAttribute('value');
        const elementValue = item.getAttribute('value');
        const elementAttributes = item.getAttribute('class');
        let pageNumber;
        if (elementValue === '-1') {
            for (let i = 1; i <= Number(pagesCount); i++) {
                if (document.getElementById(`${i}`).getAttribute('class').includes('active')) {
                    if (i === 1) {
                        pageNumber = i;
                        document.getElementById(`${i}`).setAttribute("class", "page-item active");
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item disabled");
                        break;
                    } else {
                        pageNumber = i - 1;
                        document.getElementById(`${i - 1}`).setAttribute("class", "page-item active");
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                        break;
                    }
                }
            }
        } else if (elementValue === '+1') {
            for (let i = 1; i <= Number(pagesCount); i++) {
                if (document.getElementById(`${i}`).getAttribute('class').includes('active')) {
                    if (i === Number(pagesCount)) {
                        pageNumber = i;
                        document.getElementById(`${i}`).setAttribute("class", "page-item active");
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item disabled");
                        break;
                    } else {
                        pageNumber = i + 1;
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                        document.getElementById(`${i + 1}`).setAttribute("class", "page-item active");
                        break;
                    }
                }
            }
        } else {
            if (elementAttributes.includes('active')) {
                for (let i = 1; i <= Number(pagesCount); i++) {
                    if (i === Number(elementValue)) {
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item active");
                    } else {
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                    }
                }
            } else {
                for (let i = 1; i <= Number(pagesCount); i++) {
                    if (i === Number(elementValue)) {
                        document.getElementById(`${elementValue}`).setAttribute("class", "page-item active");
                    } else {
                        document.getElementById(`${i}`).setAttribute("class", "page-item disabled");
                    }
                }
            }
        }
        if (pageNumber === undefined) {
            pageNumber = Number(elementValue);
        }
        return handeleOnchangeValue(pageNumber);
    };

    //page = return givePageNumber function
    function doneTyping(page) {
        let pageNumber;
        if (page > 0) {
            pageNumber = page;
        } else {
            pageNumber = undefined;
        }
        //do something
        searchValue = document.querySelector('input[type=search]').value;
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandId = [];
            $.each($('input:checked'), function (index, input) {
                if (input.value.length > 20) {
                    brandId.push(input.value);
                } else {
                    values.push(input.value);
                }
            });
        }
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {types: values, brandIds: brandId, searchValue: searchValue, page: pageNumber},
            success: (response) => {
                $("#pagination-place").empty();
                if (response.results.pageCount > 0) {
                    document.getElementById('pagination-place').setAttribute('value', response.results.count);
                    let paginatinPlace = document.getElementById('pagination-place');
                    for (let i = -1; i < response.results.pageCount + 1; i++) {
                        let a = document.createElement('a');
                        a.setAttribute('onclick', 'givePageNumber(this);');
                        if (i === -1) {
                            a.setAttribute('id', `-1`);
                            a.setAttribute('value', `-1`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `&laquo;`
                        } else if (i === 0) {
                            a.setAttribute('id', '1');
                            a.setAttribute('value', '1');
                            a.setAttribute('class', `active`);
                            a.innerHTML = '1'
                        } else if (i > 0 && i !== response.results.pageCount) {
                            a.setAttribute('id', `${i + 1}`);
                            a.setAttribute('value', `${i + 1}`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `${i + 1}`
                        } else {
                            a.setAttribute('id', `+1`);
                            a.setAttribute('value', `+1`);
                            a.setAttribute('class', `page-item`);
                            a.innerHTML = `&raquo;`
                        }
                        paginatinPlace.append(a);
                    }
                }
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'col-md-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                  <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="title">${item.name}</div>
                                    </a>
                                    <button value="${item._id}"  class="btn btn-green-gradient py-3" onclick="addToCard(this)">
                                        ADD TO CART</button>  
                                </div>
                            `
                        ;
                        filterDiv.append(newDiv);
                    })
                } else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                            <h1>No Found Data</h1>`
                    filterDiv.append(newDiv);
                }
            },
            error: (e) => {
                console.log(e)
            }
        })
    }

    //page = return givePageNumber function
    function handeleOnchangeValue(page) {
        console.log('page', page);
        // let pagesCount = Number(document.getElementById('pagination-place').getAttribute('value'));
        let pageNumber;
        if (page > 0) {
            // for (let i = 1; i < pagesCount; i++) {
            //     console.log('i', i, 'page', page);
            //     if (i === page) {
            //         console.log(1, page)
            //         document.getElementById(`${page}`).setAttribute('class', 'page-item active');
            //     } else {
            //         document.getElementById(`${i}`).setAttribute('class', 'page-item disable');
            //     }
            // }
            pageNumber = page;
        } else {
            pageNumber = undefined;
        }
        searchValue = ''
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandId = [];
            $.each($('input:checked'), function (index, input) {
                if (input.value.length > 20) {
                    brandId.push(input.value);
                } else {
                    values.push(input.value);
                }
            });
        }
        searchValue = document.querySelector('input[type=search]').value;
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {types: values, brandIds: brandId, searchValue: searchValue, page: pageNumber},
            success: (response) => {
                $("#pagination-place").empty();
                if (response.results.pageCount > 0) {
                    document.getElementById('pagination-place').setAttribute('value', response.results.pageCount);
                    let paginatinPlace = document.getElementById('pagination-place');
                    if (pageNumber && pageNumber > 0) {
                        for (let i = -1; i < response.results.pageCount + 1; i++) {
                            let a = document.createElement('a');
                            a.setAttribute('onclick', 'givePageNumber(this);');
                            if (i === -1) {
                                a.setAttribute('id', `-1`);
                                a.setAttribute('value', `-1`);
                                a.setAttribute('class', `page-item`);
                                a.innerHTML = `&laquo;`
                            } else if (i >= 0 && i !== response.results.pageCount) {
                                if (i !== pageNumber - 1) {
                                    a.setAttribute('id', `${i + 1}`);
                                    a.setAttribute('value', `${i + 1}`);
                                    a.setAttribute('class', `page-item`);
                                    a.innerHTML = `${i + 1}`
                                } else {
                                    a.setAttribute('id', `${i + 1}`);
                                    a.setAttribute('value', `${i + 1}`);
                                    a.setAttribute('class', `active`);
                                    a.innerHTML = `${i + 1}`
                                }
                            } else {
                                a.setAttribute('id', `+1`);
                                a.setAttribute('value', `+1`);
                                a.setAttribute('class', `page-item`);
                                a.innerHTML = `&raquo;`
                            }
                            paginatinPlace.append(a);
                        }
                    } else {
                        for (let i = -1; i < response.results.pageCount + 1; i++) {
                            let a = document.createElement('a');
                            a.setAttribute('onclick', 'givePageNumber(this);');
                            if (i === -1) {
                                a.setAttribute('id', `-1`);
                                a.setAttribute('value', `-1`);
                                a.setAttribute('class', `page-item`);
                                a.innerHTML = `&laquo;`
                            } else if (i === 0) {
                                a.setAttribute('id', '1');
                                a.setAttribute('value', '1');
                                a.setAttribute('class', `active`);
                                a.innerHTML = '1'
                            } else if (i > 0 && i !== response.results.pageCount) {
                                a.setAttribute('id', `${i + 1}`);
                                a.setAttribute('value', `${i + 1}`);
                                a.setAttribute('class', `page-item`);
                                a.innerHTML = `${i + 1}`
                            } else {
                                a.setAttribute('id', `+1`);
                                a.setAttribute('value', `+1`);
                                a.setAttribute('class', `page-item`);
                                a.innerHTML = `&raquo;`
                            }
                            paginatinPlace.append(a);
                        }
                    }
                }
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        newDiv.setAttribute('class', 'col-md-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                   <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="title">${item.name}</div>
                                    </a>
                                    <button value="${item._id}"  class="btn btn-green-gradient py-3" onclick="addToCard(this)">
                                        ADD TO CART</button>  
                                </div>
                            `
                        ;
                        filterDiv.append(newDiv);
                    })
                } else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                            <h1>No Found Data</h1>`
                    filterDiv.append(newDiv);
                }
            }
            ,
            error: (e) => {
                console.log(e)
            }
        })
    };
    $(`input[type=checkbox]`).on('change', handeleOnchangeValue)
})