# Slot Booking System

A slot booking system designed for managing indoor and outdoor game slots. Users can log in with their Google accounts, view available slots, and book or toggle the availability of slots through a user-friendly interface.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Data Structure](#data-structure)
4. [Frontend Overview](#frontend-overview)
5. [Backend Integration](#backend-integration)
6. [Setup Instructions](#setup-instructions)
7. [API Endpoints](#api-endpoints)
8. [Contributing](#contributing)

---

## Overview

The Slot Booking System is a web-based application that allows users to book time slots for indoor and outdoor games. The system integrates with Google Sign-In for authentication and provides a seamless experience for managing bookings. The backend is powered by Google Apps Script, which interacts with a Google Sheet to store and retrieve data.

Key Features:

- Resets slots automatically between 12 AM and 1 AM for a new day.
- Stores data for the last 7 days only (older data is deleted).
- Users must have an `@northsouth.edu` email to access the system.
- Admins are manually added to the Google Sheet by the owner.
- Admins can cancel any slot, and the user who booked it will receive an email notification.
- Every booking triggers an email confirmation to the user.
- Users can book one slot per day, while admins can book slots for specific time periods.
- Admins can mark slots as "No Available" or "Available."
- Admins can turn off slot booking for a specific day.

---

## Features

### User Features

- **Authentication**: Users must log in using their `@northsouth.edu` email via Google Authentication.
- **Slot Booking**: Users can book one slot per day for either today or the next day.
- **Email Notifications**: Users receive an email confirmation for every booking.
- **Limited Access**: Only users with `@northsouth.edu` emails can access the system.

### Admin Features

- **Manual Admin Addition**: Admins are manually added to the Google Sheet by the owner.
- **Cancel Bookings**: Admins can cancel any slot, and the user who booked it will receive an email notification.
- **Advanced Booking**: Admins can book slots for specific time periods.
- **Slot Availability Management**: Admins can mark slots as "No Available" or "Available."
- **Disable Booking**: Admins can turn off slot booking for a specific day.

---

## Data Structure

The system returns data in the following JSON format:

```json
{
  "available": true,
  "isAdmin": false,
  "toDay": {
    "date": "2024-02-14",
    "timeSlots": ["10:00 AM", "11:00 AM", "12:00 PM"],
    "indoorGames": {
      "Badminton Court 1": {
        "1": {
          "status": "Available",
          "bookedBy": "",
          "row": 8,
          "col": 2
        },
        "2": {
          "status": "Booked by You",
          "bookedBy": "Tanvirul Niloy",
          "row": 8,
          "col": 3
        }
      }
    },
    "outdoorGames": {
      "Basketball": {
        "1": {
          "status": "Not Available",
          "bookedBy": "",
          "row": 15,
          "col": 2
        },
        "2": {
          "status": "Booked",
          "bookedBy": "Jane Smith",
          "row": 15,
          "col": 3
        }
      }
    }
  },
  "nextDay": {
    "date": "2024-02-15",
    "timeSlots": ["10:00 AM", "11:00 AM", "12:00 PM"],
    "indoorGames": {
      "Badminton Court 1": {
        "1": {
          "status": "Available",
          "bookedBy": "",
          "row": 8,
          "col": 2
        }
      }
    },
    "outdoorGames": {
        ...,
    }
  }
}
```

---

## Frontend Overview

The frontend is built using HTML and JavaScript. It provides a simple interface for guide users to interact with the system. Its's a sample.

### Key Components

#### Login with Google

Users log in using their Google accounts via the Google Identity Services library. After successful login, the app container becomes visible, allowing users to interact with the system.

#### Input Fields

Users can input the row, column, and select an action (e.g., "Book Slot" or "Toggle Availability").

#### Buttons

- **Get Request**: Fetches data from the backend API.
- **Send Request**: Sends a POST request to the backend API with the selected action and slot details.

#### Response Container

Displays responses from the backend API.

---

## Backend Integration

The backend is powered by Google Apps Script, which interacts with a Google Sheet to manage slot data.

### Google Apps Script Setup

- A Google Sheet is used as the database.
- A Google Apps Script web app acts as the API backend.
- The backend script handles authentication, booking, cancellation, and availability toggling.

### API Endpoints

- **GET /exec**: Fetches slot data for the current and next day.
- **POST /exec**: Books or toggles the availability of a slot.

---

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/tan7vir/slot-booking-system.git
cd slot-booking-system
```

### Set Up Google Apps Script

- Create a new Google Sheet and link it to a Google Apps Script project.
- Copy the backend script into the Apps Script editor.
- Deploy the script as a web app and note the deployment URL.

### Update the Frontend

- Replace the `apiUrl` in the frontend code with your deployed Google Apps Script URL.
- Update the `client_id` in the frontend code with your Google OAuth client ID.

### Run the Application

- Open the `index.html` file in your browser.
- Log in with your Google account and start using the system.

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

---

## License

This project does not include a license.

