// GET ALL ORDERS
const open = document.getElementById('openBtn');
const close = document.getElementById('closeBtn');

open.onclick = () => {
  document.getElementById('mySidenav').style.width = '250px';
  document.getElementById('main').style.marginLeft = '250px';
  document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
};

close.onclick = () => {
  document.getElementById('mySidenav').style.width = '0';
  document.getElementById('main').style.marginLeft = '0';
  document.body.style.backgroundColor = 'white';
};

const host = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ FOR PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

document.addEventListener('DOMContentLoaded', () => {
  // const userId = localStorage.id;
  const req = new Request(`${host}/orders`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  const msg = document.getElementById('msg');
  const getAllBtn = document.getElementById('getAll');
  getAllBtn.onclick = () => {
    fetch(req).then((resp) => {
      resp.json().then((res) => {
        msg.className = 'success';
        msg.innerHTML = res.message;
        const { message, status, data } = res;
        if (status === 'success' && message === 'Orders retrieved successfully') {
          data.orders.forEach((order) => {
            const {
              orderid, userid, food, quantity, price,
            } = order;

            const orderIdCell = document.createTextNode(`#${userid}FFF${orderid}`);
            const foodCell = document.createTextNode(food);
            const qtyCell = document.createTextNode(quantity);
            const priceCell = document.createTextNode(price);
            const statusCell = document.createTextNode(order.status);
            statusCell.id = `status${orderid}`;
            const date1Cell = document.createTextNode(order.created_date.slice(0, 19));
            const date2Cell = document.createTextNode(order.modified_date.slice(0, 19));

            const approveBtn = document.createElement('BUTTON');
            approveBtn.className = 'approveBtn';
            approveBtn.id = `approveBtn${orderid}`;
            const approveTxt = document.createTextNode('Approve Order');
            approveBtn.appendChild(approveTxt);

            const declineBtn = document.createElement('BUTTON');
            declineBtn.className = 'declineBtn';
            declineBtn.id = `declineBtn${orderid}`;
            const declineTxt = document.createTextNode('Decline order');
            declineBtn.appendChild(declineTxt);

            const input = document.createElement('INPUT');
            input.className = 'checkbox';
            input.id = `checkbox${orderid}`;
            input.type = 'checkbox';
            const cellArr = [
              orderIdCell, foodCell, qtyCell, priceCell, statusCell, date1Cell, date2Cell, approveBtn, declineBtn, input,
            ];
            const tr = document.createElement('TR');

            const tbody = document.getElementById('adminOrdersTableBody');
            cellArr.forEach((cell) => {
              const td = document.createElement('TD');
              td.appendChild(cell);
              tr.appendChild(td);
            });
            tbody.appendChild(tr);

            /** APPROVE BTN */
            approveBtn.onclick = () => {
              const updateReq = new Request(`${host}/orders/${orderid}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-access-token': localStorage.token,
                },
                body: JSON.stringify({ status: 'PROCESSING' }),
              });

              fetch(updateReq).then((upResp) => {
                upResp.json().then((upRes) => {
                  if (upRes.status === 'success') {
                    msg.className = 'success';
                    msg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                    statusCell.textContent = upRes.order.status;
                    tr.style.backgroundColor = '#bbb';
                  }
                }).catch(resErr => console.log('res err:', resErr));
              }).catch(fetchErr => console.log('fetch err:', fetchErr));
            };
            
            // NEXT
          });
        } else if (status === 'fail') {
          msg.className = 'err';
          msg.innerHTML = res.message;
        }
      }).catch(err => console.error('resp json error:', err));
    }).catch(fetchErr => console.error('fetch err:', fetchErr));
  };
});
