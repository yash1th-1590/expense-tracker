# Expense Tracker

A modern and responsive personal finance management application designed to help users track expenses, manage budgets, monitor financial goals, and analyze spending patterns through a clean and professional interface.

## Overview

Expense Tracker provides a centralized dashboard for managing personal finances. Users can record and organize transactions, create budgets, set financial goals, monitor progress, and generate spending reports.

The application uses browser-based local storage, allowing financial data to remain available between sessions without requiring a backend database.

## Features

### Dashboard
- Overview of total income, expenses, and balance
- Recent transaction summary
- Budget and financial goal progress
- Spending analysis through charts

### Transaction Management
- Add new income and expense transactions
- Edit existing transactions
- Delete transactions
- Categorize transactions
- Filter transactions
- Validate transaction inputs
- Persistent transaction storage

### Budget Management
- Create and manage category-based budgets
- Track budget utilization
- Monitor remaining budget amounts
- View budget progress directly from the application

### Financial Goals
- Create savings and financial goals
- Track goal progress
- Add contributions toward goals
- Edit and delete goals
- Monitor remaining amounts and completion progress

### Reports
- Analyze income and expenses
- View spending distribution
- Generate financial summaries
- Export transaction data as CSV

### Additional Functionality
- Quick transaction entry
- Round-up savings functionality
- Data persistence using Local Storage
- Reset application data
- Responsive design
- Input validation
- Secure rendering of user-provided transaction data
- CSV data escaping for reliable exports

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)

### Browser Storage
- LocalStorage

### Data Visualization
- JavaScript-based charts

## Project Structure

```text
Expense-Tracker/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── utils.js
│   ├── storage.js
│   ├── charts.js
│   ├── transactions.js
│   ├── goals.js
│   ├── budgets.js
│   └── reports.js
│
└── README.md
