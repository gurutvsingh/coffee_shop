document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    const CART_STORAGE_KEY = 'coffeeCart';
    const loader = document.getElementById('loader');
    const navbar = document.getElementById('navbar');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const orderMessage = document.getElementById('orderMessage');
    const bookingForm = document.getElementById('bookingForm');
    const bookingMessage = document.getElementById('bookingMessage');
    const pickupFields = document.getElementById('pickupFields');
    const deliveryFields = document.getElementById('deliveryFields');
    const pickupSlot = document.getElementById('pickupSlot');
    const deliveryAddress = document.getElementById('deliveryAddress');
    const orderName = document.getElementById('orderName');
    const phoneNumber = document.getElementById('phoneNumber');

    const menuItems = {
        espresso: { name: 'Espresso', price: 149 },
        cappuccino: { name: 'Cappuccino', price: 199 },
        latte: { name: 'Latte', price: 249 },
        coldbrew: { name: 'Cold Brew', price: 229 },
        mocha: { name: 'Mocha', price: 269 },
        flatwhite: { name: 'Flat White', price: 239 }
    };

    const loadCart = () => {
        try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_error) {
            return {};
        }
    };

    const cart = loadCart();

    const inr = (value) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1200);

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    document.querySelectorAll('.nav-links a, .cta-btn').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) {
                return;
            }
            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const updateCart = () => {
        const entries = Object.entries(cart).filter(([, qty]) => qty > 0);

        if (entries.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Add coffee from the menu.</p>';
            cartTotal.textContent = inr(0);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = entries.map(([id, qty]) => {
            const item = menuItems[id];
            const linePrice = item.price * qty;
            total += linePrice;

            return `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong>
                        <div class="qty-controls" data-id="${id}">
                            <button class="qty-btn" data-action="decrease">-</button>
                            <span>${qty}</span>
                            <button class="qty-btn" data-action="increase">+</button>
                        </div>
                    </div>
                    <strong>${inr(linePrice)}</strong>
                </div>
            `;
        }).join('');

        cartTotal.textContent = inr(total);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    };

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            cart[id] = (cart[id] || 0) + 1;
            updateCart();
        });
    });

    cartItemsContainer.addEventListener('click', (event) => {
        const clicked = event.target;
        if (!(clicked instanceof HTMLElement) || !clicked.classList.contains('qty-btn')) {
            return;
        }

        const controls = clicked.closest('.qty-controls');
        if (!controls) {
            return;
        }

        const id = controls.dataset.id;
        if (!id) {
            return;
        }

        const action = clicked.dataset.action;
        if (action === 'increase') {
            cart[id] += 1;
        }

        if (action === 'decrease') {
            cart[id] -= 1;
            if (cart[id] <= 0) {
                delete cart[id];
            }
        }

        updateCart();
    });

    document.querySelectorAll('input[name="fulfillment"]').forEach((option) => {
        option.addEventListener('change', (event) => {
            const value = event.target.value;
            const pickupSelected = value === 'pickup';

            pickupFields.classList.toggle('hidden', !pickupSelected);
            deliveryFields.classList.toggle('hidden', pickupSelected);
            orderMessage.textContent = '';
            orderMessage.className = 'feedback';
        });
    });

    placeOrderBtn.addEventListener('click', async () => {
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        const fulfillment = document.querySelector('input[name="fulfillment"]:checked').value;
        const name = orderName.value.trim();
        const phone = phoneNumber.value.trim();

        if (!name || !/^\d{10}$/.test(phone)) {
            orderMessage.textContent = 'Enter a valid name and 10-digit phone number.';
            orderMessage.className = 'feedback error';
            return;
        }

        if (totalItems === 0) {
            orderMessage.textContent = 'Please add at least one item to cart before checkout.';
            orderMessage.className = 'feedback error';
            return;
        }

        if (fulfillment === 'delivery') {
            if (!deliveryAddress.value.trim()) {
                orderMessage.textContent = 'Enter a valid delivery address.';
                orderMessage.className = 'feedback error';
                return;
            }
        }

        if (fulfillment === 'pickup') {
            if (!pickupSlot.value) {
                orderMessage.textContent = 'Please select a pickup time slot.';
                orderMessage.className = 'feedback error';
                return;
            }
        }

        const itemsPayload = Object.entries(cart)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({
                name: menuItems[id].name,
                quantity: qty,
                price: menuItems[id].price
            }));

        const total = itemsPayload.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Placing Order...';

            const response = await fetch(`${API_BASE_URL}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    address: fulfillment === 'delivery' ? deliveryAddress.value.trim() : '',
                    orderType: fulfillment,
                    items: itemsPayload,
                    total
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Order failed');
            }

            orderMessage.textContent = `Order placed successfully for ${totalItems} item(s).`;
            orderMessage.className = 'feedback success';

            Object.keys(cart).forEach((id) => {
                delete cart[id];
            });

            pickupSlot.value = '';
            deliveryAddress.value = '';
            orderName.value = '';
            phoneNumber.value = '';
            updateCart();
        } catch (error) {
            orderMessage.textContent = error.message || 'Unable to place order right now.';
            orderMessage.className = 'feedback error';
        } finally {
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    });

    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const bookName = document.getElementById('bookName').value.trim();
        const bookPeople = document.getElementById('bookPeople').value.trim();
        const bookDateTime = document.getElementById('bookDateTime').value;

        if (!bookName || !bookPeople || !bookDateTime) {
            bookingMessage.textContent = 'Please fill all booking details.';
            bookingMessage.className = 'feedback error';
            return;
        }

        const readableTime = new Date(bookDateTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const [datePart, timePart] = bookDateTime.split('T');

        try {
            const submitBtn = bookingForm.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Booking...';

            const response = await fetch(`${API_BASE_URL}/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: bookName,
                    people: Number(bookPeople),
                    date: datePart,
                    time: timePart
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Booking failed');
            }

            bookingMessage.textContent = `Thanks ${bookName}, your table for ${bookPeople} is booked for ${readableTime}.`;
            bookingMessage.className = 'feedback success';
            bookingForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        } catch (error) {
            bookingMessage.textContent = error.message || 'Unable to book right now.';
            bookingMessage.className = 'feedback error';
            const submitBtn = bookingForm.querySelector('.submit-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    });

    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => observer.observe(el));

    updateCart();
});
