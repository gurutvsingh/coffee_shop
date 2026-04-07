document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    const CART_STORAGE_KEY = 'coffeeCart';
    const loader = document.getElementById('loader');
    const navbar = document.getElementById('navbar');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const bookingForm = document.getElementById('bookingForm');
    const bookingMessage = document.getElementById('bookingMessage');

    const menuItems = {
        espresso: { name: 'Espresso', price: 149 },
        cappuccino: { name: 'Cappuccino', price: 199 },
        latte: { name: 'Latte', price: 249 },
        coldbrew: { name: 'Cold Brew', price: 229 },
        mocha: { name: 'Mocha', price: 269 },
        flatwhite: { name: 'Flat White', price: 239 },
        americano: { name: 'Americano', price: 179 },
        macchiato: { name: 'Macchiato', price: 219 },
        icedlatte: { name: 'Iced Latte', price: 259 },
        caramellatte: { name: 'Caramel Latte', price: 279 }
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

    const syncCartStorage = () => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    };

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            cart[id] = (cart[id] || 0) + 1;
            syncCartStorage();
        });
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

    syncCartStorage();
});
