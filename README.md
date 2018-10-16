[![Build Status](https://travis-ci.com/Bobsar0/Fast-Food-Fast.svg?branch=develop)](https://travis-ci.com/Bobsar0/Fast-Food-Fast)
[![Coverage Status](https://coveralls.io/repos/github/Bobsar0/Fast-Food-Fast/badge.svg?branch=develop&service=github)](https://coveralls.io/github/Bobsar0/Fast-Food-Fast?branch=develop)
[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/Bobsar0/Fast-Food-Fast)
[![Heroku](https://img.shields.io/badge/heroku-deployed-green.svg)](https://fast-food-fast-bobsar0.herokuapp.com)
# Fast-Food-Fast 
*An Andela Developer Challenge Project* 

## Description
Fast-Food-Fast is a food delivery service app challenge built using plain HTML5, CSS, JS for front end and Node.js for the backend. The project is divided into **UI implementation** and **API Endpoints** sections with features for both demonstrated below. The overall solution is hosted on [Heroku](https://fast-food-fast-bobsar0.herokuapp.com/)

### UI Implementation
> This involves creating just the UI elements - pages and views 
#### Features
- User [signup](https://fast-food-fast-bobsar0.herokuapp.com/signup) and [login](https://fast-food-fast-bobsar0.herokuapp.com/login) pages
- [A page where a user should be able to order for food and view order history](https://fast-food-fast-bobsar0.herokuapp.com/menu)
- [A page where the admin can do the following](https://fast-food-fast-bobsar0.herokuapp.com/admin):
  - See a list of orders
  - Accept and decline orders
  - Mark orders as completed

### API Endpoints
> This involves primarily creating RESTful API endpoints to power the front-end pages.
#### Features
| Endpoints             | Functionality
| ----------------------|--------------------------------| 
| GET    /orders        | Get all orders.                | 
| GET    /orders/:id    | Fetch a specific order.        |
| POST   /orders        | Place a new order.             |
| PUT    /orders/:id    | Update the status of an order. |
| DELETE /orders/:id    | Delete an order.               |


## Getting Started
These instructions will get you a copy of the project running on your local machine for development and testing purposes.

### Prerequisites
`node.js v8.11.4` recommended;  `npm v6.4.1` or greater recommended

### Installation and Testing
- Clone the master repository to access all files and dependency versions
- Run `npm install` to install all dependencies
- Run `npm test` to test files
- Run `npm start` to get the system running


## Built With
- [Node.js](https://nodejs.org/en/)/Express - Server-side framework
- [Mocha/Chai](https://mochajs.org/) - Testing framework
- [ESLint](https://eslint.org/) - Linting library
- [Airbnb style guide](https://github.com/airbnb/javascript)
- [Pivotal Tracker](https://www.pivotaltracker.com/dashboard) - Project management tool
- [Babel 7](https://babeljs.io/) - Compiling >=ES2015 features to native JS
- [Postman](https://www.getpostman.com/) - Testing API endpoints
- Development Approach - TDD/BDD