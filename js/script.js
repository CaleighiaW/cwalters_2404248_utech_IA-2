// Check if users exist in localStorage, if not initialize an empty object
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify({}));
}

// -------------------- REGISTRATION --------------------
const registerForm = document.getElementById("register-form");

// If the register form exists on the page
if (registerForm) {
    registerForm.addEventListener("submit", function(e){
        e.preventDefault(); // Prevent page from refreshing on submit

        // Get values entered by the user
        const username = document.getElementById("username-register").value;
        const name = document.getElementById("name").value;
        const dob = document.getElementById("dob").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password-register").value;

        // Retrieve users object from localStorage
        const users = JSON.parse(localStorage.getItem("users"));

        // Check if username already exists
        if(users[username]){
            alert("Username already exists! Choose another.");
            return; // Stop registration if username exists
        }

        // Add new user to users object
        users[username] = {
            name,       // Full name
            dob,        // Date of Birth
            email,      // Email
            password,   // Password
            cart: [],   // Initialize empty cart for future shopping
            invoice: "" // Placeholder for invoices
        };

        // Save updated users object back to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful! Redirecting to login.");

        // Redirect to login page
        window.location.href = "index.html";
    });
}

// -------------------- LOGIN --------------------
const loginForm = document.getElementById("login-form");

// If the login form exists on the page
if (loginForm) {
    let loginAttempts = 0; // Counter for failed login attempts

    loginForm.addEventListener("submit", function(e){
        e.preventDefault(); // Prevent page from refreshing

        // Get entered username and password
        const username = document.getElementById("username").value;
        const password = document.getElementById("password-login").value;

        // Retrieve users object from localStorage
        const users = JSON.parse(localStorage.getItem("users"));

        // Check if user exists and password matches
        if(users[username] && users[username].password === password){
            // Successful login
            alert(`Welcome, ${users[username].name}!`);
            
            // Redirect to products page with username as a query parameter
            window.location.href = `products.html?username=${username}`;
        } else {
            // Failed login attempt
            loginAttempts++;
            alert("Invalid username or password.");

            // After 3 failed attempts, redirect to register page
            if(loginAttempts >= 3){
                alert("Too many failed attempts. Redirecting to error page.");
                window.location.href = "register.html";
            }
        }
    });
}

// -------------------- OPTIONAL FUNCTION: Generate Invoice --------------------
// Function to create invoice for a user based on cart items
function generateInvoice(username) {
    const users = JSON.parse(localStorage.getItem("users"));
    const user = users[username];

    if (user) {
        // Start invoice text
        user.invoice = `Invoice for ${username}:\nProducts:\n`;

        // Loop through each product in the cart and add to invoice
        user.cart.forEach((product, index) => {
            user.invoice += `${index + 1}. ${product.name} - $${product.price}\n`;
        });

        // Save updated user data back to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Display invoice in an alert (can be replaced with better UI later)
        alert(user.invoice);
    }
}
// ---------------------- CART FUNCTIONALITY ----------------------

// Load cart from localStorage if it exists
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ---------------------- PRODUCT PAGE / CHECKOUT FUNCTIONS ----------------------

// Add a product to cart
function addToCart(id, name, price) {
    // Check if product already exists
    const existingProduct = cart.find(item => item.id === id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart(); // Update cart display
    alert(`${name} added to cart!`);
}

// Remove an item from the cart
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Update quantity of a cart item
function updateQuantity(index, quantity) {
  const newQty = parseInt(quantity);
  if (newQty < 1 || isNaN(newQty)) {
    alert("Quantity must be at least 1");
    return;
  }

  cart[index].quantity = newQty;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

// Cancel order / clear cart
function cancelOrder() {
    if (confirm('Are you sure you want to cancel your order?')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
    }
}

//continue shopping
function continueShopping(){
    window.location.href = "products.html"
}

//Clear all
function clearCart(){
    if (confirm('Are you sure you want to clear your order?')) {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
    }
}

//Close
function closeCheckout(){
    if (confirm('Are you sure you want to exit page?')) {
        window.location.href = "homepage.html"
    }
}

// Exit page (go back to home)
function exitPage() {
    window.location.href = 'homepage.html';
}

// Go to checkout page
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

// ---------------------- CART DISPLAY ----------------------

// ---------------------- UPDATE CART DISPLAY ----------------------
function updateCart() {
  const cartItemsBody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

  if (!cartItemsBody) return; // Prevent errors on non-cart pages

  cartItemsBody.innerHTML = ""; // Clear table rows

  if (cart.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="5">Your cart is empty.</td>`;
    cartItemsBody.appendChild(emptyRow);
    subtotalEl.textContent = "Subtotal: $0.00";
    discountEl.textContent = "Discount: $0.00";
    taxEl.textContent = "Tax (5%): $0.00";
    totalEl.textContent = "Total: $0.00";
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" 
          onchange="updateQuantity(${index}, this.value)">
      </td>
      <td>$${itemSubtotal.toFixed(2)}</td>
      <td><button onclick="removeItem(${index})">Remove</button></td>
    `;
    cartItemsBody.appendChild(row);
  });

  // ✅ Calculate discount, tax, total
  const discount = subtotal > 20000 ? subtotal * 0.10 : 0;
  const tax = (subtotal - discount) * 0.05;
  const total = subtotal - discount + tax;

  // ✅ Update the summary values
  subtotalEl.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
  discountEl.textContent = `Discount: $${discount.toFixed(2)}`;
  taxEl.textContent = `Tax (5%): $${tax.toFixed(2)}`;
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

// ---------------------- INITIALIZE CART ----------------------
document.addEventListener("DOMContentLoaded", updateCart);

