console.log("Crochet by Zumar Cart Loaded");

// ===========================
// LOAD CART
// ===========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ===========================
// SAVE CART
// ===========================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ===========================
// UPDATE CART COUNT
// ===========================

function updateCartCount() {

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {

        const totalItems = cart.reduce((total, product) => {
            return total + (product.quantity || 1);
        }, 0);

        cartCount.textContent = totalItems;
    }
}

// ===========================
// UNIVERSAL PRODUCT OPTION READER
// Works for: dropdown only, text only, dropdown + custom text
// This is the ONLY place option-reading logic lives, so it
// automatically works for every current AND future product card.
// ===========================

function getProductOption(productCard) {

    const selectOption =
        productCard.querySelector("select.product-option");

    const textOption =
        productCard.querySelector('input[type="text"].product-option');

    // ---- DROPDOWN PRESENT ----
    if (selectOption) {

        const selectedValue = selectOption.value.trim();

        // Case-insensitive so "custom" / "Custom" / "CUSTOM" all work
        const isCustomChoice =
            selectedValue.toLowerCase() === "custom";

        if (isCustomChoice) {

            if (textOption && textOption.value.trim()) {
                return {
                    option: "Custom Colour: " + textOption.value.trim(),
                    error: null
                };
            }

            return {
                option: null,
                error: "Please write your own choice.",
                focusEl: textOption
            };
        }

        // Normal dropdown selection (e.g. "Red")
        return { option: selectedValue, error: null };
    }

    // ---- TEXT INPUT ONLY (no dropdown at all) ----
    if (textOption) {

        const typedValue = textOption.value.trim();

        if (!typedValue) {
            return {
                option: null,
                error: "Please enter your choice.",
                focusEl: textOption
            };
        }

        return { option: typedValue, error: null };
    }

    // ---- NO OPTION FIELD ON THIS PRODUCT ----
    return { option: "", error: null };
}

// ===========================
// ADD TO CART
// Uses event delegation on document, so it automatically works
// for every .add-to-cart button that exists now OR is added later.
// ===========================

document.addEventListener("click", function (e) {

    const button = e.target.closest(".add-to-cart");
    if (!button) return;

    const productCard = button.closest(".product-card");
    if (!productCard) return;

    const productName = button.dataset.name;
    const productPrice = Number(button.dataset.price);

    const result = getProductOption(productCard);

    if (result.error) {
        alert(result.error);
        if (result.focusEl) result.focusEl.focus();
        return;
    }

    const option = result.option;

    // ===========================
    // CHECK EXISTING PRODUCT
    // ===========================

    const existingProduct = cart.find(product =>
        product.name === productName &&
        product.option === option
    );

    if (existingProduct) {

        existingProduct.quantity += 1;

    } else {

        cart.push({
            name: productName,
            price: productPrice,
            option: option,
            quantity: 1
        });

    }

    saveCart();
    updateCartCount();

    if (option) {

        alert(
            productName +
            " (" +
            option +
            ") added to cart!"
        );

    } else {

        alert(productName + " added to cart!");

    }

});

// ===========================
// CART
// ===========================

const cartItems = document.getElementById("cart-items");

// ===========================
// RENDER CART
// ===========================

function renderCart() {

    if (!cartItems) {
        return;
    }

    // ===========================
    // EMPTY CART
    // ===========================

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="cart-empty">

                <h2>Your cart is empty.</h2>

                <p>
                    Add some beautiful handmade products to your cart!
                </p>

                <a href="shop.html" class="btn">
                    Continue Shopping
                </a>

            </div>
        `;

        updateCartCount();

        return;
    }

    let total = 0;
    let html = "";

    // ===========================
    // PRODUCTS
    // ===========================

    cart.forEach((product, index) => {

        const quantity = product.quantity || 1;

        const subtotal = product.price * quantity;

        total += subtotal;

        html += `
            <div class="cart-item">

                <div class="cart-product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    ${
                        product.option
                        ? `<p><strong>Option:</strong> ${product.option}</p>`
                        : ""
                    }

                    <p>
                        Rs. ${product.price} each
                    </p>

                </div>

                <div class="quantity-controls">

                    <button
                        class="quantity-btn decrease-btn"
                        data-index="${index}">
                        −
                    </button>

                    <span class="quantity">
                        ${quantity}
                    </span>

                    <button
                        class="quantity-btn increase-btn"
                        data-index="${index}">
                        +
                    </button>

                </div>

                <div class="cart-subtotal">

                    <strong>
                        Rs. ${subtotal}
                    </strong>

                </div>

                <button
                    class="btn remove-btn"
                    data-index="${index}">
                    Remove
                </button>

            </div>
        `;

    });

    // ===========================
    // DELIVERY DETAILS + TOTAL
    // ===========================

    html += `

        <div class="checkout-details">

            <h2>
                Delivery Details
            </h2>

            <p>
                Please enter your details before placing your order.
            </p>

            <input
                type="text"
                id="customer-name"
                placeholder="Your Full Name"
            >

            <input
                type="tel"
                id="customer-phone"
                placeholder="Your Phone Number"
            >

            <textarea
                id="customer-address"
                placeholder="Your Complete Delivery Address"
            ></textarea>

        </div>

        <div class="cart-summary">

            <h2>
                Total: Rs. ${total}
            </h2>

            <a
                href="#"
                class="btn"
                id="checkout-btn">
                Checkout on WhatsApp
            </a>

        </div>

    `;

    cartItems.innerHTML = html;

}

// ===========================
// CUSTOM COLOUR TOGGLE (UNIVERSAL)
// Works for EVERY product card that has a dropdown
// (select.product-option) with a "Custom" option AND
// a matching typed field (input[type="text"].product-option).
// Automatically applies to Tote, Octopus, Cardigan, Mikasa
// Scarf, and any future product built the same way — no
// per-product wiring needed.
// ===========================

function setupCustomOptionToggle(productCard) {

    const selectOption =
        productCard.querySelector("select.product-option");

    const textOption =
        productCard.querySelector('input[type="text"].product-option');

    // Only relevant for cards that have BOTH a dropdown and a text field
    if (!selectOption || !textOption) return;

    function syncCustomField() {

        const isCustom =
            selectOption.value.trim().toLowerCase() === "custom";

        if (isCustom) {
            textOption.style.display = "block";
        } else {
            textOption.style.display = "none";
            textOption.value = "";
        }
    }

    // Correct state as soon as the page loads
    syncCustomField();

    // Keep it in sync whenever the customer changes the dropdown
    selectOption.addEventListener("change", syncCustomField);
}

document.querySelectorAll(".product-card").forEach(function (productCard) {
    setupCustomOptionToggle(productCard);
});

// ===========================
// CART BUTTONS
// ===========================

document.addEventListener("click", function(e) {

    // ===========================
    // PLUS
    // ===========================

    if (e.target.classList.contains("increase-btn")) {

        const index = Number(e.target.dataset.index);

        if (cart[index]) {

            cart[index].quantity =
                (cart[index].quantity || 1) + 1;

            saveCart();

            renderCart();

            updateCartCount();

        }

    }

    // ===========================
    // MINUS
    // ===========================

    if (e.target.classList.contains("decrease-btn")) {

        const index = Number(e.target.dataset.index);

        if (!cart[index]) {
            return;
        }

        if (cart[index].quantity > 1) {

            cart[index].quantity -= 1;

        } else {

            cart.splice(index, 1);

        }

        saveCart();

        renderCart();

        updateCartCount();

    }

    // ===========================
    // REMOVE
    // ===========================

    if (e.target.classList.contains("remove-btn")) {

        const index = Number(e.target.dataset.index);

        if (!cart[index]) {
            return;
        }

        cart.splice(index, 1);

        saveCart();

        renderCart();

        updateCartCount();

    }

    // ===========================
    // WHATSAPP CHECKOUT
    // ===========================

    if (e.target.id === "checkout-btn") {

        e.preventDefault();

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return;
        }

        const nameInput =
            document.getElementById("customer-name");

        const phoneInput =
            document.getElementById("customer-phone");

        const addressInput =
            document.getElementById("customer-address");

        const customerName =
            nameInput ? nameInput.value.trim() : "";

        const customerPhone =
            phoneInput ? phoneInput.value.trim() : "";

        const customerAddress =
            addressInput ? addressInput.value.trim() : "";

        // ===========================
        // CHECK DETAILS
        // ===========================

        if (
            customerName === "" ||
            customerPhone === "" ||
            customerAddress === ""
        ) {

            alert(
                "Please enter your name, phone number and delivery address."
            );

            return;
        }

        // ===========================
        // CREATE WHATSAPP MESSAGE
        // ===========================

        let message =
            "Hello! I would like to place an order from Crochet by Zumar.\n\n";

        message +=
            "CUSTOMER DETAILS\n";

        message +=
            "Name: " + customerName + "\n";

        message +=
            "Phone: " + customerPhone + "\n";

        message +=
            "Address: " + customerAddress + "\n\n";

        message +=
            "ORDER DETAILS\n";

        let total = 0;

        cart.forEach(product => {

            const quantity =
                product.quantity || 1;

            const subtotal =
                product.price * quantity;

            message +=
                product.name;

            // ADD OPTION / COLOUR
            if (product.option) {

                message +=
                    " (" +
                    product.option +
                    ")";

            }

            message +=
                " x " +
                quantity +
                " - Rs. " +
                subtotal +
                "\n";

            total += subtotal;

        });

        message +=
            "\nTotal: Rs. " + total;

        // ===========================
        // OPEN WHATSAPP
        // ===========================

        const whatsappURL =
            "https://wa.me/923244691920?text=" +
            encodeURIComponent(message);

        window.open(
            whatsappURL,
            "_blank"
        );

    }

});

// ===========================
// PRODUCT SEARCH
// ===========================

const productSearch =
    document.getElementById("product-search");

if (productSearch) {

    const productCards =
        document.querySelectorAll(".product-card");

    // Filter products while typing
    productSearch.addEventListener("input", function () {

        const searchText =
            this.value.toLowerCase().trim();

        productCards.forEach(card => {

            const productText =
                card.textContent.toLowerCase();

            if (
                searchText === "" ||
                productText.includes(searchText)
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });


    // Scroll ONLY when Enter is pressed
    productSearch.addEventListener("keydown", function (event) {

        if (event.key !== "Enter") return;

        const searchText =
            this.value.toLowerCase().trim();

        if (!searchText) return;

        const firstMatch =
            [...productCards].find(card => {

                const productText =
                    card.textContent.toLowerCase();

                return productText.includes(searchText);

            });

        if (firstMatch) {

            firstMatch.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });

}


// ===========================
// INITIALIZE
// ===========================

updateCartCount();

if (cartItems) {
    renderCart();
}
// ===========================
// BOW & HEART TOTE SLIDER
// ===========================

const toteSlider = document.querySelector(".tote-slider");

if (toteSlider) {

    const slides =
        toteSlider.querySelectorAll(".tote-slide");

    const prevButton =
        toteSlider.querySelector(".tote-prev");

    const nextButton =
        toteSlider.querySelector(".tote-next");

    const dots =
        toteSlider.querySelectorAll(".tote-dot");

    let currentSlide = 0;

    function showToteSlide(index) {

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        dots.forEach(dot => {
            dot.classList.remove("active");
        });

        slides[index].classList.add("active");
        dots[index].classList.add("active");

        currentSlide = index;
    }

    nextButton.addEventListener("click", function () {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        showToteSlide(currentSlide);

    });

    prevButton.addEventListener("click", function () {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        showToteSlide(currentSlide);

    });

    dots.forEach((dot, index) => {

        dot.addEventListener("click", function () {

            showToteSlide(index);

        });

    });

}
// ===========================
// CARDIGAN IMAGE SLIDER
// ===========================

const cardiganSlider =
    document.querySelector(".cardigan-slider");

if (cardiganSlider) {

    const slides =
        cardiganSlider.querySelectorAll(".cardigan-slide");

    const prevButton =
        cardiganSlider.querySelector(".cardigan-prev");

    const nextButton =
        cardiganSlider.querySelector(".cardigan-next");

    const dots =
        cardiganSlider.querySelectorAll(".cardigan-dot");

    let currentSlide = 0;

    function showCardiganSlide(index) {

        slides.forEach(function(slide) {
            slide.classList.remove("active");
        });

        dots.forEach(function(dot) {
            dot.classList.remove("active");
        });

        slides[index].classList.add("active");
        dots[index].classList.add("active");

        currentSlide = index;
    }

    nextButton.addEventListener("click", function() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        showCardiganSlide(currentSlide);

    });

    prevButton.addEventListener("click", function() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        showCardiganSlide(currentSlide);

    });

    dots.forEach(function(dot, index) {

        dot.addEventListener("click", function() {
            showCardiganSlide(index);
        });

    });

}
// ===========================
// CHICK KEYCHAIN SLIDER
// ===========================

const chickSlider =
    document.querySelector(".chick-slider");

if (chickSlider) {

    const slides =
        chickSlider.querySelectorAll(".chick-slide");

    const prevButton =
        chickSlider.querySelector(".chick-prev");

    const nextButton =
        chickSlider.querySelector(".chick-next");

    const dots =
        chickSlider.querySelectorAll(".chick-dot");

    let currentChickSlide = 0;

    function showChickSlide(index) {

        slides.forEach(function(slide) {
            slide.classList.remove("active");
        });

        dots.forEach(function(dot) {
            dot.classList.remove("active");
        });

        slides[index].classList.add("active");
        dots[index].classList.add("active");

        currentChickSlide = index;
    }

    nextButton.addEventListener("click", function() {

        currentChickSlide++;

        if (currentChickSlide >= slides.length) {
            currentChickSlide = 0;
        }

        showChickSlide(currentChickSlide);

    });

    prevButton.addEventListener("click", function() {

        currentChickSlide--;

        if (currentChickSlide < 0) {
            currentChickSlide = slides.length - 1;
        }

        showChickSlide(currentChickSlide);

    });

    dots.forEach(function(dot, index) {

        dot.addEventListener("click", function() {
            showChickSlide(index);
        });

    });

}
// ===========================
// MIKASA SCARF SLIDER
// ===========================

const mikasaSlider =
    document.querySelector(".mikasa-slider");

if (mikasaSlider) {

    const slides =
        mikasaSlider.querySelectorAll(".mikasa-slide");

    const prevButton =
        mikasaSlider.querySelector(".mikasa-prev");

    const nextButton =
        mikasaSlider.querySelector(".mikasa-next");

    const dots =
        mikasaSlider.querySelectorAll(".mikasa-dot");

    let currentSlide = 0;

    function showMikasaSlide(index) {

        slides.forEach(function(slide) {
            slide.classList.remove("active");
        });

        dots.forEach(function(dot) {
            dot.classList.remove("active");
        });

        slides[index].classList.add("active");
        dots[index].classList.add("active");

        currentSlide = index;
    }

    nextButton.addEventListener("click", function() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        showMikasaSlide(currentSlide);

    });

    prevButton.addEventListener("click", function() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        showMikasaSlide(currentSlide);

    });

    dots.forEach(function(dot, index) {

        dot.addEventListener("click", function() {

            showMikasaSlide(index);

        });

    });

}