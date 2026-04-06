const PRODUCT_CATALOG = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 149,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 199,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 249,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'coldbrew',
    name: 'Cold Brew',
    price: 229,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: 269,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'flatwhite',
    name: 'Flat White',
    price: 239,
    image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=900&auto=format&fit=crop'
  }
];

const STORAGE_KEYS = {
  cart: 'coffeeCart',
  orderPrefs: 'coffeeOrderPrefs',
  user: 'coffeeUserDetails'
};

const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_CUSTOMIZATION = {
  sugar: 'Regular',
  milk: 'Regular'
};

const state = {
  cart: loadFromStorage(STORAGE_KEYS.cart, {}),
  orderType: loadFromStorage(STORAGE_KEYS.orderPrefs, { orderType: 'delivery', coupon: '' }).orderType || 'delivery',
  coupon: loadFromStorage(STORAGE_KEYS.orderPrefs, { orderType: 'delivery', coupon: '' }).coupon || '',
  discountRate: 0,
  customize: {
    productId: '',
    sugar: DEFAULT_CUSTOMIZATION.sugar,
    milk: DEFAULT_CUSTOMIZATION.milk
  }
};

const dom = {
  productGrid: document.getElementById('productGrid'),
  cartItemsContainer: document.getElementById('cartItemsContainer'),
  emptyCartState: document.getElementById('emptyCartState'),
  cartCountBadge: document.getElementById('cartCountBadge'),
  subtotalPrice: document.getElementById('subtotalPrice'),
  deliveryFee: document.getElementById('deliveryFee'),
  taxPrice: document.getElementById('taxPrice'),
  finalTotal: document.getElementById('finalTotal'),
  checkoutTotal: document.getElementById('checkoutTotal'),
  etaText: document.getElementById('etaText'),
  couponInput: document.getElementById('couponInput'),
  couponMessage: document.getElementById('couponMessage'),
  applyCouponBtn: document.getElementById('applyCouponBtn'),
  proceedCheckoutBtn: document.getElementById('proceedCheckoutBtn'),
  browseCoffeeBtn: document.getElementById('browseCoffeeBtn'),
  orderTypeButtons: document.querySelectorAll('.order-type-btn'),
  checkoutModal: document.getElementById('checkoutModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  customizeModal: document.getElementById('customizeModal'),
  customizeTitle: document.getElementById('customizeTitle'),
  customizePrice: document.getElementById('customizePrice'),
  customizeTopImage: document.getElementById('customizeTopImage'),
  closeCustomizeBtn: document.getElementById('closeCustomizeBtn'),
  addCustomToCartBtn: document.getElementById('addCustomToCartBtn'),
  customChips: document.querySelectorAll('.choice-chip'),
  checkoutForm: document.getElementById('checkoutForm'),
  customerName: document.getElementById('customerName'),
  customerPhone: document.getElementById('customerPhone'),
  customerAddress: document.getElementById('customerAddress'),
  addressFieldWrap: document.getElementById('addressFieldWrap'),
  checkoutOrderTypeInputs: document.querySelectorAll('input[name="checkoutOrderType"]'),
  toast: document.getElementById('toast')
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function inr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getCartEntries() {
  return Object.entries(state.cart).filter(([, qty]) => Number.isInteger(qty) && qty > 0);
}

function createCartKey(productId, sugar, milk) {
  return `${productId}__${sugar}__${milk}`;
}

function parseCartKey(cartKey) {
  const parts = cartKey.split('__');
  return {
    productId: parts[0],
    sugar: parts[1] || DEFAULT_CUSTOMIZATION.sugar,
    milk: parts[2] || DEFAULT_CUSTOMIZATION.milk
  };
}

function getProduct(id) {
  return PRODUCT_CATALOG.find((item) => item.id === id);
}

function calculateTotals() {
  const subtotal = getCartEntries().reduce((sum, [cartKey, qty]) => {
    const parsed = parseCartKey(cartKey);
    const item = getProduct(parsed.productId);
    return item ? sum + item.price * qty : sum;
  }, 0);

  const deliveryFee = state.orderType === 'delivery' && subtotal > 0 ? 40 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const discountAmount = Math.round(subtotal * state.discountRate);
  const finalTotal = Math.max(subtotal + deliveryFee + taxes - discountAmount, 0);

  return { subtotal, deliveryFee, taxes, discountAmount, finalTotal };
}

function renderCatalog() {
  dom.productGrid.innerHTML = PRODUCT_CATALOG.map((item) => `
    <article class="product-card" data-product-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="product-info">
        <h3>${item.name}</h3>
        <p>${inr(item.price)}</p>
      </div>
      <button class="add-btn" type="button">Add to Cart</button>
    </article>
  `).join('');
}

function renderCartItems() {
  const entries = getCartEntries();

  if (entries.length === 0) {
    dom.cartItemsContainer.innerHTML = '';
    dom.emptyCartState.classList.remove('hidden');
  } else {
    dom.emptyCartState.classList.add('hidden');
    dom.cartItemsContainer.innerHTML = entries.map(([cartKey, qty]) => {
      const parsed = parseCartKey(cartKey);
      const product = getProduct(parsed.productId);
      if (!product) {
        return '';
      }

      return `
        <article class="cart-item" data-cart-id="${cartKey}">
          <img src="${product.image}" alt="${product.name}">
          <div class="cart-item-meta">
            <h4>${product.name}</h4>
            <p>${inr(product.price)}</p>
            <div class="cart-customization">${parsed.sugar} | ${parsed.milk}</div>
            <div class="qty-wrap">
              <button class="qty-control" type="button" data-action="decrease">-</button>
              <span>${qty}</span>
              <button class="qty-control" type="button" data-action="increase">+</button>
            </div>
          </div>
          <button class="remove-btn" type="button" aria-label="Remove item">Remove</button>
        </article>
      `;
    }).join('');
  }

  const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const totals = calculateTotals();

  dom.cartCountBadge.textContent = String(totalItems);
  dom.subtotalPrice.textContent = inr(totals.subtotal);
  dom.deliveryFee.textContent = inr(totals.deliveryFee);
  dom.taxPrice.textContent = inr(totals.taxes);
  dom.finalTotal.textContent = inr(totals.finalTotal);
  dom.checkoutTotal.textContent = inr(totals.finalTotal);
  dom.etaText.textContent = state.orderType === 'delivery'
    ? 'Estimated delivery: 25-35 min'
    : 'Estimated pickup: 10-15 min';

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  saveToStorage(STORAGE_KEYS.orderPrefs, {
    orderType: state.orderType,
    coupon: state.coupon
  });
}

function renderCustomizeModal() {
  const product = getProduct(state.customize.productId);
  if (!product) {
    return;
  }

  dom.customizeTitle.textContent = product.name;
  dom.customizePrice.textContent = inr(product.price);
  dom.customizeTopImage.style.backgroundImage = `url('${product.image}')`;

  dom.customChips.forEach((chip) => {
    const group = chip.dataset.group;
    const value = chip.dataset.value;
    const selected = group === 'sugar'
      ? state.customize.sugar === value
      : state.customize.milk === value;
    chip.classList.toggle('active', selected);
  });
}

function openCustomizeModal(productId) {
  state.customize.productId = productId;
  state.customize.sugar = DEFAULT_CUSTOMIZATION.sugar;
  state.customize.milk = DEFAULT_CUSTOMIZATION.milk;
  renderCustomizeModal();
  dom.customizeModal.classList.remove('hidden');
}

function closeCustomizeModal() {
  dom.customizeModal.classList.add('hidden');
}

function addCustomizedItemToCart() {
  const { productId, sugar, milk } = state.customize;
  if (!productId) {
    return;
  }

  const cartKey = createCartKey(productId, sugar, milk);
  state.cart[cartKey] = (state.cart[cartKey] || 0) + 1;
  renderCartItems();
  closeCustomizeModal();

  const product = getProduct(productId);
  showToast(`${product ? product.name : 'Item'} added to cart`);
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 1700);
}

function setOrderType(orderType) {
  state.orderType = orderType;
  dom.orderTypeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.orderType === orderType);
  });

  dom.checkoutOrderTypeInputs.forEach((input) => {
    input.checked = input.value === orderType;
  });

  dom.addressFieldWrap.classList.toggle('hidden', orderType === 'pickup');
  renderCartItems();
}

function applyCoupon() {
  const code = dom.couponInput.value.trim().toUpperCase();

  if (!code) {
    state.discountRate = 0;
    state.coupon = '';
    dom.couponMessage.textContent = 'Enter a coupon code.';
    renderCartItems();
    return;
  }

  if (code === 'BREW10') {
    state.discountRate = 0.1;
    state.coupon = code;
    dom.couponMessage.textContent = 'Coupon applied: 10% off subtotal.';
    showToast('Coupon applied');
  } else {
    state.discountRate = 0;
    state.coupon = '';
    dom.couponMessage.textContent = 'Invalid coupon code.';
  }

  renderCartItems();
}

function openCheckoutModal() {
  if (getCartEntries().length === 0) {
    showToast('Add items before checkout');
    return;
  }

  const user = loadFromStorage(STORAGE_KEYS.user, { name: '', phone: '', address: '' });
  dom.customerName.value = user.name || '';
  dom.customerPhone.value = user.phone || '';
  dom.customerAddress.value = user.address || '';
  setOrderType(state.orderType);
  dom.checkoutModal.classList.remove('hidden');
}

function closeCheckoutModal() {
  dom.checkoutModal.classList.add('hidden');
}

async function placeOrder(event) {
  event.preventDefault();

  const name = dom.customerName.value.trim();
  const phone = dom.customerPhone.value.trim();
  const address = dom.customerAddress.value.trim();
  const orderType = [...dom.checkoutOrderTypeInputs].find((input) => input.checked)?.value || 'delivery';

  if (!name || !/^\d{10}$/.test(phone)) {
    showToast('Enter valid name and 10-digit phone');
    return;
  }

  if (orderType === 'delivery' && !address) {
    showToast('Address is required for delivery');
    return;
  }

  const items = getCartEntries().map(([id, quantity]) => {
    const parsed = parseCartKey(id);
    const product = getProduct(parsed.productId);
    return {
      name: `${product.name} (${parsed.sugar}, ${parsed.milk})`,
      quantity,
      price: product.price
    };
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  saveToStorage(STORAGE_KEYS.user, { name, phone, address });

  const submitButton = dom.checkoutForm.querySelector('.checkout-submit');

  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Placing Order...';

    const response = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        phone,
        address: orderType === 'delivery' ? address : '',
        orderType,
        items,
        total: subtotal
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Order request failed.');
    }

    showToast('Order placed successfully');
    state.cart = {};
    state.discountRate = 0;
    state.coupon = '';
    dom.couponInput.value = '';
    dom.couponMessage.textContent = '';
    closeCheckoutModal();
    renderCartItems();
  } catch (error) {
    showToast(error.message || 'Unable to place order right now');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Place Order';
  }
}

function onCatalogClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains('add-btn')) {
    return;
  }

  const card = target.closest('[data-product-id]');
  if (!card) {
    return;
  }

  const productId = card.getAttribute('data-product-id');
  if (!productId) {
    return;
  }

  openCustomizeModal(productId);
}

function onCartClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const cartItem = target.closest('[data-cart-id]');
  if (!cartItem) {
    return;
  }

  const cartId = cartItem.getAttribute('data-cart-id');
  if (!cartId) {
    return;
  }

  if (target.classList.contains('remove-btn')) {
    delete state.cart[cartId];
    cartItem.classList.add('removed');
    setTimeout(() => renderCartItems(), 180);
    showToast('Item removed');
    return;
  }

  if (target.classList.contains('qty-control')) {
    const action = target.dataset.action;
    const currentQty = state.cart[cartId] || 0;

    if (action === 'increase') {
      state.cart[cartId] = currentQty + 1;
    }

    if (action === 'decrease') {
      const nextQty = currentQty - 1;
      if (nextQty <= 0) {
        delete state.cart[cartId];
      } else {
        state.cart[cartId] = nextQty;
      }
    }

    renderCartItems();
  }
}

function registerEvents() {
  dom.productGrid.addEventListener('click', onCatalogClick);
  dom.cartItemsContainer.addEventListener('click', onCartClick);
  dom.applyCouponBtn.addEventListener('click', applyCoupon);
  dom.proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
  dom.closeModalBtn.addEventListener('click', closeCheckoutModal);
  dom.closeCustomizeBtn.addEventListener('click', closeCustomizeModal);
  dom.addCustomToCartBtn.addEventListener('click', addCustomizedItemToCart);
  dom.checkoutForm.addEventListener('submit', placeOrder);
  dom.browseCoffeeBtn.addEventListener('click', () => {
    document.querySelector('.menu-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  dom.orderTypeButtons.forEach((button) => {
    button.addEventListener('click', () => setOrderType(button.dataset.orderType || 'delivery'));
  });

  dom.checkoutOrderTypeInputs.forEach((input) => {
    input.addEventListener('change', () => setOrderType(input.value));
  });

  dom.checkoutModal.addEventListener('click', (event) => {
    if (event.target === dom.checkoutModal) {
      closeCheckoutModal();
    }
  });

  dom.customizeModal.addEventListener('click', (event) => {
    if (event.target === dom.customizeModal) {
      closeCustomizeModal();
    }
  });

  dom.customChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      const value = chip.dataset.value;
      if (group === 'sugar') {
        state.customize.sugar = value || DEFAULT_CUSTOMIZATION.sugar;
      }
      if (group === 'milk') {
        state.customize.milk = value || DEFAULT_CUSTOMIZATION.milk;
      }
      renderCustomizeModal();
    });
  });
}

function init() {
  renderCatalog();
  registerEvents();
  dom.couponInput.value = state.coupon;

  if (state.coupon === 'BREW10') {
    state.discountRate = 0.1;
    dom.couponMessage.textContent = 'Coupon applied: 10% off subtotal.';
  }

  setOrderType(state.orderType);
  renderCartItems();
}

init();
