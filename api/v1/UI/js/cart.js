/** **ADD TO CART IMPLEMENTATION*** */
const cartBtns = document.getElementsByClassName('cartBtn');
const cartTable = document.getElementById('cartTable');
const checkoutBtn = document.getElementById('checkoutBtn');

// Total price for cart items
const total = document.getElementById('totalPrice');
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

// Listen for a click event on each 'Add to Cart' button and append order info to shopping cart
Array.prototype.forEach.call(cartBtns, (cartBtn) => {
  cartBtn.addEventListener('click', () => {
    const btnID = cartBtn.id;
    const name = document.getElementById(`item${btnID.slice(-2)}`).innerHTML; // the last 2-digits in the id corresponds to the last digit  in btnID
    const qty = document.querySelector(`select#selectQty${btnID.slice(-2)}`).value;
    let price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
    price = Number(qty) * Number(price.slice(4));

    totalPrice += Number(price);
    total.innerHTML = totalPrice.toFixed(2);

    alert(`${qty}x ${name} successfully added to cart`); // alert user of successful cart addition

    const tr = document.createElement('TR'); // create a tablerow node

    // Create contents for the table data cells in each row
    const cell1 = document.createTextNode(name);
    const cell2 = document.createTextNode(qty);
    const cell3 = document.createTextNode(price);

    // Create a cancel order button
    const cancelBtn = document.createElement('BUTTON');
    cancelBtn.id = 'cancelOdr';
    const cancel = document.createTextNode('Delete Item');
    cancelBtn.appendChild(cancel);

    const cells = [cell1, cell2, cell3, cancelBtn];
    appendtoTable(cells, tr, cartTable);
    trArr.push(tr);

    // If cancel btn is clicked
    cancelBtn.onclick = () => {
      cartTable.removeChild(tr); // remove row from cartTable
      totalPrice -= Number(price);
      total.innerHTML = totalPrice.toFixed(2);
      if (totalPrice === 0) {
        checkoutBtn.style.backgroundColor = '#212121';
        checkoutBtn.style.cursor = 'not-allowed';
        checkoutBtn.style.color = 'goldenrod';
        checkoutBtn.style.opacity = 0.6;
      }
    };
    // Append cells to array to be used to fill orderHistory
    cartCellArr.push(cells);
  });
});

//* **********MODAL**********/
const modal = document.getElementById('modalDiv'); // Get the modal
const cart = document.getElementById('cartInfo'); // Get the cart that opens the modal
const span = document.getElementsByClassName('close')[0]; // Get the <span> element that closes the modal

// Open the modal when the user clicks on the text,
cart.onclick = () => {
  modal.style.display = 'block';
  const condition = Number(total.innerHTML) === 0;

  // Style checkout button
  checkoutBtn.style.cursor = condition ? 'not-allowed' : 'pointer';
  checkoutBtn.style.backgroundColor = condition ? '#212121' : '#2ec371';
  checkoutBtn.style.color = condition ? 'goldenrod' : 'white';
  checkoutBtn.style.opacity = condition ? 0.6 : 1;
};
// Close the modal when the user clicks on <span> (x)
span.onclick = () => {
  modal.style.display = 'none';
};

// Also close the modal when the user clicks anywhere outside of the modal,
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Order History
const orderHistory = document.getElementById('tableHistory');
// // If submit btn is clicked
checkoutBtn.onclick = () => {
  if (totalPrice > 0) {
    alert('Your order has been successfully placed! We will contact you shortly with further details.');
    totalPrice = 0;
    total.innerHTML = totalPrice.toFixed(2);
    const cancelHist = document.createElement('BUTTON');
    const cancelTxt = document.createTextNode('Erase History');
    cancelHist.id = 'cancelOdrHist';
    cancelHist.appendChild(cancelTxt);

    // Remove rows from cart table
    trArr.forEach(((tr) => {
      cartTable.removeChild(tr); // remove row from table
    }));
    // Clear trArr
    trArr = [];

    // Record order in order history table
    cartCellArr.forEach((cells) => {
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
