/** **ADD TO CART IMPLEMENTATION*** */
const cartBtns = document.getElementsByClassName('cartBtn');
const table = document.getElementById('table');
const tableHist = document.getElementById('tableHistory');

// Helper function tht appends row containing data to table
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
    const price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
    alert(`${name} successfully added to cart`); // alert user of successful cart addition

    const tr = document.createElement('TR'); // create a tablerow node

    // Create contents for the table data cells in each row
    const cell1 = document.createTextNode(name);
    const cell2 = document.createTextNode(price);

    // Create a submit order for review button
    const submitBtn = document.createElement('BUTTON'); //
    submitBtn.id = 'submitOdr';
    submitBtn.className = 'submitClass';

    const submit = document.createTextNode('Submit Order');
    submitBtn.appendChild(submit);

    // Create a cancel order button
    const cancelBtn = document.createElement('BUTTON');
    cancelBtn.id = 'cancelOdr';
    const cancel = document.createTextNode('Cancel Order');
    cancelBtn.appendChild(cancel);

    const cancelHist = document.createElement('BUTTON');
    const cancelTxt = document.createTextNode('Erase History');
    cancelHist.id = 'cancelOdr';
    cancelHist.appendChild(cancelTxt);

    const cells = [cell1, cell2, submitBtn, cancelBtn];
    appendtoTable(cells, tr, table);

    // If submit btn is clicked
    submitBtn.onclick = () => {
      table.removeChild(tr); // remove row from table
      alert(`Your order of ${name} at the cost of ${price} has been successfully placed! We will contact you shortly with further details.`);
      const date = document.createTextNode(`${new Date()}`);// Record date and time the order was placed
      const cells = [date, cell1, cell2, cancelHist];
      const trHist = document.createElement('TR'); // create a new tablerow node
      appendtoTable(cells, trHist, tableHist);
    };
    // If cancel btn is clicked
    cancelBtn.onclick = () => {
      table.removeChild(tr); // remove row from table
    };
  });
});



//* **********MODAL**********/
const modal = document.getElementById('modalDiv'); // Get the modal
const cart = document.getElementById('cartInfo'); // Get the cart that opens the modal
const span = document.getElementsByClassName('close')[0]; // Get the <span> element that closes the modal

// Open the modal when the user clicks on the text,
cart.onclick = () => {
  modal.style.display = 'block';
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
