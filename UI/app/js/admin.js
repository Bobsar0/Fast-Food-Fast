// SIDE NAVIGATION BAR
const open = document.getElementById('openBtn');
const close = document.getElementById('closeBtn');

function toggleSideNav(width, color) {
  document.getElementById('mySidenav').style.width = width;
  document.getElementById('main').style.marginLeft = width;
  document.body.style.backgroundColor = color;
}

open.onclick = () => {
  toggleSideNav('250px', 'rgba(0,0,0,0.4)');
};

close.onclick = () => {
  toggleSideNav('0', 'white');
};

window.onclick = (event) => {
  if (event.target !== open) {
    toggleSideNav('0', 'white');
  }
};

// Modal display
const generalModal = document.getElementById('generalModal');
const modalTxt = document.getElementById('generalInfo');
const span0 = document.getElementsByClassName('close')[0];
const yes = document.getElementById('yes');
const no = document.getElementById('no');
// Display modal
function displayModal(modal, span) {
  modal.style.display = 'block';
  // Close the modal when the user clicks on <span> (x)
  span.onclick = () => {
    modal.style.display = 'none';
  };
  no.onclick = () => {
    modal.style.display = 'none';
  };
  // Also close when anywhere in the window is clicked
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Filter table according to order column value
const search = document.getElementById('orderSearch');

search.onkeyup = () => {
  const table = document.getElementById('adminOrdersTable');
  const tRows = table.getElementsByTagName('tr');

  [...tRows].slice(1).forEach((tr) => {
    const input = search.value.toUpperCase();
    if (tr.textContent.includes(input)) {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  });
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

            let odrStatus = order.status;

            const orderIdCell = document.createTextNode(`#${userid}FFF${orderid}`);
            const foodCell = document.createTextNode(food);
            const qtyCell = document.createTextNode(quantity);
            const priceCell = document.createTextNode(price);
            const statusCell = document.createTextNode(odrStatus);
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
            input.style.cursor = 'pointer';

            const cellArr = [
              orderIdCell, foodCell, qtyCell, priceCell, statusCell,
              date1Cell, date2Cell, approveBtn, declineBtn, input,
            ];
            const tr = document.createElement('TR');
            tr.className = 'orderRow';

            const tbody = document.getElementById('adminOrdersTableBody');
            cellArr.forEach((cell) => {
              const td = document.createElement('TD');
              td.appendChild(cell);
              tr.appendChild(td);
            });

            const styleComplete = () => {
              tr.style.backgroundColor = 'greenyellow';
              approveBtn.style.opacity = 0.5;
              approveBtn.style.cursor = 'not-allowed';
              declineBtn.style.opacity = 0.5;
              declineBtn.style.cursor = 'not-allowed';
              input.style.cursor = 'not-allowed';
              input.checked = true;
              input.disabled = true;
            };
            const styleProcessing = () => {
              tr.style.backgroundColor = 'goldenrod';
              approveBtn.style.opacity = 0.5;
              approveBtn.style.cursor = 'not-allowed';
            };
            const styleCancelled = () => {
              tr.style.backgroundColor = 'rgb(247, 134, 134)';
              approveBtn.style.opacity = 0.5;
              approveBtn.style.cursor = 'not-allowed';
              declineBtn.style.opacity = 0.5;
              declineBtn.style.cursor = 'not-allowed';
              input.style.cursor = 'not-allowed';
              input.disabled = true;
            };

            if (odrStatus === 'PROCESSING') {
              styleProcessing();
            } else if (odrStatus === 'CANCELLED') {
              styleCancelled();
            } else if (odrStatus === 'COMPLETE') {
              styleComplete();
            }
            tbody.appendChild(tr);

            const orderId = `#${userid}FFF${orderid}`;
            /** APPROVE BTN */
            approveBtn.onclick = () => {
              if (odrStatus === 'NEW') {
                modalTxt.innerHTML = `Are you sure you want to APPROVE the processing of ORDER ${orderId}?`;
                displayModal(generalModal, span0);
                yes.onclick = () => {
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
                        odrStatus = upRes.order.status;
                        statusCell.textContent = odrStatus;
                        date2Cell.textContent = upRes.order.modified_date;
                        styleProcessing();
                      }
                    }).catch(resErr => console.log('res err:', resErr));
                  }).catch(fetchErr => console.log('fetch err:', fetchErr));
                  generalModal.style.display = 'none';
                };
              }
            };

            /** DECLINE BTN */
            declineBtn.onclick = () => {
              if (odrStatus === 'NEW' || odrStatus === 'PROCESSING') {
                modalTxt.innerHTML = `Are you sure you want to CANCEL Order ${orderId}?
                <p>This action cannot be undone</p>`;
                displayModal(generalModal, span0);
                yes.onclick = () => {
                  const updateReq = new Request(`${host}/orders/${orderid}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-access-token': localStorage.token,
                    },
                    body: JSON.stringify({ status: 'CANCELLED' }),
                  });
                  fetch(updateReq).then((upResp) => {
                    upResp.json().then((upRes) => {
                      if (upRes.status === 'success') {
                        msg.className = 'success';
                        msg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                        odrStatus = upRes.order.status;
                        statusCell.textContent = odrStatus;
                        date2Cell.textContent = upRes.order.modified_date;
                        styleCancelled();
                      }
                    }).catch(resErr => console.log('res err:', resErr));
                  }).catch(fetchErr => console.log('fetch err:', fetchErr));
                  generalModal.style.display = 'none';
                };
              }
            };

            /** CHECKBOX INPUT */
            input.onclick = () => {
              modalTxt.innerHTML = `Are you sure ORDER ${orderId} has been COMPLETED?
              <p>This order cannot be unmarked if marked as completed</p>`;
              displayModal(generalModal, span0);
              yes.onclick = () => {
                const updateReq = new Request(`${host}/orders/${orderid}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.token,
                  },
                  body: JSON.stringify({ status: 'COMPLETE' }),
                });

                fetch(updateReq).then((upResp) => {
                  upResp.json().then((upRes) => {
                    if (upRes.status === 'success') {
                      msg.className = 'success';
                      msg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                      odrStatus = upRes.order.status;
                      statusCell.textContent = odrStatus;
                      date2Cell.textContent = upRes.order.modified_date;
                      styleComplete();
                    }
                  }).catch(resErr => console.log('res err:', resErr));
                }).catch(fetchErr => console.log('fetch err:', fetchErr));
                generalModal.style.display = 'none';
              };
              no.onclick = () => {
                input.checked = false;
                generalModal.style.display = 'none';
              };
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
