const localhost = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ FOR PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';


/** **BUY NOW & ADD TO CART IMPLEMENTATION*** */
const buyBtns = document.getElementsByClassName('buyBtn');

const cartBtns = document.getElementsByClassName('cartBtn');
const cartTable = document.getElementById('cartTable');
const cartErr = document.getElementById('cartErr');
const checkoutBtn = document.getElementById('checkoutBtn');

const generalModal = document.getElementById('generalModal');
const msg = document.getElementById('generalInfo');
const span1 = document.getElementsByClassName('close')[1]; // Get the <span> element that closes the modal

// Total price for cart items
const total = document.getElementById('totalPrice');
const totalItems = document.getElementById('totalItems');
let totalPrice = 0;

// Hold all the cells in an array so as to transfer to order history
let cartCellArr = [];
let trArr = [];

// Helper function that appends row containing data to table
function appendtoTable(cellArr, tr, tableName) {
  cellArr.forEach((cell) => { // append each cell to td then to tr
    const td = document.createElement('TD'); // create table data
    td.appendChild(cell);
    tr.appendChild(td);
  });
  tableName.appendChild(tr); // append to table
}

function displayModal(modal, span1) {
  modal.style.display = 'block';
  // Close the modal when the user clicks on <span> (x)
  span1.onclick = () => {
    modal.style.display = 'none';
  };
  // Also close when anywhere in the window is clicked
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// BUY NOW - SINGLE ITEM PURCHASE
[...buyBtns].forEach((buyBtn) => {
  buyBtn.addEventListener('click', () => {
    if (!document.getElementById('menuWelcome').textContent.includes('Welcome ')) {
      // open modal asking user to sign up
      msg.innerHTML = ('Please <a href="/signup"><b>signup</b></a> or <a href="/login"><b>login</b></a> to continue with this purchase');
      displayModal(generalModal, span1);
      return;
    }
    const btnID = buyBtn.id;
    // the last 2-digits in the id corresponds to the last digit in btnID
    const name = document.getElementById(`item${btnID.slice(-2)}`).innerHTML;
    const quantity = Number(document.querySelector(`select#selectQty${btnID.slice(-2)}`).value);
    let price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
    price = quantity * Number(price.slice(4));

    // Open a modal
    msg.innerHTML = `Please fill in your contact details below and confirm order purchase of 
    <b>${quantity}x ${name}</b> for <b>NGN ${price}.00</b>
        <p><b>Address: <input type="text" placeholder="Please enter your delivery address" id="buyNowAddr"></b></p>
        <p><b>PhoneNo: <input type="number" placeholder="Please enter your phone number" id="buyNowPhone"></b></p>

        <p class="err" id="buyErr"><p>
        <button id="buyCheckoutBtn">Submit Order</button>`;

    const address = document.getElementById('buyNowAddr');
    const phone = document.getElementById('buyNowPhone');
    if (localStorage.address) {
      address.value = localStorage.getItem('address');
    }
    if (localStorage.phone) {
      phone.value = localStorage.getItem('phone');
    }

    displayModal(generalModal, span1);

    document.getElementById('buyCheckoutBtn').onclick = () => {
      const buyErr = document.getElementById('buyErr');
      buyErr.innerHTML = '';
      if (!address.value || address.value === 'null') {
        buyErr.innerHTML = 'Please fill in your delivery address';
        return;
      }
      if (!phone.value || phone.value === 'null') {
        buyErr.innerHTML = 'Please fill in your phone number';
        return;
      }

      const req = new Request(`${localhost}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.token,
        },
        body: JSON.stringify({
          name, quantity, address: address.value, phone: phone.value,
        }),
      });
      fetch(req).then((resp) => {
        resp.json().then((res) => {
          if (res.error) {
            msg.innerHTML = `<p style="color: red">Error: ${res.error.message || res.error}</p>`;
            displayModal(generalModal, span1);
          } else if (res.status === 'fail') {
            buyErr.innerHTML = `<p>${res.message}</p>`;
          } else if (res.status === 'success') {
            msg.innerHTML = `<span style="color: green"><b>${res.message}!</b></span>
            <h4 style="text-decoration: underline"> YOUR ORDER DETAILS: </h4>
            <p><span style="color: blue">Order ID</span>: <b>${res.order.orderid}</b></p>
            <span style="color: blue">Food</span>: <b>${res.order.food}</b>
            <p><span style="color: blue">Quantity</span>: <b>${res.order.quantity}</b></p>
            <p><span style="color: blue">Price</span>: <b>NGN ${res.order.price}.00</b></p>
            <br>We will contact you shortly at <b>${phone.value}</b> or <b>${localStorage.email}</b> with further details.
            <h6 style="color: red"><i>For any queries, contact us on 08146509343 and quote your Order ID.</i></h6>`;

            displayModal(generalModal, span1);
          }
        }).catch((err) => {
          console.log('err in json:', err);
          buyErr.innerHTML = `${err.message}`;
        });
      }).catch((fetchErr) => {
        console.error('err in fetch:', fetchErr);
        buyErr.innerHTML = `${fetchErr.message}`;
      });
    };
  });
});

// *** ADD TO CART IMPLEMENTATION ***/
// orders with price for cart manipulation
let orders = [];
// Array to send to server
let foodArray = [];
// Assign count to each event
let count = 0;

// Listen for a click event on each 'Add to Cart' button and append order info to shopping cart
[...cartBtns].forEach((cartBtn) => {
  cartBtn.addEventListener('click', () => {
    if (!document.getElementById('menuWelcome').textContent.includes('Welcome ')) {
      // open modal asking user to sign up
      msg.innerHTML = ('Please <a href="/signup"><b>signup</b></a> or <a href="/login"><b>login</b></a> to continue with your order');
      displayModal(generalModal, span1);
      return;
    }
    const btnID = cartBtn.id;
    // the last 2-digits in the id corresponds to the last digit in btnID
    const name = document.getElementById(`item${btnID.slice(-2)}`).innerHTML;
    const img = document.getElementById(`img${btnID.slice(-2)}`);
    let quantity = Number(document.querySelector(`select#selectQty${btnID.slice(-2)}`).value);
    let price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
    price = quantity * Number(price.slice(4));

    orders.forEach((order) => {
      if (order.name === name) {
        // remove everything associated with similar order of which updated one will be re-added
        count -= 1;
        quantity += order.quantity;
        price += order.price;
        totalPrice -= order.price;
        const i = orders.indexOf(order);
        orders.splice(i, 1);
        foodArray.splice(i, 1);

        trArr.forEach((tr) => {
          if (tr.textContent.includes(order.name)) {
            // remove row from trArr
            trArr.splice(trArr.indexOf(tr), 1);
            // remove row from cartTable
            cartTable.removeChild(tr);
            // remove row from cartCellArr
            cartCellArr.forEach((cell) => {
              if (cell[1].textContent === order.name) {
                cartCellArr.splice(cartCellArr.indexOf(cell), 1);
              }
            });
          }
        });
      }
    });
    // Add new or updated item to orders and foodArray
    orders.push({ name, quantity, price });
    foodArray.push({ name, quantity });

    // cart item quantity update
    let qty = 0;
    orders.forEach((order) => {
      if (order.name === name) {
        qty = order.quantity;
      }
    });

    totalPrice += Number(price);
    total.innerHTML = totalPrice.toFixed(2);
    localStorage.setItem('totalPrice', JSON.stringify(totalPrice));

    // Open a modal
    msg.innerHTML = (`<b>${qty}x ${name}</b> successfully added to cart`);
    displayModal(generalModal, span1);

    count += 1;
    totalItems.innerHTML = count;
    localStorage.setItem('cartCount', `${count}`);

    // Create contents for the table data cells in each row
    const cartImg = img.cloneNode();

    cartImg.style.height = '80px';
    cartImg.style.width = '80px';

    const cell1 = document.createTextNode(name);
    const cell2 = document.createTextNode(quantity);
    const cell3 = document.createTextNode(price);

    // Create a cancel order button
    const cancelBtn = document.createElement('BUTTON');
    cancelBtn.className = 'cancelOdr';
    cancelBtn.id = `cancelOdr${count}`;
    const cancel = document.createTextNode('Delete Item');
    cancelBtn.appendChild(cancel);

    const tr = document.createElement('TR');

    const cells = [cartImg, cell1, cell2, cell3, cancelBtn];
    appendtoTable(cells, tr, cartTable);
    // append row to array to be used to delete cart table upon checkout
    trArr.push(tr);
    // Append cells to array (excluding count) to be used to fill orderHistory
    cartCellArr.push(cells);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cart', JSON.stringify(cartCellArr));

    // *** If cancel btn is clicked *** //
    cancelBtn.onclick = () => {
      cartErr.innerHTML = '';
      quantity = 0;
      count -= 1;
      totalItems.innerHTML = count;
      // remove row from cartTable
      cartTable.removeChild(tr);
      // remove row from trArr
      const index = trArr.indexOf(tr);
      // call splice() if indexOf() didn't return -1:
      if (index !== -1) {
        trArr.splice(index, 1);
      }
      // remove row from cartCellArr
      cartCellArr.forEach((cell) => {
        if (cell[cell.length - 1].id === cancelBtn.id) {
          // Delete cell
          cartCellArr.splice(cartCellArr.indexOf(cell), 1);
          // remove row from order and foodArray
          orders.forEach((order) => {
            if (order.name === cell[1].textContent) {
              const i = orders.indexOf(order);
              orders.splice(i, 1);
              foodArray.splice(i, 1);
            }
          });
        }
      });

      // update orders in localStorage
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('foodArray', JSON.stringify(foodArray));

      totalPrice -= Number(price);
      total.innerHTML = totalPrice.toFixed(2);
      localStorage.setItem('totalPrice', JSON.stringify(totalPrice));

      if (totalPrice === 0) {
        checkoutBtn.style.backgroundColor = '#212121';
        checkoutBtn.style.cursor = 'not-allowed';
        checkoutBtn.style.color = 'goldenrod';
        checkoutBtn.style.opacity = 0.6;
      }
    };
  });
});

//* **********MODAL**********/
const modal = document.getElementById('modalDiv'); // Get the modal
const cart = document.getElementById('cartInfo'); // Get the cart that opens the modal
const span = document.getElementsByClassName('close')[0]; // Get the <span> element that closes the modal

const address = document.getElementById('userAddr');
const phone = document.getElementById('userPhone');
// Open the modal when the user clicks on the cart,
cart.onclick = () => {
  if (localStorage.getItem('address')) {
    address.value = localStorage.getItem('address');
  }
  if (localStorage.getItem('phone')) {
    phone.value = localStorage.getItem('phone');
  }

  modal.style.display = 'block';
  const condition = Number(total.innerHTML) === 0;

  // Style checkout button
  checkoutBtn.style.cursor = condition ? 'not-allowed' : 'pointer';
  checkoutBtn.style.backgroundColor = condition ? '#212121' : '#2ec371';
  checkoutBtn.style.color = condition ? 'goldenrod' : 'white';
  checkoutBtn.style.opacity = condition ? 0.6 : 1;

  displayModal(modal, span);
};

// Order History
const orderHistory = document.getElementById('tableHistory');

// CHECKOUT BUTTON
checkoutBtn.onclick = () => {
  if (!address.value || address.value === 'null') {
    cartErr.innerHTML = 'Please fill in your delivery address';
    return;
  }
  if (!phone.value || phone.value === 'null') {
    cartErr.innerHTML = 'Please fill in your phone number';
    return;
  }
  cartErr.innerHTML = '';
  if (totalPrice > 0) {
    if (!orders) {
      orders = JSON.parse(localStorage.orders);
    }

    if (!foodArray) {
      foodArray = JSON.parse(localStorage.foodArray);
    }

    const req = new Request(`${localhost}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': localStorage.token,
      },
      body: JSON.stringify({ foodArray, address: address.value, phone: phone.value }),
    });
    fetch(req).then((resp) => {
      resp.json().then((res) => {
        if (res.error) {
          msg.innerHTML = `<p style="color: red">Error: ${res.error.message || res.error}</p>`;
          displayModal(generalModal, span1);
        } else if (res.status === 'fail') {
          cartErr.innerHTML = `<p>${res.message}</p>`;
        } else if (res.status === 'success') {
          let i = 0;
          msg.innerHTML = `<span style="color: green"><b>${res.message}!</b></span>
          <h4 style="text-decoration: underline"> YOUR ORDER DETAILS: </h4>
          <p><span style="color: blue">Order ID</span>: <b>${res.order.orderid}</b></p>`;

          res.order.food.forEach((food) => {
            const { name, quantity } = food;
            i += 1;
            const p = document.createElement('P');
            p.innerHTML = `<span style="color: blue">Food${i}</span>: <b>${quantity}x ${name}</b>`;
            msg.appendChild(p);
          });

          const div = document.createElement('DIV');
          div.innerHTML = `  
          <p><span style="color: blue">Total Quantity</span>: <b>${res.order.quantity}</b></p>
          <p><span style="color: blue">Price</span>: <b>NGN ${res.order.price}.00</b></p>
          <br>We will contact you shortly at <b>${phone.value}</b> or <b>${localStorage.email}</b> with further details.
          <h6 style="color: red"><i>Please note your Order ID for any correspondence related to this order.</i></h6>`;

          msg.appendChild(div);
          displayModal(generalModal, span1);

          totalPrice = 0;
          total.innerHTML = totalPrice.toFixed(2);
          // Remove rows from cart table
          trArr.forEach(((tr) => {
            cartTable.removeChild(tr); // remove row from table
          }));
          // Clear trArr
          trArr = [];

          // Record order in order history table
          cartCellArr.forEach((cells) => {
            // Add date as first element in cell
            const date = document.createTextNode(`${new Date()}`);
            cells.unshift(date);
            const trHist = document.createElement('TR');
            appendtoTable(cells, trHist, orderHistory);
          });
          // Reset data
          cartCellArr = [];
          orders = [];
          foodArray.length = 0;
          count = 0;
          totalItems.innerHTML = 0;
          localStorage.removeItem(orders);
          localStorage.removeItem(foodArray);
          // Style button
          checkoutBtn.style.backgroundColor = '#212121';
          checkoutBtn.style.cursor = 'not-allowed';
          checkoutBtn.style.color = 'goldenrod';
          checkoutBtn.style.opacity = 0.6;
        }
      }).catch((err) => {
        console.error('err in placing order:', err);
      });
    }).catch(fetchErr => console.error('fetcherr:', fetchErr));
  }
};
