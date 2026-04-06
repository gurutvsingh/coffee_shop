# API Examples

Base URL:
http://localhost:3000

## Health

Request:
GET /

Response:
{
  "message": "Coffee shop backend is live"
}

## Place Order

Request:
POST /order
Content-Type: application/json

Body:
{
  "name": "Aarav",
  "phone": "9876543210",
  "address": "12 Main Street, Bengaluru",
  "orderType": "delivery",
  "items": [
    { "name": "Latte (Regular, Oat Milk)", "quantity": 1, "price": 249 },
    { "name": "Espresso (No Sugar, No Milk)", "quantity": 2, "price": 149 }
  ],
  "total": 547
}

## Create Booking

Request:
POST /booking
Content-Type: application/json

Body:
{
  "name": "Aarav",
  "people": 3,
  "date": "2026-04-08",
  "time": "19:00"
}

## List Orders

Request:
GET /orders

## List Bookings

Request:
GET /bookings
