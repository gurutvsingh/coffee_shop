# Coffee Shop Web App

A modern coffee ordering and table-booking web application with a responsive frontend and a Node.js + Express backend.

This project includes:
- A rich landing page with menu, testimonials, booking, and contact sections
- A dedicated cart experience with product customization (sugar and milk choices)
- Live order and booking API integration
- In-memory backend storage for fast prototyping

## Live Project Structure

```
coffee 2/
|-- index.html
|-- cart.html
|-- style.css
|-- script.js
|-- cart.js
|-- server.js
|-- package.json
|-- src/
|   |-- app.js
|   |-- config/
|   |   |-- index.js
|   |-- controllers/
|   |   |-- orderController.js
|   |   |-- bookingController.js
|   |-- middlewares/
|   |   |-- errorHandler.js
|   |-- models/
|   |   |-- store.js
|   |-- routes/
|   |   |-- orderRoutes.js
|   |   |-- bookingRoutes.js
|   |-- services/
|       |-- orderService.js
|       |-- bookingService.js
|-- .gitignore
|-- README.md
```

## Features

### Frontend
- Hero section, sticky navbar, smooth scrolling, and loading animation
- Coffee menu with images, pricing in INR, and add-to-cart actions
- Smart cart UI with:
- Quantity controls
- Remove item
- Dynamic subtotal, delivery fee, taxes, and final total
- Coupon support (`BREW10`)
- Delivery and pickup toggles
- Checkout modal with validation
- Product customization modal (sugar and milk chips)
- Table booking form connected to backend
- Testimonials and contact section with map embed
- localStorage persistence for cart and user details

### Backend
- Express server with CORS and JSON middleware
- `POST /order` to place coffee orders
- `POST /booking` to create table bookings
- `GET /orders` to fetch all orders
- `GET /bookings` to fetch all bookings
- Basic validation and centralized error handling
- Modular architecture ready for MongoDB integration

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Utilities: CORS, localStorage, Fetch API

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gurutvsingh/coffee_shop.git
cd coffee_shop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run backend server

```bash
npm start
```

Backend runs at:
`http://localhost:3000`

### 4. Run frontend

Open these files in browser:
- `index.html`
- `cart.html`

You can also run with a static server if you prefer.

## API Reference

### Health Check

`GET /`

Response:

```json
{
	"message": "Coffee shop backend is live"
}
```

### Place Order

`POST /order`

Request body:

```json
{
	"name": "Rahul",
	"phone": "9876543210",
	"address": "MG Road, Bengaluru",
	"orderType": "delivery",
	"items": [
		{ "name": "Latte (Regular, Oat Milk)", "quantity": 2, "price": 249 }
	],
	"total": 498
}
```

### Create Booking

`POST /booking`

Request body:

```json
{
	"name": "Rahul",
	"people": 4,
	"date": "2026-04-07",
	"time": "19:30"
}
```

### List Orders

`GET /orders`

### List Bookings

`GET /bookings`

## Future Improvements

- Replace in-memory arrays with MongoDB (Mongoose)
- Add authentication for admin/order history
- Add payment gateway integration
- Add order status tracking and notifications
- Dockerize for easy deployment

## Author

GitHub: [@gurutvsingh](https://github.com/gurutvsingh)
