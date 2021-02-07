//This part vor product price
function searchByPrice() {
    const priceFrom = document.getElementById('priceFrom').value;
    const priceTo = document.getElementById('priceTo').value;
    if (!priceFrom.length || !priceTo.length) {
        let priceDivMessage = document.getElementById('price-div-message');
        priceDivMessage.innerHTML = `Please write down the price.`;
        priceDivMessage.style.display = "block";
        setTimeout(() => {
            priceDivMessage.innerHTML = "";
            priceDivMessage.style.display = "none";
        }, 1000);

    } else {
        //write our code here
        let searchValue = document.querySelector('input[type=search]').value || '';
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandNames = [];
            $.each($('input:checked'), function (index, input) {
                if (input.value.includes('11')) {
                    let val = input.value.substring(0, input.value.length - 2);
                    brandNames.push(val);
                } else {
                    values.push(input.value);
                }
            });
        }


        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {
                types: values,
                brandNames: brandNames,
                searchValue: searchValue,
                page: 1,
                priceFrom: priceFrom,
                priceTo: priceTo
            },
            success: (response) => {
                if (response.results.pageCount > 0) {
                    $('#pagination-place').empty();
                    document.getElementById('pagination-place').setAttribute('value', response.results.pageCount);
                    let paginationPlace = document.getElementById('pagination-place');
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
                        paginationPlace.append(a);
                    }
                }
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        filterDiv.append(newDiv);
                        newDiv.setAttribute('class', 'col-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="d-flex">
                                          <div class="mr-3"> 
                                            <h2 id='styleDiv${item._id}' style="text-decoration: line-through">${item.price}€</h2>
                                        </div>
                                      
                                        <div id="${item._id}" style="display: none">
                                            <h2 >${Number(item.price) - Math.round(Number(item.price) * Number(item.sale) / 100)}€</h2>
                                        </div>                                     
                                        
                                        </div>
                                       
                                        <div class="title" id="title${item._id}"></div>
                                    </a>
                                </div>
                            `;
                        if (document.getElementById('example').value === 'eng') {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.name}`;
                        } else {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.nameArm}`;
                        }
                        if (item.sale) {
                            document.getElementById(`${item._id}`).style.display = 'block';
                        } else {
                            document.getElementById(`styleDiv${item._id}`).style.textDecoration = 'none';
                        }
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

    //location href
    function gup(name, url) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
    }

    //when shop page render first time called ==>
    function getProductByPagination() {


        let type = gup('type', location.href);
        const brandNames = gup('brandName', location.href);
        const priceFrom = document.getElementById('priceFrom').value;
        const priceTo = document.getElementById('priceTo').value;
        if (type) {
            type = decodeURI(type);
        }
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {page: 1, type: type, brandNames: brandNames, priceFrom: priceFrom, priceTo: priceTo},
            success: (response) => {
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
                        filterDiv.append(newDiv);
                        newDiv.setAttribute('class', 'col-6 col-lg-4 d-flex justify-content-center');
                        console.log(item.sale);
                        newDiv.innerHTML = `
                                <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                       
                                        <div class="d-flex">
                                           <div class="mr-3">
                                            <h2 id="styleDiv${item._id}" style="text-decoration: line-through">${item.price}€</h2>
                                        </div>
                                        <div  id="${item._id}" style="display: none">
                                            <h2 >${Number(item.price) - Math.round(Number(item.price) * Number(item.sale) / 100)}€</h2>
                                        </div>
                                           </div>
                                        <div class="title" id="title${item._id}"></div>
                                    </a>
                                                     
                                </div>
                            `
                        ;
                        if (document.getElementById('example').value === 'eng') {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.name}`;
                        } else {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.nameArm}`;
                        }
                        if (item.sale) {
                            document.getElementById(`${item._id}`).style.display = 'block';
                        } else {
                            document.getElementById(`styleDiv${item._id}`).style.textDecoration = 'none';
                        }

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
        //get price product
        const priceFrom = document.getElementById('priceFrom').value;
        const priceTo = document.getElementById('priceTo').value;
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandNames = [];
            $.each($('input:checked'), function (index, input) {
                if (input.value.includes('11')) {
                    let val = input.value.substring(0, input.value.length - 2);
                    brandNames.push(val);
                } else {
                    values.push(input.value);
                }
            });
        }

        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {
                page: pageNumber,
                priceFrom: priceFrom,
                priceTo: priceTo,
                types: values,
                brandNames: brandNames,

            },
            success: function (response) {
                let filterDiv = document.getElementById('shopFilter');
                $("#shopFilter").empty();
                if (response.results.data.length) {
                    response.results.data.forEach(function (item) {
                        let newDiv = document.createElement('div');
                        filterDiv.append(newDiv);
                        newDiv.setAttribute('class', 'col-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                  <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>

                                    <div class="d-flex">
                                       <div class="mr-3">
                                            <h2 id="styleDiv${item._id}" style="text-decoration: line-through">${item.price}€</h2>
                                         
                                        </div>
                                          <div id="${item._id}" style="display: none">
                                            <h2 >${Number(item.price) - Math.round(Number(item.price) * Number(item.sale) / 100)}€</h2>
                                        </div>

                                    </div>
                                      
                                        <div id="title${item._id}" class="title"></div>
                                    </a> 
                                </div>
                            `
                        ;
                        if (document.getElementById('example').value === 'eng') {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.name}`;
                        } else {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.nameArm}`;
                        }
                        if (item.sale) {
                            document.getElementById(`${item._id}`).style.display = 'block';
                        } else {
                            document.getElementById(`styleDiv${item._id}`).style.textDecoration = 'none';
                        }
                        filterDiv.append(newDiv);
                    })
                } else {
                    let newDiv = document.createElement('div');
                    newDiv.innerHTML = `
                            <h1>No Found Data</h1>`

                }
            },
            error: function (data) {
                console.log('User creation failed :' + data);
            }
        });
    };

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

// user is "finished typing, or choose checkbox" get page number and send to back end

    function doneTyping(page) {
        let pageNumber;
        if (page > 0) {
            pageNumber = page;
        } else {
            pageNumber = undefined;
        }
        //do something
        searchValue = document.querySelector('input[type=search]').value;
        const priceFrom = document.getElementById('priceFrom').value;
        const priceTo = document.getElementById('priceTo').value;
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandNames = [];
            $.each($('input:checked'), function (index, input) {
                if (input.value.includes('11')) {
                    let val = input.value.substring(0, input.value.length - 2);
                    brandNames.push(val);
                } else {
                    values.push(input.value);
                }
            });
        }
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {
                types: values,
                brandNames: brandNames,
                searchValue: searchValue,
                page: pageNumber,
                priceFrom: priceFrom,
                priceTo: priceTo
            },
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
                        filterDiv.append(newDiv);
                        newDiv.setAttribute('class', 'col-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                  <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="d-flex">
                                          <div class="mr-3">
                                            <h2 id="styleDiv${item._id}" style="text-decoration: line-through">${item.price}€</h2>
                                        </div>
                                         <div id="${item._id}" style="display: none">
                                            <h2 >${Number(item.price) - Math.round(Number(item.price) * Number(item.sale) / 100)}€</h2>
                                        </div>
</div>
                                       
                                        <div id="title${item._id}" class="title"></div>
                                    </a>
                                    
                                </div>
                            `
                        ;
                        if (document.getElementById('example').value === 'eng') {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.name}`;
                        } else {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.nameArm}`;
                        }
                        if (item.sale) {
                            document.getElementById(`${item._id}`).style.display = 'block';
                        } else {
                            document.getElementById(`styleDiv${item._id}`).style.textDecoration = 'none';
                        }
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
        let pageNumber;
        if (page > 0) {
            pageNumber = page;
        } else {
            pageNumber = undefined;
        }
        searchValue = ''
        if ($('input[type=checkbox]').is(':checked')) {
            var values = [];
            var brandNames = [];
            var onSale;
            $.each($('input:checked'), function (index, input) {
                if (input.value.includes('11')) {
                    let val = input.value.substring(0, input.value.length - 2);
                    brandNames.push(val);
                } else if (input.value === 'on') {
                    onSale = input.value;
                } else {
                    values.push(input.value);
                }
            });
        }
        console.log(values);
        searchValue = document.querySelector('input[type=search]').value;
        const priceFrom = document.getElementById('priceFrom').value;
        const priceTo = document.getElementById('priceTo').value;
        $.ajax({
            type: 'post',
            url: '/shop-filter',
            data: {
                types: values,
                priceFrom: priceFrom,
                priceTo: priceTo,
                brandNames: brandNames,
                searchValue: searchValue,
                onSale: onSale,
                page: pageNumber
            },
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
                        filterDiv.append(newDiv);
                        newDiv.setAttribute('class', 'col-6 col-lg-4 d-flex justify-content-center');
                        newDiv.innerHTML = `
                                   <div class="card shop-card">
                                    <a href="/product?_id=${item._id}">
                                        <div class="img-area">
                                            <img class="card-img-top" src="${item.images[0]}" alt="Card image cap">
                                        </div>
                                        <div class="d-flex">
                                         <div class="mr-3">
                                            <h2 id="styleDiv${item._id}" style="text-decoration: line-through">${item.price}€</h2>
                                        </div>
                                         <div id="${item._id}" style="display: none">
                                            <h2 >${Number(item.price) - Math.round(Number(item.price) * Number(item.sale) / 100)}€</h2>
                                        </div>
                                        
</div>
                                       
                                        <div id="title${item._id}" class="title"></div>
                                    </a>
                                    
                                </div>
                            `
                        ;
                        if (document.getElementById('example').value === 'eng') {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.name}`;
                        } else {
                            document.getElementById(`title${item._id}`).innerHTML = `${item.nameArm}`;
                        }
                        if (item.sale) {
                            document.getElementById(`${item._id}`).style.display = 'block';
                        } else {
                            document.getElementById(`styleDiv${item._id}`).style.textDecoration = 'none';
                        }

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
    $("amount").on("change", function () {
        console.log(this.value)
    });


})
