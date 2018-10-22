const host = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ FOR PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

// when document has loaded

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.id;
  const req = new Request(`${host}/users/${userId}/orders`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  fetch(req).then((resp) => {
    resp.json().then((res) => {
      const { message, orders } = res;
      if (message === 'Orders retrieved successfully') {
        orders.forEach((order) => {
          const {
            orderid, food, quantity, price, status,
          } = order;

          const orderIdCell = document.createTextNode(`#${userId}FFF${orderid}`);
          const foodCell = document.createTextNode(food);
          const qtyCell = document.createTextNode(quantity);
          const priceCell = document.createTextNode(price);
          const statusCell = document.createTextNode(status);
          const dateCell = document.createTextNode(order.created_date.slice(0, 19));

          const cellArr = [
            orderIdCell, foodCell, qtyCell, priceCell, statusCell, dateCell,
          ];
          const tr = document.createElement('TR');

          const tbody = document.getElementById('histTableBody');
          cellArr.forEach((cell) => { // append each cell to td then to tr
            const td = document.createElement('TD'); // create table data
            td.appendChild(cell);
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      } else {
        const msg = document.getElementById('msg');
        msg.innerHTML = `<h3><b>You have not made any orders yet.</b></h3>
        <p>Proceed to <a href='../../templates/userMenu.html'>menu</a> to begin</p>`;
      }
    }).catch(err => console.error('resp json error:', err));
  }).catch(fetchErr => console.error('fetch err:', fetchErr));
});
