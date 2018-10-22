const local = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ FOR PRODUCTION
// const heroku = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

const buyBtns = document.getElementsByClassName('buyBtn');

const genModal = document.getElementById('generalModal');
const info = document.getElementById('generalInfo');
const close = document.getElementsByClassName('close')[1]; // Get the <span> element that closes the modal

function displayModal(modal, spanClass) {
  modal.style.display = 'block';
  // Close the modal when the user clicks on <span> (x)
  spanClass.onclick = () => {
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
      info.innerHTML = ('Please <a href="/signup"><b>signup</b></a> or <a href="/login"><b>login</b></a> to continue with this purchase');
      displayModal(genModal, close);
      return;
    }
    const btnID = buyBtn.id;
    // the last 2-digits in the id corresponds to the last digit in btnID
    const name = document.getElementById(`item${btnID.slice(-2)}`).innerHTML;
    const quantity = Number(document.querySelector(`select#selectQty${btnID.slice(-2)}`).value);
    let price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
    price = quantity * Number(price.slice(4));

    // Open a modal
    info.innerHTML = `Please fill in your contact details below and confirm order purchase of 
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

    displayModal(genModal, close);

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

      const req = new Request(`${local}/orders`, {
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
            info.innerHTML = `<p style="color: red">Error: ${res.error.message || res.error}</p>`;
            displayModal(genModal, close);
          } else if (res.status === 'fail') {
            buyErr.innerHTML = `<p>${res.message}</p>`;
          } else if (res.status === 'success') {
            info.innerHTML = `<span style="color: green"><b>${res.message}!</b></span>
            <h4 style="text-decoration: underline"> YOUR ORDER DETAILS: </h4>
            <p><span style="color: blue">Order ID</span>: <b>#${res.order.userid}FFF${res.order.orderid}</b></p>
            <span style="color: blue">Food</span>: <b>${res.order.food}</b>
            <p><span style="color: blue">Quantity</span>: <b>${res.order.quantity}</b></p>
            <p><span style="color: blue">Price</span>: <b>NGN ${res.order.price}.00</b></p>
            <br>We will contact you shortly at <b>${phone.value}</b> or <b>${localStorage.email}</b> with further details.
            <h5 style="color: red"><i>For any queries, contact us on 08146509343 and quote your Order ID.</i></h5>`;

            displayModal(genModal, close);
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
