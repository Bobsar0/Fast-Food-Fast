/** **ADD TO CART IMPLEMENTATION*** */
const cartBtns = document.getElementsByClassName('cartBtn');
const cartTable = document.getElementById('cartTable');
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
const orders = [];
// Assign count to each event
let count = 0;
// Listen for a click event on each 'Add to Cart' button and append order info to shopping cart
Array.prototype.forEach.call(cartBtns, (cartBtn) => {
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
        // remove everything associated with order to be re-added later
        count -= 1;
        quantity += order.quantity;
        price += order.price;
        totalPrice -= order.price;
        orders.splice(orders.indexOf(order, 1));

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
    // Add new or updated item to orders
    orders.push({ name, quantity, price });

    totalPrice += Number(price);
    total.innerHTML = totalPrice.toFixed(2);
    localStorage.setItem('totalPrice', JSON.stringify(totalPrice));

    // Open a modal
    msg.innerHTML = (`<b>${quantity}x ${name}</b> successfully added to cart`);
    displayModal(generalModal, span1);

    count += 1;
    totalItems.innerHTML = count;
    localStorage.setItem('cartCount', `${count}`);

    // Create contents for the table data cells in each row
    const cartImg = img.cloneNode();

    cartImg.style.height = '100px';
    cartImg.style.width = '100px';

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
    // Add order to localStorage
    // console.log('cartcell:', cartCellArr);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cart', JSON.stringify(cartCellArr));

    // *** If cancel btn is clicked *** //
    cancelBtn.onclick = () => {
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
          // remove row from order
          orders.forEach((order) => {
            if (order.name === cell[1]) {
              orders.splice(orders.indexOf(order), 1);
            }
          });
        }
      });
      // update orders in localStorage
      localStorage.setItem('orders', JSON.stringify(orders));

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

const cartErr = document.getElementById('cartErr');
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
  if (!address.value) {
    cartErr.innerHTML = 'Please fill in your delivery address';
    return;
  }
  if (!address.value) {
    cartErr.innerHTML = 'Please fill in your phone number';
    return;
  }
  count = 0;
  totalItems.innerHTML = 0;
  if (totalPrice > 0) {
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
    // Clear cartCellArr
    cartCellArr = [];
    // Style button
    checkoutBtn.style.backgroundColor = '#212121';
    checkoutBtn.style.cursor = 'not-allowed';
    checkoutBtn.style.color = 'goldenrod';
    checkoutBtn.style.opacity = 0.6;
  }
};
