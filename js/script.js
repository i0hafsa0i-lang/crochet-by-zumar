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
