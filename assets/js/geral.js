$mobile = 812;
$url = window.location.origin;

$(".helperComplement ").remove();

var header = {
    Accept: "application/json",
    "REST-range": "resources=0-100",
    "Content-Type": "application/json; charset=utf-8",
};

var insertMasterData = function (ENT, loja, dados, fn) {
    $.ajax({
        url: "/api/dataentities/" + ENT + "/documents",
        type: "PATCH",
        data: dados,
        headers: header,
        success: function (res) {
            fn(res);
        },
        error: function (res) {
            swal(
                "Oops!",
                "Houve um problema. Tente novamente mais tarde.",
                "error"
            );
        },
    });
};

var anchor = function () {
    $("a.anchor").on("click", function (event) {
        event.preventDefault();
        $("html, body").animate({
                scrollTop: $($(this).attr("href")).offset().top,
            },
            500
        );
    });
};
anchor();

var set_cookie = function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

var get_cookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

var format_real = function (int) {
    var tmp = int + "";
    tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
    if (tmp.length > 6) tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

    return tmp;
};

var carrinho = (function () {
    var geral = {
        toggle_carrinho: function () {
            desktop.cartLateral();
            $("header #cart").on("click", function (event) {
                event.preventDefault();
                $("body").addClass("cart_open");
                $("#cart-lateral, #overlay").addClass("active");
            });

            $("#cart-lateral .header .close").on("click", function (event) {
                event.preventDefault();
                $("body").removeClass("cart_open");
                $("#cart-lateral, #overlay").removeClass("active");
            });
        },
    };

    var desktop = {
        calculateShipping: function () {
            $("#search-cep").submit(function (e) {
                e.preventDefault();
                mycep = $('#search-cep input[type="text"]').val();
                $.ajax({
                    type: "GET",
                    url: "https://viacep.com.br/ws/" + mycep + "/json/",
                }).done(function (res) {
                    if (res.uf == "SP") {
                        $("#cart-lateral").addClass("frete_sp");
                    } else {
                        $("#cart-lateral").removeClass("frete_sp");
                    }
                });
                mycep = mycep.replace(/[^0-9.]/g, "");
                if (mycep.length == 8) {
                    var postalCode = mycep;
                    var country = "BRA";
                    var address = {
                        postalCode: postalCode,
                        country: country,
                    };
                    vtexjs.checkout
                        .calculateShipping(address)
                        .done(function () {
                            vtexjs.checkout
                                .getOrderForm()
                                .done(function (orderForm) {
                                    if (orderForm.totalizers.length != 0) {
                                        var value_frete =
                                            orderForm.totalizers[1].value / 100;
                                        value_frete = value_frete
                                            .toFixed(2)
                                            .replace(".", ",")
                                            .toString();
                                        $("#cart-lateral .value-frete").text(
                                            "R$: " + value_frete
                                        );
                                        var postalCode = $(
                                            '#search-cep input[type="text"]'
                                        ).val();
                                        localStorage.setItem("cep", postalCode);
                                        $('#search-cep input[type="text"]').val(
                                            postalCode
                                        );
                                        $("#cart-lateral .frete").addClass(
                                            "active_b2"
                                        );
                                        desktop.cartLateral();
                                    }
                                });
                        });
                }
            });
            $(".return-frete").click(function (e) {
                $("#cart-lateral .frete").removeClass("active_b2");
            });
        },

        cartLateral: function () {
            vtexjs.checkout.getOrderForm().done(function (orderForm) {
                //REMOVE LOADING
                $("#cart-lateral .columns").removeClass("loading");
                //TOTAL CARRINHO
                var quantidade = 0;
                for (var i = orderForm.items.length - 1; i >= 0; i--) {
                    quantidade =
                        parseInt(quantidade) +
                        parseInt(orderForm.items[i].quantity);
                }

                $("header #cart span").text(quantidade);

                //INFORMACOES DO CARRINHO
                if (orderForm.value != 0) {
                    total_price = orderForm.value / 100;
                    total_price = total_price
                        .toFixed(2)
                        .replace(".", ",")
                        .toString();

                    $("#cart-lateral .footer .total-price").text(
                        "R$: " + total_price
                    );
                } else {
                    $("#cart-lateral .footer .total-price").text("R$: 0,00");
                }

                if (orderForm.totalizers.length != 0) {
                    sub_price = orderForm.totalizers[0].value / 100;
                    sub_price = sub_price
                        .toFixed(2)
                        .replace(".", ",")
                        .toString();

                    $(
                        "#cart-lateral .footer .value-sub-total, #cart-lateral .header .value-sub-total"
                    ).text("R$: " + sub_price);

                    //FRETE
                    if (orderForm.totalizers[1]) {
                        $("#cart-lateral .entrega .value").html(
                            "R$ " + format_real(orderForm.totalizers[1].value)
                        );
                    }
                } else {
                    $(
                        "#cart-lateral .footer .value-sub-total, #cart-lateral .header .value-sub-total"
                    ).text("R$: 0,00");
                }

                if (orderForm.items != 0) {
                    total_items = orderForm.items.length;
                    if (total_items > 1) {
                        $("#cart-lateral .clear").addClass('actived');
                    } else {
                        $("#cart-lateral .clear").removeClass('actived');
                    }
                    if (total_items == 1) {
                        $("#cart-lateral .header .total-items span").text(
                            total_items + " Item"
                        );
                    } else {
                        $("#cart-lateral .header .total-items span").text(
                            total_items + " Itens"
                        );
                    }
                } else {
                    $("#cart-lateral .header .total-items span").text(
                        "0 Itens"
                    );
                    $("#cart-lateral .footer .entrega .value").html(
                        '<a href="/checkout" title="Calcular">Calcular</a>'
                    );
                }
                //FIM - INFORMACOES DO CARRINHO

                //ITEMS DO CARRINHO
                $("#cart-lateral .content ul li").remove();
                for (i = 0; i < orderForm.items.length; i++) {
                    price_item = orderForm.items[i].price / 100;
                    price_item = price_item
                        .toFixed(2)
                        .replace(".", ",")
                        .toString();

                    var content = "";

                    content += '<li data-index="' + i + '">';
                    content +=
                        '<div class="column_1"><img src="' +
                        orderForm.items[i].imageUrl +
                        '" alt="' +
                        orderForm.items[i].name +
                        '"/></div>';

                    content += '<div class="column_2">';
                    content += '<div class="name">';
                    content += "<p>" + orderForm.items[i].name + "</p>";
                    content += "</div>";

                    content += '<div class="ft">';
                    content += "<ul>";
                    content += '<li class="price">';
                    content += "<p>R$: " + price_item + "</p>";
                    content += "</li>";
                    content += '<li data-index="' + i + '">';
                    content += '<div class="box-count">';
                    content += '<a href="" class="count count-down">-</a>';
                    content +=
                        '<input type="text" value="' +
                        orderForm.items[i].quantity +
                        '" />';
                    content += '<a href="" class="count count-up">+</a>';
                    content += "</div>";
                    content += "</li>";
                    content += "<ul>";

                    content += "</div>";
                    content += "</div>";

                    content +=
                        '<span class="removeUni"><img src="/arquivos/ico-trash.png" alt="Remover Produto"/></span>';
                    content += "</li>";

                    $("#cart-lateral .content > ul").append(content);
                }
                //FIM - ITEMS DO CARRINHO
                desktop.frete_gratis(200);
            });
        },

        changeQuantity: function () {
            $(document).on("click", "#cart-lateral .count", function (e) {
                e.preventDefault();

                $("#cart-lateral .columns").addClass("loading");

                var qtd = $(this).siblings('input[type="text"]').val();
                if ($(this).hasClass("count-up")) {
                    qtd++;
                    $(this)
                        .siblings('input[type="text"]')
                        .removeClass("active");
                    $(this).siblings('input[type="text"]').val(qtd);
                } else if ($(this).hasClass("count-down")) {
                    if ($(this).siblings('input[type="text"]').val() != 1) {
                        qtd--;
                        $(this).siblings('input[type="text"]').val(qtd);
                    } else {
                        //ALERTA 0 USUARIO QUANTIDADE NEGATIVA
                        $(this)
                            .siblings('input[type="text"]')
                            .addClass("active");
                    }
                }

                var data_index = $(this).parents("li").data("index");
                var data_quantity = $(this)
                    .parents("li")
                    .find('.box-count input[type="text"]')
                    .val();

                vtexjs.checkout.getOrderForm().then(function (orderForm) {
                    var total_produtos = parseInt(orderForm.items.length);
                    vtexjs.checkout
                        .getOrderForm()
                        .then(function (orderForm) {
                            var itemIndex = data_index;
                            var item = orderForm.items[itemIndex];

                            var updateItem = {
                                index: data_index,
                                quantity: data_quantity,
                            };

                            return vtexjs.checkout.updateItems(
                                [updateItem],
                                null,
                                false
                            );
                        })
                        .done(function (orderForm) {
                            desktop.cartLateral();
                        });
                });
            });
        },

        removeItems: function () {
            $(document).on("click", "#cart-lateral .removeUni", function () {
                var data_index = $(this).parents("li").data("index");
                var data_quantity = $(this)
                    .siblings("li")
                    .find('.box-count input[type="text"]')
                    .val();

                vtexjs.checkout
                    .getOrderForm()
                    .then(function (orderForm) {
                        var itemIndex = data_index;
                        var item = orderForm.items[itemIndex];
                        var itemsToRemove = [{
                            index: data_index,
                            quantity: data_quantity,
                        }, ];
                        return vtexjs.checkout.removeItems(itemsToRemove);
                    })
                    .done(function (orderForm) {
                        desktop.cartLateral();
                    });
            });
        },

        removeAllItems: function () {
            $("#cart-lateral .clear").on("click", function () {
                vtexjs.checkout.removeAllItems().done(function (orderForm) {
                    //ATUALIZA O CARRINHO AP�S ESVAZIAR
                    desktop.cartLateral();
                });
            });
        },

        add_cart: function () {
            // Vitrines
            $(".buy-button-normal a").click(function (e) {
                e.preventDefault();
                alert("add to cart!");
                var id = $(this).parent().attr("id");
                var item = {
                    id: id,
                    quantity: 1,
                    seller: "1",
                };
                vtexjs.checkout.addToCart([item], null, 1).done(function () {
                    $("#cart-lateral, #overlay").addClass("active");
                    $("body").addClass("cart_open");
                    desktop.cartLateral();
                });
            });
        },

        frete_gratis: function (qnt) {
            var valor = $("#cart-lateral .footer .total-price").text();
            valor = valor.replace(/[^0-9-.,]/g, "");
            valor = valor.replace(",", ".");
            var faltam = qnt - valor;
            faltamn = faltam;
            faltam = faltam.toFixed(2).replace(".", ",").toString();
            var porcentagem = Math.round((faltamn * 100) / qnt);
            var porcentagem = 100 - porcentagem;
            if (faltamn >= 0) {
                $("#cart-lateral .frete_bar span i").text(faltam);
                $("head").append(
                    "<style>#cart-lateral .frete_bar .display_bar:before{width:" +
                    porcentagem +
                    "% !important;}#cart-lateral .frete_bar .display_bar:after{left:calc(" +
                    porcentagem +
                    "% - 30px) !important;} </style>"
                );
                $("#cart-lateral .frete_bar span:nth-child(1)").removeClass(
                    "dis-none"
                );
                $("#cart-lateral .frete_bar span:nth-child(2)").removeClass(
                    "active"
                );
            } else {
                $("head").append(
                    "<style>#cart-lateral .frete_bar .display_bar:before{width:100% !important;}#cart-lateral .frete_bar .display_bar:after{left:calc(100% - 30px) !important}</style>"
                );
                $("#cart-lateral .frete_bar span:nth-child(1)").addClass(
                    "dis-none"
                );
                $("#cart-lateral .frete_bar span:nth-child(2)").addClass(
                    "active"
                );
            }
        },

        btn_buy: function () {
            window.alert = function () {
                //OPEN CART
                $("#cart-lateral, #overlay").addClass("active");
                $("body").addClass("cart_open");
                desktop.cartLateral();
            };
        },

        openCart: function () {
            $("#overlay").on("click", function () {
                if ($("#cart-lateral").hasClass("active")) {
                    $("#cart-lateral, #overlay").removeClass("active");
                    $("body").removeClass("cart_open");
                }
            });
        },
    };

    geral.toggle_carrinho();
    desktop.add_cart();
    desktop.cartLateral();
    desktop.calculateShipping();
    desktop.changeQuantity();
    desktop.removeItems();
    desktop.removeAllItems();
    desktop.btn_buy();
    desktop.openCart();
})();

var erro = (function () {
    var ambos = {
        buscavazia: function () {
            $("#buscavazia").submit(function (event) {
                event.preventDefault();
                let text = $('#buscavazia input[type="text"]').val();
                window.location.href = text;
            });
        },
    };

    ambos.buscavazia();
})();

var geral = (function () {
    var ambos = {
        nav_all: function () {
            $("#nav-open-menu").on('click', function (event) {
                event.preventDefault();
                $('header nav, #overlay, body').addClass('active');
            });

            $(".nav-close-menu, #overlay").on('click', function (event) {
                event.preventDefault();
                $('header nav, #overlay, body').removeClass('active');
            });

            $("nav .column ul li .nav-next-menu, nav .column ul li .link-next-menu").on('click', function (event) {
                event.preventDefault();
                let type = $(this).parents('.column').data('type');
                let data = $(this).data();

                if (data) {
                    if (type === 'departamento') {
                        //HIDE DEPARTAMENTO, SHOW CATEGORIAS
                        $("nav > .column_1").hide();
                        $("nav > .column_2").show();
                        
                        //SHOW ESPECIFIC CATEGORY
                        $("nav .column_2 .content").removeClass("active");
                        $("nav .column_2 .content[data-categoria='" + data.departamento + "']").addClass('active');
                    } else if (type === 'categoria') {
                        //HIDE DEPARTAMENTO, SHOW CATEGORIAS
                        $("nav > .column_2").hide();
                        $("nav > .column_3").show();
                        
                        //SHOW ESPECIFIC CATEGORY
                        $("nav .column_3 .content").removeClass("active");
                        $("nav .column_3 .content[data-subcategoria='" + data.sub + "']").addClass('active');
                    }
    
                    //TÍTUTLO
                    $("nav .nav-header .nav-title").text($(this).text());
                }
            });
        },

        nav_back: function () {
            // $('header .submenu').on('mouseenter', function () {
            //     let ul = $(this).find('ul');

            //     $(ul).slick({
            //         infinite: false,
            //         autoplay: false,
            //         arrows: true,
            //         dots: false,
            //         slidesToShow: 8,
            //         slidesToScroll: 1
            //     });
            // });

            $(".nav-back-menu").on("click", function (e) {
                e.preventDefault();
                let type = $(this).parents('.column').data('type');

                if (type === 'categoria') {
                    $("nav > .column_2").hide();
                    $("nav > .column_1").show();
                } else if (type === "subcategoria") {
                    $("nav > .column_3").hide();
                    $("nav > .column_2").show();
                }
            });
        },

        newsletter: function () {
            $("#newsletterButtonOK").val("Enviar");
        },

        searchPersonalizado: function (qntDesk, qntMobile) {
            qntItens = $(window).width() < 768 ? qntMobile : 9;
            $(".result-search").append('<div class="overlay desktop"></div>');
            $(".result-search .container").append('<div class="close">X Fechar</div>');
            $(".busca .fulltext-search-box").on("input", function () {
                texto = $(this).val();
                if (texto != "") {
                    $("header .busca").addClass("actived");
                    $(".result-search .overlay").addClass("active");
                    $(".result-search").css("display", "block");
                    if ($(window).width() > 768) {
                        $(".result-search").addClass("desktop");
                    } else {
                        $(".result-search").addClass("mobile_s");
                    }
                    $.ajax({
                        url: "/api/catalog_system/pub/products/search/" + texto,
                        type: "GET",
                        dataType: "json",
                    }).done(function (result) { 
                        $("header .result-search .slider").html("");
                        $(
                            "header .result-search .button-veja_mais"
                        ).removeClass("actived");
                        $(
                            "header .result-search .container .arrow-left"
                        ).remove();
                        $(
                            "header .result-search .container .arrow-right"
                        ).remove();
                        count = 0;
                        $(result).each(function (index, element) {
                            prodName = element.items[0].name;
                            prodID = element.productId;
                            prodLink = element.link;
                            brand = element.brand;
                            imgUrl = element.items[0].images[0].imageUrl;
                            price =
                                element.items[0].sellers[0].commertialOffer
                                .Price;
                            initalPrice =
                                element.items[0].sellers[0].commertialOffer
                                .PriceWithoutDiscount;
                            stock =
                                element.items[0].sellers[0].commertialOffer
                                .AvailableQuantity;
                            if (stock > 0) {
                                busca =
                                    '<div class="result-item" data-id=' +
                                    prodID +
                                    ">";
                                busca += '<a href="' + prodLink + '">';
                                busca +=
                                    '<div class="image"><img src="' +
                                    imgUrl +
                                    '" /></div>';
                                busca +=
                                    '<div class="infos"><div class="name"><h3>' +
                                    prodName +
                                    "</h3></div>";
                                busca += '<div class="box_price">';
                                busca +=
                                    '<p class="ver_produto"><span>Ver Produto</span></p>';
                                busca += "</div></div>";
                                busca += "</div>";
                            }
                            $("header .result-search .slider").append(busca);
                            if (count == qntItens) {
                                $(
                                    "header .result-search .button-veja_mais"
                                ).attr("href", texto);
                                $(
                                    "header .result-search .button-veja_mais"
                                ).addClass("actived");
                                return false;
                            } else {
                                count++;
                            }
                        });
                        if (qntItens > 6 && count > 6) {
                            $("header .result-search .container").append(
                                '<span class="arrow-left">left</span>'
                            );
                            $("header .result-search .container").append(
                                '<span class="arrow-right">right</span>'
                            );
                            $(
                                "header .result-search .container .arrow-left"
                            ).click(function (event) {
                                $(
                                    ".result-search .result-display .slider"
                                ).animate({
                                    scrollTop: $(
                                        ".result-search .result-display .slider"
                                    ).scrollTop() - 350,
                                });
                            });
                            $(
                                "header .result-search .container .arrow-right"
                            ).click(function (event) {
                                $(
                                    ".result-search .result-display .slider"
                                ).animate({
                                    scrollTop: $(
                                        ".result-search .result-display .slider"
                                    ).scrollTop() + 350,
                                });
                            });
                        }
                    });
                }
            });
            $(".result-search .overlay,.result-search .container .close").click(
                function (e) {
                    $("header .busca").removeClass("actived");
                    $(".result-search .overlay").removeClass("active");
                    $(".result-search").css("display", "none");
                }
            );
        },

        flags: function () {
            $(".prateleira article").each(function (index, element) {
                var prodId = $(this).data("id");
                $.ajax({
                    url: "/api/catalog_system/pub/products/search?fq=productId:" +
                        prodId,
                    type: "GET",
                }).done(function (response, status) {
                    if (response[0].productClusters[172]) {
                        $(element).append(
                            '<img src="/arquivos/flag_frete-gratis.png" alt="Flag frete grátis" style="position:absolute; right:15px; top:35px;">'
                        );
                    }
                });
            });
        },
    };

    var desktop = {
        subtitle: function () {
            $(".prateleira").each(function (index, item) {
                let title = $(item).find("h2");
                let subtitle = $(item).prev(".subtitle").text();

                title.append("<small>" + subtitle + "</small>");
            });
        },

        prateleira: function () {
            $("body:not(.departamento) .prateleira:not(.compre_junto) ul").each(
                function (index, item) {
                    let li = $(item).find("li").length;

                    if (li > 4) {
                        $(item).slick({
                            infinite: true,
                            autoplay: true,
                            autoplaySpeed: 4000,
                            arrows: true,
                            dots: false,
                            slidesToShow: 4,
                            slidesToScroll: 1,
                        });
                    }
                }
            );
        },
    };

    var mobile = {
        hamburger: function () {
            $("#hamburger").on("click", function (e) {
                e.preventDefault();
                $("header nav, body, #overlay").toggleClass("active");
            });
        },

        busca: function () {
            $("header .btn.busca").on("click", function (e) {
                e.preventDefault();
                $("header .busca").toggleClass("active");
            });
        },

        prateleira: function () {
            $(
                "body:not(.departamento) .prateleira:not(.compre_junto) ul"
            ).slick({
                infinite: true,
                autoplay: true,
                arrows: false,
                dots: false,
                slidesToShow: 2,
                slidesToScroll: 1,
                autoplaySpeed: 4000,
                variableWidth: true,
            });
        },

        toggle: function () {
            $("footer .toggle .title").on("click", function () {
                $(this).toggleClass("active");
                $(this).next("ul").slideToggle();
            });
        },
    };

    ambos.nav_all();
    ambos.nav_back();
    ambos.newsletter();
    ambos.searchPersonalizado(12, 6);
    // ambos.flags();
    if ($("body").width() < $mobile) {
        mobile.hamburger();
        mobile.busca();
        mobile.prateleira();
        mobile.toggle();
    } else {
        desktop.subtitle();
        desktop.prateleira();
    }
})();

var home = (function () {
    var ambos = {
        marcas: function () {
            $("#marcas ul").slick({
                infinite: true,
                autoplay: true,
                arrows: true,
                dots: false,
                slidesToShow: 6,
                slidesToScroll: 1,
                autoplaySpeed: 4000,
                responsive: [{
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                            variableWidth: true,
                        },
                    },
                    {
                        breakpoint: 810,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                            variableWidth: true,
                        },
                    },
                ],
            });
        },

        instagram: function (username) {
            if ($('#instagram').length) {
                $.instagramFeed({
                    'username': username,
                    'container': '#instagram',
                    'display_profile': false,
                    'display_biography': false,
                    'display_gallery': true,
                    'get_raw_json': true,
                    'callback': function (data) {
                        data = $.parseJSON(data);
                        let post = data.images;
    
                        $.each(post, function (index, item) {
                            if (index < 6) {
                                $('#instagram ul').append('<li><a href="https://www.instagram.com/p/' + item.node.shortcode + '" target="_blank"><img src="' + item.node.thumbnail_src + '"/></a></li>');
                            }
                        });
    
                        $('#instagram ul').slick({
                            dots: true,
                            arrows: false,
                            autoplay: 3000,
                            slidesToShow: 4,
                            slidesToScroll: 1,
                            responsive: [{
                                breakpoint: 960,
                                settings: {
                                    dots: false,
                                    slidesToShow: 1,
                                    variableWidth: true
                                },
                            }, ],
                        });
    
                        $('#instagram').show();
                    }
                });
            }
        }
    };

    ambos.marcas();
    ambos.instagram('fermaquinasoficial');

    var desktop = {
        banner: function () {
            $(".home .banner.desktop .column_1 ul").slick({
                dots: false,
                arrows: true,
                autoplay: true,
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplaySpeed: 2000
            });

            //FULL
            if ($('.home .banner.full .box-banner').length > 1) {
                $(".home .banner.full > ul").slick({
                    dots: true,
                    arrows: false,
                    autoplay: true,
                    infinite: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplaySpeed: 2000
                });
            }
        },
    };

    var mobile = {
        banner: function () {
            $(".home .banner.mobile ul").slick({
                dots: false,
                arrows: false,
                autoplay: true,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplaySpeed: 4000,
            });
        },

        tipbar: function () {
            $(".home .tipbar ul").slick({
                dots: false,
                arrows: false,
                autoplay: true,
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplaySpeed: 4000,
            });
        },

        departaments: function () {
            $(".home .departaments ul").slick({
                dots: false,
                arrows: false,
                autoplay: true,
                infinite: false,
                slidesToShow: 2,
                slidesToScroll: 1,
                autoplaySpeed: 4000,
                variableWidth: true,
            });
        },
    };

    if ($("body").width() < $mobile) {
        mobile.banner();
        mobile.tipbar();
        mobile.departaments();
    } else {
        //DESKTOP
        desktop.banner();
    }
})();

var produto = (function () {
    var ambos = {
        desconto: function (value) {
            if (vtxctx.categoryName != "Scanner") {
                var valorInicial = value;
                valorInicial = valorInicial.replace(/[^\d]/gi, "");
                valorInicial = parseFloat(valorInicial);
                valorInicial = valorInicial / 100;
                valorDesconto = valorInicial * 0.9;
                valorDesconto = valorDesconto
                    .toFixed(2)
                    .replace(".", ",")
                    .toString();

                if (valorDesconto.length > 6) {
                    valorDesconto = valorDesconto.replace(
                        /([0-9]{3}),([0-9]{2}$)/g,
                        ".$1,$2"
                    );
                }

                $(".descricao-preco").prepend('<em class="valor-desconto"><strong>Por: <i></i></strong><p>com <b>10% de desconto</b> no boleto.</p></em>');
                $(".valor-por").prepend("<span>Ou</span>");
                $(".valor-desconto i").text("R$ " + valorDesconto);
            }
        },

        add_multiple_sku: function (arr) {
            var finalArr = arr.reduce((m, o) => {
                var found = m.find((p) => p.sku === o.sku);
                if (found) {
                    found.quantity += o.quantity;
                } else {
                    m.push(o);
                }
                return m;
            }, []);

            var addToCart = {
                index: 0,
                add: {
                    products: function (itens, cb) {
                        addToCart.products = addToCart.products || [];
                        itens = itens[0][0].reverse();
                        for (var i in itens) {
                            if (itens.hasOwnProperty(i)) {
                                addToCart.products.push({
                                    id: itens[i].sku,
                                    quantity: itens[i].quantity,
                                    seller: itens[i].seller,
                                });
                            }
                        }
                        addToCart.index = addToCart.products.length - 1;
                        addToCart.add.product(
                            addToCart.products[addToCart.index],
                            cb
                        );
                        return true;
                    },
                    product: function (item, cb) {
                        var adding = false;
                        if (
                            typeof addToCart.products !== "undefined" &&
                            addToCart.index < 0 &&
                            typeof cb === "function"
                        ) {
                            addToCart.products = [];
                            cb();
                        }
                        if (typeof item == "undefined") {
                            return false;
                        }
                        var product = {
                            id: item.id,
                            quantity: 1 * item.quantity,
                            seller: item.seller || 1,
                        };
                        var next = function () {
                            addToCart.log(
                                "Product id: " +
                                product.id +
                                ", quantity: " +
                                product.quantity +
                                " added."
                            );
                            if (typeof addToCart.products != "undefined") {
                                addToCart.index--;
                                addToCart.add.product(
                                    addToCart.products[addToCart.index],
                                    cb
                                );
                            }
                        };
                        if (!adding) {
                            var add = function (prod) {
                                var url =
                                    "/checkout/cart/add?sku=" +
                                    prod.id +
                                    "&seller=1&redirect=false&qty=" +
                                    prod.quantity;
                                adding = true;
                                $.get(url, function () {
                                    adding = false;
                                    next();
                                });
                            };
                            vtexjs.checkout
                                .getOrderForm()
                                .then(function (orderForm) {
                                    var found = false;
                                    var items = orderForm.items;
                                    if (
                                        typeof orderForm != "undefined" &&
                                        orderForm.items.length > 0
                                    ) {
                                        for (var i in items) {
                                            if (
                                                items.hasOwnProperty(i) &&
                                                items[i].id == product.id
                                            ) {
                                                found = true;
                                                (product.index = items[i].sku),
                                                (product.quantity =
                                                    items[i].quantity),
                                                (product.seller =
                                                    items[i].seller);
                                            } else {
                                                found = false;
                                            }
                                        }
                                    }

                                    add(product);
                                    return true;
                                });
                        }
                        return true;
                    },
                },
                log: function () {
                    if (
                        "undefined" == typeof console &&
                        "undefined" == typeof arguments &&
                        "undefined" == typeof console.log
                    ) {
                        return false;
                    }
                    for (var i in arguments) {
                        console.log(arguments[i]);
                    }
                    return true;
                },
            };
            var addProducts = function (data, cb) {
                addToCart.add.products(data, cb);
                return true;
            };
            var addProduct = function (item, cb) {
                var data = [
                    [item.id, item.quantity, item.seller]
                ];
                addToCart.add.products(data, cb);
                return true;
            };

            addProducts([
                [finalArr]
            ], function () {
                window.location.href = "/checkout";
                $('a[data-function="add-multiple-sku"]').removeClass(
                    "disabled"
                );
            });
        },

        thumbs: function () {
            $(".produto .thumbs").slick({
                infinite: true,
                autoplay: false,
                autoplaySpeed: 4000,
                arrows: true,
                dots: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                responsive: [{
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        },
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        },
                    },
                ],
            });

            $(".produto .thumbs .slick-dots li").each(function (index, item) {
                $(item).attr("data-index", index);
            });

            $('.produto .thumbs .slick-list li:not(".slick-cloned")').each(
                function (i, item) {
                    //VALIDAÇÃO PARA VIDEO
                    let index = $(item)
                        .parents(".slick-slide")
                        .attr("data-slick-index");

                    let image = $(item).find("img").attr("src");

                    //VIDEO
                    if (image === undefined) {
                        $(
                            ".produto .thumbs .slick-dots li[data-index=" +
                            index +
                            "]"
                        ).addClass("slick-video");
                    }

                    $(
                        ".produto .thumbs .slick-dots li[data-index=" +
                        index +
                        "]"
                    ).css("background-image", "url(" + image + ")");
                }
            );

            //ZOOM APENAS DESKTOP
            if ($("body").width() > $mobile) {
                $(".thumbs .slick-slide").zoom();
            }
        },

        parcelamento: function () {
            $(".titulo-parcelamento").on("click", function () {
                $(this).parents(".other-payment-method").toggleClass("active");
                $(this).next("ul").slideToggle();
            });
        },

        detalhes: function () {
            $(".produto .btn_detalhes").on("click", function () {
                $('.produto .tabs .options a[data-step="1"]').trigger("click");
            });
        },

        tabs: function () {
            $(".produto .tabs .options a").on("click", function (event) {
                event.preventDefault();

                $(
                    ".produto .tabs .options a, .produto .content .step"
                ).removeClass("active");

                $(this).addClass("active");
                $(".produto .content .step_" + $(this).data("step")).addClass(
                    "active"
                );
            });
        },

        trustvox_jump: function () {
            $(document).on("click", 'a[href="#trustvox-reviews"]', function () {
                $(
                    '.produto main .row_2 .tabs .options ul li a[data-step="3"]'
                ).trigger("click");
            });
        },

        ficha_tecnica: function () {
            $("#caracteristicas table.group").each(function (index, item) {
                let name = $(item).attr("class").split(" ")[1];

                $(item).appendTo(
                    '.produto .tabs .content .step.step_2 .list .box[data-name="' +
                    name +
                    '"]'
                );
                $(
                    '.produto .tabs .content .step.step_2 .list .box[data-name="' +
                    name +
                    '"]'
                ).removeClass("dis-none");
            });

            if (
                $(".produto main .row_2 .tabs .content .step.step_2 table")
                .length
            ) {
                $(
                    '.produto main .row_2 .tabs .options ul li a[data-step="2"]'
                ).removeClass("dis-none");
            }
        },

        buttons: function (response) {
            //PDF
            if (vtxctx.departmentName != "ACESSÓRIOS") {
                $(".produto .product_info .btn_pdf").removeClass("dis-none");
            }

            if (response[0].Manual) {
                $(".produto .product_info .btn_pdf").attr(
                    "href",
                    response[0].Manual[0]
                );
            }

            //VALE A PENA INVESTIR EM BATERIA?
            if (vtxctx.categoryName === "PARA PRODUTOS A BATERIA") {
                //$('.produto .product_info .btn_bateria').removeClass('dis-none');
            }
        },

        compre_junto: function () {
            //HÁ PRODUTOS PARA COMPRE JUNTO?
            if ($(".box_compre_junto .prateleira li").length != 0) {
                $(".box_compre_junto").removeClass("dis-none");

                //URL PARA CHECKOUT - var buy
                if (skuJson.skus.length === 1) {
                    var buy =
                        "/checkout/cart/add?sku=" +
                        skuJson.skus[0].sku +
                        "&qty=1&seller=1&";
                } else {
                    if (selectedToBuy[0] === undefined) {
                        $(".box_compre_junto .column_2 article .buy").addClass(
                            "disabled"
                        );
                    } else {
                        $(
                            ".box_compre_junto .column_2 article .buy"
                        ).removeClass("disabled");
                        var buy =
                            "/checkout/cart/add?sku=" +
                            selectedToBuy[0] +
                            "&qty=1&seller=1&";
                    }
                }

                //VALOR FINAL
                function total() {
                    var total = 0;
                    //VALOR: PRODUTO DA PÁGINA
                    $(skuJson.skus).each(function (a, b) {
                        if (b.available === true) {
                            total = total = b.bestPrice;
                            $(
                                ".box_compre_junto .column_2 article p strong"
                            ).text("R$ " + format_real(b.bestPrice));
                        }
                    });

                    //VALOR: PRODUTOS DO COMPRE JUNTO
                    $(
                        ".box_compre_junto .prateleira ul li.adicionado article"
                    ).each(function (a, b) {
                        let data_id = $(b).data("id");
                        vtexjs.catalog
                            .getProductWithVariations(data_id)
                            .done(function (product) {
                                total = total += product.skus[0].bestPrice;
                                $(
                                    ".box_compre_junto .column_2 article p strong"
                                ).text("R$ " + format_real(total));

                                buy = buy +=
                                    "sku=" +
                                    product.skus[0].sku +
                                    "&qty=1&seller=1&";
                                $(
                                    ".box_compre_junto .column_2 article .buy"
                                ).attr("href", buy);
                            });
                    });
                }
                total();

                //ADD
                $(".box_compre_junto .prateleira ul li article .add").on(
                    "click",
                    function (event) {
                        event.preventDefault();

                        $(this).addClass("active");
                        $(this).text("Adicionado");
                        $(this).parents("li").addClass("adicionado");

                        total();
                    }
                );
            }
        },

        avise_me: function () {
            $("#notifymeButtonOK").val("Enviar");
        },

        text_preco: function () {
            $(window).load(function () {
                $(".produto main .plugin-preco .valor-por").after(
                    '<p class="valor-boleto">Já com <strong>10% de desconto</strong> no boleto ou em</i>'
                );
            });
        },
    };

    var mobile = {
        share: function () {
            $('#share').attr('href', 'https://wa.me/?text=' + window.location.href);
        }
    };

    if ($("body").hasClass("produto")) {
        ambos.desconto($(".preco-a-vista .skuPrice").text());
        ambos.thumbs();
        ambos.parcelamento();
        ambos.detalhes();
        ambos.tabs();
        ambos.trustvox_jump();
        ambos.ficha_tecnica();
        ambos.compre_junto();
        ambos.avise_me();
        // ambos.text_preco();

        $.ajax({
            url: "/api/catalog_system/pub/products/search?fq=productId:" +
                skuJson.productId,
            type: "GET",
            headers: header,
        }).done(function (response) {
            ambos.buttons(response);
        });

        if ($('body').width() < $mobile) {
            mobile.share();
        }
    }
})();

var departamento = (function () {
    var prateleira = {
        desconto: function () {
            $('.prateleira ul li > .product[data-available="True"] .por:not(.discount)').each(function (index, item) {
                if ($(this).parent().parent().parent().data("category") != "Scanner") {
                    var valorInicial = $(item).text();
                    valorInicial = valorInicial.replace(/[^\d]/gi, "");
                    valorInicial = parseFloat(valorInicial);
                    valorInicial = valorInicial / 100;
                    valorDesconto = valorInicial * 0.9;
                    valorDesconto = valorDesconto.toFixed(2).replace(".", ",").toString();

                    if (valorDesconto.length > 6) {
                        valorDesconto = valorDesconto.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
                    }

                    $(item).text("R$ " + valorDesconto);
                    $(item).append("<small> à vista</small>");
                    $(item).addClass("discount");
                }
            });
        },
        limitName : function () {
            $('.prateleira ul li > .product').each(function (index, element) {
                nameProd = $(this).find('.name').text()
                if(nameProd.length > 85){
                    $(this).find('.name').find('a').text(nameProd.substr(0,85)+'...');
                }
            });
        }
    };

    var ambos = {
        smart_research: function () {
            $(".search-multiple-navigator input[type='checkbox']").vtexSmartResearch({
                shelfCallback: function () {
                    console.log("shelfCallback");
                },

                ajaxCallback: function () {
                    console.log("ajaxCallback");
                    prateleira.limitName();
                    prateleira.desconto();
                },
            });
        },
    };

    var desktop = {
        result: function () {
            $("#result strong").text(
                $(
                    ".searchResultsTime:first-child .resultado-busca-numero .value"
                ).text()
            );
        },

        ordernar_por: function () {
            $("#ordenacao").on("change", function () {
                //REMOVE SELEÇÃO ATUAL DE ORDENAÇÃO
                $(
                    '.departamento .flags .content li[data-type="Ordenacao"]'
                ).trigger("click");

                //ATIVA NOVA ORDENAÇÃO
                $(
                    '.departamento .search-multiple-navigator label[title="' +
                    $(this).val() +
                    '"]'
                ).trigger("click");
            });
        },

        flags: function () {
            //ADD
            $(document).on(
                "change",
                ".search-multiple-navigator label input",
                function () {
                    var thisName = $(this).parent().text(),
                        thisClass = $(this).parent().attr("title"),
                        fatherTitle = $(this)
                        .parents("fieldset")
                        .find("h5")
                        .text(),
                        type = fatherTitle === "Ordenar por" ? "Ordenacao" : "",
                        categoriaSelecionada =
                        '<li data-type="' +
                        type +
                        '" data-name="' +
                        thisClass +
                        '"><div><p><small>' +
                        fatherTitle +
                        "</small><strong>" +
                        thisName +
                        "</strong></p><i>x</i></div></li>";

                    if ($(this).parent().hasClass("sr_selected")) {
                        $(".flags ul").append(categoriaSelecionada);
                    } else {
                        $(
                            '.flags .content ul li[data-name="' +
                            thisClass +
                            '"]'
                        ).remove();
                    }

                    //RESET SELECT - ORDENAÇÃO
                    $("#ordenacao option:first").prop("selected", true);
                }
            );

            //REMOVE
            $(document).on("click", ".flags li", function (e) {
                e.preventDefault();
                $(
                    '.search-multiple-navigator label[title="' +
                    $(this).data("name") +
                    '"]'
                ).trigger("click");
            });

            //CLEAR
            $(".flags .btn.clear").on("click", function (e) {
                e.preventDefault();
                $(".flags .content ul li").trigger("click");
            });
        },

        toggle: function () {
            $(".search-single-navigator h4 a").on("click", function (e) {
                e.preventDefault();
                $(this).toggleClass("active");
                $(this).parents("h4").next("ul").slideToggle();
            });
        },
    };

    var mobile = {
        ordernar_por: function () {
            //ORDENAR EM PRIMEIRO
            $("fieldset[data-name='Ordenacao']").insertBefore(
                "fieldset.filtro_marca"
            );
        },

        filtrar: function () {
            $("#filtrar").on("click", function (e) {
                e.preventDefault();
                $(".full_menu, body, #overlay").toggleClass("active");
            });

            //FECHAR E APLICAR
            $(".full_menu .view, .full_menu .close").on("click", function (e) {
                e.preventDefault();
                $("#filtrar").trigger("click");
            });
        },

        fieldset: function () {
            $(
                ".departamento .full_menu .navigation-tabs .menu-departamento>div .search-multiple-navigator fieldset h5"
            ).on("click", function () {
                $(this).toggleClass("active");
                $(this).next("div").slideToggle();
            });
        }
    };

    prateleira.desconto();
    prateleira.limitName();

    if ($("body").hasClass("departamento")) {
        ambos.smart_research();

        desktop.result();
        // desktop.flags();
        desktop.ordernar_por();
        desktop.toggle();

        if ($("body").width() < $mobile) {
            mobile.ordernar_por();
            mobile.filtrar();
            mobile.fieldset();
            mobile.gotop();
        }
    }
})();

var departamento = (function () {
    var ambos = {
        breadcrumbs: function () {
            current = $(".institucional h2").text();
            if (current == "Garantia") {
                current = "Envio, Devolução e Garantia";
            }
            $(".breadcrumbs .current").text(current);
        },

        accordion: function () {
            $(".accordion-title").click(function (e) {
                $(this).toggleClass("actived");
            });
        },

        navActive: function () {
            current = $(".institucional h2").text();
            if (current == "Garantia") {
                current = "Envio, Devolução e Garantia";
            }
            $(".display-nav li:contains(" + current + ")").addClass("actived");
        },
    };
    ambos.breadcrumbs();
    ambos.accordion();
    ambos.navActive();
})();