console.log("Website Loaded");
// Load existing cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

updateCartCount();

// Add product
const buttons = document.querySelectorAll(".add-to-cart");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const product = {
            name: button.dataset.name,
            price: Number(button.dataset.price)
        };

        cart.push(product);

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();

        alert(product.name + " added to cart!");
    });

});
// ===========================
// SHOW PRODUCTS ON CART PAGE
// ===========================

const cartItems = document.getElementById("cart-items");

if (cartItems) {

    if (cart.length === 0) {

        cartItems.innerHTML = "<h2>Your cart is empty.</h2>";

    } else {

        let total = 0;
        let html = "";

        cart.forEach((product, index) => {

            total += product.price;

            html += `
                <div class="cart-item">

                    <h3>${product.name}</h3>

                    <p>Price: Rs. ${product.price}</p>

                    <button class="btn remove-btn" data-index="${index}">
                        Remove
                    </button>

                </div>
            `;

        });

        html += `
            <h2>Total: Rs. ${total}</h2>

            <a href="#" class="btn" id="checkout-btn">
                Checkout on WhatsApp
            </a>
        `;

        cartItems.innerHTML = html;

    }

}
// ===========================
// REMOVE ITEM
// ===========================

document.addEventListener("click", function(e){

    if(e.target.classList.contains("remove-btn")){

        const index = e.target.dataset.index;

        cart.splice(index,1);

        localStorage.setItem("cart", JSON.stringify(cart));

        location.reload();

    }

});
