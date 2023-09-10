function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderProductDetails(product) {
    // Create an array of star icons based on the rating
    const stars = Array.from({ length: 5 }, (_, index) =>
        index < product['rating']
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>'
    ).join('');

    // Generate the product details HTML
    const productDetailsHTML = `
        <div>
            <div class="image-container">
                <img src="${product['image'][0]['url']}" class="product-detail-image" id="detail-image" />
            </div>
            <div class="small-images-container">
                ${product['image'].map(img => `<img src="${img['url']}" class="small-image"/>`).join('')}
            </div>
        </div>
        <div class="product-detail-desc">
            <h1>${product['name']}</h1>
            <div class="reviews">
                <div>
                    ${stars}
                </div>
                <p>(20)</p>
            </div>
            <h4>Details: </h4>
            <p>${product['details']}</p>
            <p class="price">$ ${product['price']}</p>
            <div class="quantity">
                <h3>Quantity:</h3>
                <p class="quantity-desc">
                    <span class="minus"><i class="fa-solid fa-minus"></i></span>
                    <span class="num">1</span>
                    <span class="plus"><i class="fa-solid fa-plus"></i></span>
                </p>
            </div>
            <div class="buttons">
                <button type="button" class="add-to-cart" onclick="addToCart(${product['id']})">Add to Cart</button>
                <button type="button" class="buy-now" onclick="buySingleItem('${product['name']}', '${product['image'][0]['url']}', '${product['price']}')">Buy Now</button>

            </div>
        </div>
    `;

    $('.product-detail-container').html(productDetailsHTML);

    // Quantity button event handlers
    $('.minus').click(function () {
        let quantity = parseInt($('.num').text());
        if (quantity > 1) {
            $('.num').text(quantity - 1);
        }
    });

    $('.plus').click(function () {
        let quantity = parseInt($('.num').text());
        $('.num').text(quantity + 1);
    });

    let productDetailImage = document.getElementById('detail-image');
    let smallImages = document.querySelectorAll('.small-image');

    smallImages.forEach(element => {
        element.addEventListener('click', function () {
            productDetailImage.src = element.src;
        });
    });
}

function fetchProductDetails(productId) {
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/products/' + productId,
        method: 'GET',
        success: function (product) {
            console.log(product);
            renderProductDetails(product);

            // Fetch related products
            fetchRelatedProducts(productId);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function fetchRelatedProducts(productId) {
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/related_products?product_id=' + productId,
        method: 'GET',
        success: function (data) {
            let products = '';
            data.forEach(product => {
                products += `
                    <div>
                        <a href="/product.html?id=${product['id']}">
                            <div class="product-card">
                                <img src='${product["image"][0]["url"]}' class="product-image" />
                                <p class="product-name">${product['name']}</p>
                                <p class="product-price">$ ${product['price']}</p>
                            </div>
                        </a>
                    </div>
                `;
            });
            $('.maylike-products-container').html(products);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

// Function to make an AJAX request and return a promise
const fetchData = (url) => {
    return $.ajax({
        url: url,
        method: 'GET',
    });
};

// Function to render cart-item-qty
const renderCart = (cart) => {
    const cartContainer = $('.cart-container');
    const cartQty = cart.length;

    // Update cart quantity
    $('.cart-item-qty').html(cartQty);

    // Create cart heading
    const cartHeading = `
        <button type="button" class="cart-heading" onclick="hideCart()">
            <i class="fa-solid fa-chevron-left"></i>
            <span class="heading">Your Cart</span>
            <span class="cart-num-items">(${cartQty} item${cartQty !== 1 ? 's' : ''})</span>
        </button>
    `;

    // Check if the cart is empty
    if (cartQty < 1) {
        const emptyCart = `
            <div class="empty-cart">
                <AiOutlineShopping size={150} />
                <h3>Your shopping bag is empty</h3>
                <a href="/">
                    <button type="button" class="btn">
                        Continue Shopping
                    </button>
                </a>
            </div>
        `;
        cartContainer.html(cartHeading + emptyCart);
    } else {
        // Create cart items
        let cartItems = '';
        console.log(cart);
        cart.forEach(element => {
            cartItems += `
                <div class="product">
                    <img src='${element['_productdetails']['image'][0]['url']}' class="cart-product-image" />
                    <div class="item-desc">
                        <div class="flex top">
                            <h5>${element['_productdetails']['name']}</h5>
                            <h4>${element['_productdetails']['price']}</h4>
                        </div>
                        <div class="flex bottom">
                            <div> 
                                <p class="quantity-desc">
                                    <span class="minus2" data-id="${element['products_id']}"><i class="fa-solid fa-minus"></i></span>
                                    <span class="num2">${element['quantity']}</span>
                                    <span class="plus2" data-id="${element['products_id']}"><i class="fa-solid fa-plus"></i></span>
                                </p>
                            </div>
                            <button type="button" class="remove-item" onclick="removeItem(${element['id']})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

        });

        // Create cart container with items and total
        $.ajax({
            url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/totalprice',
            method: 'GET',
            success: function (data) {
                console.log(data);
                const cartContainerWithItems = `
                        <div class="product-container">
                            ${cartItems}
                        </div>
                        <div class="cart-bottom">
                            <div class="total">
                                <h3>Subtotal:</h3>
                                <h3 class="totalPrice">${data}</h3>
                            </div>
                            <div class="btn-container">
                                <button type="button" class="btn" onclick="handleCheckout()">
                                    Pay with Stripe
                                </button>
                            </div>
                        </div>
                    `;
                cartContainer.html(cartHeading + cartContainerWithItems);
            }
        });
    }
};

function removeItem(id) {
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart/' + id,
        method: 'delete',
        success: function (data) {
            console.log(data);
            $.ajax({
                url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
                method: 'GET',
                success: function (data) {
                    console.log(data);
                    renderCart(data);
                },
            });
        },
        error: function (error) {
            console.log(error);
        },
    });
}

function UpdateCartItem(product_id, qnt) {
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
        method: 'post',
        data: {
            "products_id": product_id,
            "quantity": qnt
        },
        success: function (data) {
            console.log(data);
            // Fetch cart items count
            $.ajax({
                url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/totalprice',
                method: 'GET',
                success: function (data) {
                    console.log(data);
                    $('.totalPrice').html(data);
                },
            });

        },
        error: function (error) {
            console.log(error);
        },
    });
}

// Function to render the hero banner
const renderHeroBanner = (heroBanner) => {
    const hero_banner = `<div>
        <p class="beats-solo">${heroBanner['smallText']}</p>
        <h3>${heroBanner['midText']}</h3>
        <h1>${heroBanner['largeText1']}</h1>
        <img src=${heroBanner['image']['url']} alt="headphones" class="hero-banner-image" />

        <div>
            <a href='/product.html?id=${heroBanner['products_id']}'>
                <button type="button">${heroBanner['buttonText']}</button>
            </a>
            <div class="desc">
                <h5>Description</h5>
                <p>${heroBanner['desc']}</p>
            </div>
        </div>
    </div>`;
    $('.hero-banner-container').html(hero_banner);
};

// Function to render the list of products
const renderProducts = (data) => {
    const products = data.map(product => `
        <div>
            <a href="/product.html?id=${product['id']}">
                <div class="product-card">
                    <img src='${product["image"][0]["url"]}' class="product-image" />
                    <p class="product-name">${product['name']}</p>
                    <p class="product-price">$ ${product['price']}</p>
                </div>
            </a>
        </div>`
    ).join('');

    $('.products-container').html(products);
};

// Function to render the footer banner
const renderFooterBanner = (footerBanner) => {
    const footer_banner = `<div class="banner-desc">
        <div class="left">
            <p>${footerBanner['discount']}% OFF</p>
            <h3>${footerBanner['largeText1']}</h3>
            <h3>${footerBanner['largeText2']}</h3>
            <p>${footerBanner['saleTime']}</p>
        </div>
        <div class="right">
            <p>${footerBanner['smallText']}</p>
            <h3>${footerBanner['midText']}</h3>
            <p>${footerBanner['desc']}</p>
            <a href='/product.html?id=${footerBanner['products_id']}'>
                <button type="button">${footerBanner['buttonText']}</button>
            </a>
        </div>
        <img src='${footerBanner['image']['url']}' class="footer-banner-image" />
    </div>`;
    $('.footer-banner-container').html(footer_banner);
};

// Function to handle errors
const handleAjaxError = (error) => {
    console.log(error);
};

// Async function to fetch and render data
const fetchDataAndRender = async () => {
    try {

        // Fetch cart items count
        const cartCount = await fetchData('https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart');
        renderCart(cartCount);

        // Fetch and render the hero banner
        const heroBanner = await fetchData('https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/hero_banner/1');
        renderHeroBanner(heroBanner);

        // Fetch and render the list of products
        const products = await fetchData('https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/products');
        renderProducts(products);

        // Fetch and render the footer banner
        const footerBanner = await fetchData('https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/footer_banner/1');
        renderFooterBanner(footerBanner);

        const productId = getProductIdFromURL();

        if (productId) {
            await fetchProductDetails(productId);
        }

    } catch (error) {
        handleAjaxError(error);
    }
};

// Execute the fetchDataAndRender function when the document is ready
$(document).ready(fetchDataAndRender);


function addToCart(id) {
    let qnt = parseInt($('.num').text());
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
        method: 'post',
        data: {
            "products_id": id,
            "quantity": qnt
        },
        success: function (data) {
            console.log(data);
            // Fetch cart items count
            $.ajax({
                url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
                method: 'GET',
                success: function (data) {
                    console.log(data);
                    $('.cart-item-qty').html(data.length);
                },
            });

        },
        error: function (error) {
            console.log(error);
        },
    });
}

function showCart() {
    $('.cart-wrapper').show();
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
        method: 'GET',
        success: function (data) {
            console.log(data);
            renderCart(data);
        },
    });
}

function hideCart() {
    $('.cart-wrapper').hide();
}

// Quantity button event handlers (consider using event delegation)
$('.cart-container').on('click', '.minus2', function () {
    let quantity = parseInt($(this).siblings('.num2').text());
    if (quantity > 1) {
        $(this).siblings('.num2').text(quantity - 1);
        UpdateCartItem($(this).attr('data-id'), -1);
    }
});

$('.cart-container').on('click', '.plus2', function () {
    let quantity = parseInt($(this).siblings('.num2').text());
    $(this).siblings('.num2').text(quantity + 1);
    UpdateCartItem($(this).attr('data-id'), 1);
});

function handleCheckout() {

    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/cart',
        method: 'GET',
        success: function (data) {
            console.log(data);

            $.ajax({
                url: 'https://x8ki-letl-twmt.n7.xano.io/api:Xoup0B6a/sessions',
                method: 'POST',
                data: {
                    "success_url": "http://127.0.0.1:5500/success.html",
                    "cancel_url": "http://127.0.0.1:5500/",
                    "line_items": data.map((item) => {
                        return {
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: item['_productdetails']['name'],
                                    images: [item['_productdetails']['image'][0]['url']],
                                },
                                unit_amount: item['_productdetails']['price'] * 100,
                            },
                            adjustable_quantity: {
                                enabled: true,
                                minimum: 1,
                            },
                            quantity: item['quantity']
                        }
                    }),

                    "shipping_Options": [
                        { shipping_rate: 'shr_1NonAlE5wWB0hyFpK7bMH7Wq' },
                    ]
                },
                success: function (data) {
                    console.log(data);
                    
                    window.location.href = data['url'];
                },
            });
        },
    });

}


function buySingleItem(name, image, price) {

    let quantity = parseInt($('.num').text());
    console.log(name, price, image, quantity);
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:Xoup0B6a/sessions',
        method: 'POST',
        data: {
            "success_url": "http://127.0.0.1:5500/success.html",
            "cancel_url": "http://127.0.0.1:5500/",
            "line_items": {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: name,
                            images: [image],
                        },
                        unit_amount: price * 100,
                    },
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1,
                    },
                    quantity: quantity
                },

            "shipping_Options": [
                { shipping_rate: 'shr_1NonAlE5wWB0hyFpK7bMH7Wq' },
            ]
        },
        success: function (data) {
            console.log(data);
            
            window.location.href = data['url'];
        },
    });

}

function resetCart(){
    $.ajax({
        url: 'https://x8ki-letl-twmt.n7.xano.io/api:cST3rUim/empty_cart',
        method: 'GET',
        success: function (data) {
            console.log(data);
        },
        error: function (error){
            console.log(error);
        }
    }); 
}