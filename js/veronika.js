const db = new GoogleSpreadsheetsDb(
    'AIzaSyBdjsu_0mERhpzaz79MxeFzhcyqsiniImc',
    '1XS0QuNBo29X_aaY5i47Y5shTj72vUE3vbu_tytBNsyo'
);

// https://docs.google.com/spreadsheets/d/1XS0QuNBo29X_aaY5i47Y5shTj72vUE3vbu_tytBNsyo/edit?usp=sharing

rows2 = {};

db.getAll('Database!A1:L100', (err, rows) => {
    rows2 = rows;

    elHTML_horeca = "";
    elHTML_auto = "";
    elHTML_security = "";
    elHTML_marketing = "";
    elHTML_other = "";
    
    rows.forEach(row => {
                
        if (!row.icon) {
            row.icon = "icon.jpg";
        }

        el = document.getElementById(row.category);

        switch (row.category) {
            case "HoReCa":
                elHTML_horeca = elHTML_horeca + generateHTML(row);
                el.innerHTML = elHTML_horeca;
                break;

            case "Авто":
                elHTML_auto = elHTML_auto + generateHTML(row);
                el.innerHTML = elHTML_auto;
                break;

            case "Безопасность":
                elHTML_security = elHTML_security + generateHTML(row);
                el.innerHTML = elHTML_security;
                break;

            case "Маркетинг":
                elHTML_marketing = elHTML_marketing + generateHTML(row);
                el.innerHTML = elHTML_marketing;
                break;

            case "Другое":
                elHTML_other = elHTML_other + generateHTML(row);
                el.innerHTML = elHTML_other;
                break;

            default:
                break;
        }
        runSwiper();
    });
})


generateHTML = function (row) {
    if (row.hidden != "yes") {
        return `
        <div class="swiper-slide">
            <img src="img/detectors/`+ row.icon + `" width="100%" class="rounded" onclick="showAlert(` + row.id + `)">
            <span class="mt-2 badge bg-success rounded-pill " onclick="showAlert(` + row.id + `)">`+ row.price + ` ₽ / мес</span>
            <br>
            <span class=""><b>`+ row.name + `</b></span><br>
        </div>`;
    } else {
        return "";
    }
}

showAlert = function (id, showMessage) {
    item = rows2[id - 1];
    img = "img/detectors/" + "screenshot.jpg"; // item.screenshot;
    // img = "img/detectors/" + "1.jpg";
    if (showMessage != false) {
        if (item.description) {

        } else {
            item.description = "";
        }
    
        Swal.fire({
            title: item.name,
            html: item.description,
            imageUrl: img,
            showCloseButton: true,
            confirmButtonText: item.price + " ₽ в месяц",
            // confirmButtonColor: 'rgb(77, 89, 166)',
            // imageAlt: 'Miska Bowls'
            // backdrop: `
            //     rgba(0,0,123,0.4)
            //     url("/gif/mew.gif")
            //     center top
            //     no-repeat
            //     `
        }).then((result) => {
            if (result.value) {
                addToCart(item);
            }
        })
    } else {
        addToCart(item);
    }

};

cart = [];

addToCart = function (item) {
    price = 0;
    cart.push(item);
    $("#totalOrder").html("");
    cart.forEach(element => {
        str = element.name + " – " + element.price + " ₽<br>"
        $("#totalOrder").append(str);
        price = price + parseInt(element.price);
    });
    $("#totalSum").html(price)
    if (price > 0) {
        $("#btnOrder").show();
        $("#cartClear").show();
    }
    animateCSS('#blockCart', 'pulse');
}

$("#cartClear").on("click", function () {
    cart = [];
    $("#totalSum").html("0");
    $("#totalOrder").html("В корзине пусто");
    $("#btnOrder").hide();
    $("#cartClear").hide();
    removeCustomBowl();
});

deliveryOption = 0;

$("#btnOrder").on("click", function () {

    if (deliveryOption == 0) {
        $("#totalSum").html( parseInt($("#totalSum").html()) + 200 );
        deliveryOption = 1;
    }

    if (deliveryOption == 1) {
        option1 = "checked";
        option2 = "";
    }

    if (deliveryOption == 2) {
        option1 = "";
        option2 = "checked";
    }
    
    Swal.fire({
        title: "Оформить заказ",
        confirmButtonText: 'Заказать',
        confirmButtonColor: 'rgb(77, 89, 166)',
        showCloseButton: true,
        html: `
        <div class="input-group flex-nowrap pt-2 pb-2">
            <input id="userName" type="text" class="form-control" placeholder="Ваше имя">
        </div>

        <div class="input-group flex-nowrap pb-2">
            <input id="phone" type="text" class="form-control" placeholder="Телефон">
        </div>
       
        <div class="btn-group btn-group-toggle pb-2" data-toggle="buttons">
        
            <label class="btn btn-secondary active">
                <input type="radio" name="options" onclick="deliveryMethod(1)" id="option1" ${option1}> Доставка
            </label>

            <label class="btn btn-secondary">
                <input type="radio" name="options" onclick="deliveryMethod(2)" id="option2" ${option2}> Самовывоз
            </label>
        </div>

        <div id="samovivoz" style="display: none" class="flex-nowrap pb-2">
            Шаумяна 90, можно подходить через 30 мин 
        </div>
        
        <div id="dostavka"  class="flex-nowrap">
            <textarea id="address" class="mb-2 form-control" placeholder="Адрес доставки"></textarea>
            Стоимость доставки 200₽ в пределах <a href="delivery.html" style="color: rgb(77, 89, 166);">зоны доставки</a>
            <br><br>
            Доставка осуществляется сервисом Яндекс GO
            
        </div>
        `
    }).then((result) => {

        userName = $("#userName").val();
        phone = $("#phone").val();
        address = "Самовывоз";
        if ( $("#address").val().length > 0 ) {
            address = $("#address").val();
        }

        if (phone.length > 5) {
            placeOrder($("#totalOrder").html(), $("#totalSum").html(), userName, phone, address, customBowl);
            Swal.fire({
                icon: 'success',
                title: 'Ваш заказ успешно оформлен',
                text: 'Открываем форму оплаты',
                showConfirmButton: false
            })
        } else if (result.isConfirmed) {
            Swal.fire({
                // icon: 'warning',
                title: 'Ой',
                text: 'Вы забыли указать телефон',
                confirmButtonColor: 'rgb(77, 89, 166)',
                confirmButtonText: 'Хорошо'
            })
        }

    });
});


deliveryMethod = function(id) {

    if (id == 1) {
        $("#dostavka").show();
        $("#samovivoz").hide();

        if (deliveryOption == 2) {
            $("#totalSum").html( parseInt($("#totalSum").html()) + 200 );
            deliveryOption = id;
        }
    }

    if (id == 2) {
        $("#dostavka").hide();
        $("#samovivoz").show();

        if (deliveryOption == 1) {
            $("#totalSum").html( parseInt($("#totalSum").html()) - 200 );
            deliveryOption = id;
        }
    }

}


placeOrder = function (order, sum, userName, phone, address, customBowl) {

    customBowlTxt = "";
    if (customBowl) {
        customBowlTxt = "Свой боул:<br>" + customBowl +"<br><br>";
    }

    jQuery.ajax({
        type: "POST",
        url: "https://hook.integromat.com/d9pqvw3awypa7v8mvfby5k3w59s6rv45",
        data: {
            'message': {
                'from_email': 'robot@miskabowls.ru',
                'from_name': 'Miska Orders',
                'to': [{
                    'email': "orders@miskabowls.ru",
                    'name': "",
                    'type': 'to'
                }],
                'autotext': 'true',
                'subject': "Новый заказ",
                'html': "Заказ:<br>" + order + "<br>Итого: " + sum + " ₽<br><br>" + customBowlTxt + "Имя: "+ userName +"<br>Телефон: " + phone + "<br>Адрес доставки: " + address
            }
        }
    }).done(function (response) {
        removeCustomBowl();
        
        // window.location.href = "/success.html";
        $("#payFormDesc").val(userName + " " + phone);
        $("#payFormVal").val(sum);
        $( "#payForm" ).submit();
    }).fail(function (error) {
        Swal.fire({
            icon: 'error',
            title: 'Ой',
            text: 'Произошла ошибка при попытке отправить уведомление на orders@miskabowls.ru, пожалуйста, сообщите об этом администрации сайта',
            confirmButtonText: 'Ок'
        })
        console.log(error);
    });
}


i = 0;
function runSwiper() {
    i++;
    if (i > 14) {
        const swiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: false,
            slidesPerView: "4.5",
            spaceBetween: 10,
            grabCursor: true,
            breakpoints: {
                // when window width is >= 320px
                320: {
                  slidesPerView: 2.5,
                  spaceBetween: 20
                },
                // when window width is >= 480px
                480: {
                  slidesPerView: 3.5,
                  spaceBetween: 30
                },
                // when window width is >= 640px
                640: {
                  slidesPerView: 6,
                  spaceBetween: 40
                }
              }
        });
    }
}

customBowl = false;

if ( customBowlCheck() ) {

    array = customBowlCheck()
    
    item = {
        id: "",
        name: "свой боул",
        category: "",
        icon: "",
        price: array.split("|")[0],
        output: "",
        description: array.split("|")[1]
    }

    addToCart(item);
    customBowl = item.description;
}



