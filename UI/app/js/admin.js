/* eslint-disable no-param-reassign */
// SIDE NAVIGATION BAR
const open = document.getElementById('openBtn');
const close = document.getElementById('closeBtn');

function toggleSideNav(width) {
  document.getElementById('mySidenav').style.width = width;
  document.getElementById('main').style.marginLeft = width;
}

open.onclick = () => {
  toggleSideNav('250px');// 0,0,0,0.4
};

close.onclick = () => {
  toggleSideNav('0');
};

window.onclick = (event) => {
  if (event.target !== open) {
    toggleSideNav('0');
  }
};

// Modal display
const generalAdminModal = document.getElementById('generalAdminModal');
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
// UNCOMMENT BELOW AND USE IN REQ IN PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================================================ //
  /** ************************************ MANAGE ORDERS ************************************* */
  // ============================================================================================ //
  let req = {};

  const ordersMsg = document.getElementById('manageOrdersMsg');
  const manageMenuMsg = document.getElementById('manageMenuMsg');

  const getOrdersBtn = document.getElementById('getOrders');
  getOrdersBtn.onclick = () => {
    req = new Request(`${host}/orders`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.token,
      },
    });
    fetch(req).then((resp) => {
      resp.json().then((res) => {
        ordersMsg.className = 'err';
        ordersMsg.innerHTML = res.message;
        const { status, data } = res;
        if (status === 'success') {
          ordersMsg.className = 'success';
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
                displayModal(generalAdminModal, span0);
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
                        ordersMsg.className = 'success';
                        ordersMsg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                        odrStatus = upRes.order.status;
                        statusCell.textContent = odrStatus;
                        date2Cell.textContent = upRes.order.modified_date;
                        styleProcessing();
                      } else {
                        ordersMsg.className = 'err';
                        ordersMsg.innerHTML = upRes.message;
                        if (upRes.message === 'undefined' || upRes.message === 'jwt expired') {
                          localStorage.clear();
                          window.location.href = 'login';
                        }
                      }
                    }).catch(resErr => console.log('res err:', resErr));
                  }).catch(fetchErr => console.log('fetch err:', fetchErr));
                  generalAdminModal.style.display = 'none';
                };
              }
            };

            /** DECLINE BTN */
            declineBtn.onclick = () => {
              if (odrStatus === 'NEW' || odrStatus === 'PROCESSING') {
                modalTxt.innerHTML = `Are you sure you want to CANCEL Order ${orderId}?
                <p><textarea id="cancelReason" placeholder="Please provide a reason for cancellation..."></textarea></p>
                <p>This action is irreversible!</p>
                <div class="err" id="cancelErr"></div>`;
                displayModal(generalAdminModal, span0);
                yes.onclick = () => {
                  const reason = document.getElementById('cancelReason').value;
                  if (!reason || !reason.trim()) {
                    document.getElementById('cancelErr').textContent = 'Please provide a reason for order cancellation';
                    return;
                  }
                  const updateReq = new Request(`${host}/orders/${orderid}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-access-token': localStorage.token,
                    },
                    body: JSON.stringify({ status: 'CANCELLED', reason: reason.trim() }),
                  });
                  fetch(updateReq).then((upResp) => {
                    upResp.json().then((upRes) => {
                      if (upRes.status === 'success') {
                        ordersMsg.className = 'success';
                        ordersMsg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                        odrStatus = upRes.order.status;
                        statusCell.textContent = odrStatus;
                        date2Cell.textContent = upRes.order.modified_date;
                        styleCancelled();
                      } else {
                        ordersMsg.className = 'err';
                        ordersMsg.innerHTML = upRes.message;
                      }
                    }).catch(resErr => console.log('res err:', resErr));
                  }).catch(fetchErr => console.log('fetch err:', fetchErr));
                  generalAdminModal.style.display = 'none';
                };
              }
            };

            /** CHECKBOX INPUT */
            input.onclick = () => {
              input.checked = false;
              modalTxt.innerHTML = `Are you sure ORDER ${orderId} has been COMPLETED?
              <p>This order cannot be unmarked if marked as completed</p>`;
              displayModal(generalAdminModal, span0);
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
                      ordersMsg.className = 'success';
                      ordersMsg.innerHTML = `${orderIdCell.textContent} ${upRes.message}`;
                      odrStatus = upRes.order.status;
                      statusCell.textContent = odrStatus;
                      date2Cell.textContent = upRes.order.modified_date;
                      styleComplete();
                    } else {
                      ordersMsg.className = 'err';
                      ordersMsg.innerHTML = upRes.message;
                      if (upRes.message === 'undefined' || upRes.message === 'jwt expired') {
                        localStorage.clear();
                        window.location.href = 'login';
                      }
                    }
                  }).catch(resErr => console.log('res err:', resErr));
                }).catch(fetchErr => console.log('fetch err:', fetchErr));
                generalAdminModal.style.display = 'none';
              };
            };
            // NEXT
          });
        } else if (status === 'fail') {
          ordersMsg.className = 'err';
          ordersMsg.innerHTML = res.message;
          if (res.message === 'undefined' || res.message === 'jwt expired') {
            localStorage.clear();
            window.location.href = 'login';
          }
        }
      }).catch(err => console.error('resp json error:', err));
    }).catch(fetchErr => console.error('fetch err:', fetchErr));
    document.getElementById('manageOrdersDiv').style.display = 'block';
    // SHOW ONLY ORDER TABLE
    manageMenuMsg.innerHTML = '';
    document.getElementById('allStats').style.display = 'none';
    document.getElementById('allFood').style.display = 'none';
    document.getElementById('allOrders').style.display = 'block';
  };

  // ============================================================================================ //
  /** ************************************ ADD FOOD TO MENU ************************************* */
  // ============================================================================================ //
  const addForm = document.getElementById('addForm');
  const createMenuLink = document.getElementById('createMenu');
  const createMenuModal = document.getElementById('createMenuModal');
  const span1 = document.getElementsByClassName('close')[1];
  const addBtnInput = document.getElementById('addBtn');
  const menuMsg = document.getElementById('createMenuMsg');

  createMenuLink.onclick = () => {
    displayModal(createMenuModal, span1);
    toggleSideNav('0');
  };

  addBtnInput.onclick = () => {
    const formData = new FormData(addForm);

    req = new Request(`${host}/menu`, {
      method: 'POST',
      headers: {
        'x-access-token': localStorage.token,
      },
      body: formData,
    });
    fetch(req).then((resp) => {
      resp.json().then((res) => {
        if (res.status === 'success') {
          menuMsg.className = 'success';
        } else {
          menuMsg.className = 'err';
        }
        if (res.error && res.error.includes('Cannot read property \'path\'')) {
          menuMsg.className = 'err';
          menuMsg.innerHTML = 'Please upload an image of your food item';
          return;
        }
        if (res.error && res.error.includes('duplicate')) {
          menuMsg.className = 'err';
          menuMsg.innerHTML = 'Food item already exists on the menu!';
          return;
        }
        if (res.error === 'undefined' || res.error === 'jwt expired') {
          localStorage.clear();
          window.location.href = 'login';
        }
        if (res.error) {
          menuMsg.className = 'err';
          menuMsg.innerHTML = 'Server Error. Please try again in a few minutes';
          return;
        }
        menuMsg.innerHTML = res.message;
      }).catch((err) => {
        menuMsg.innerHTML = err.message;
        menuMsg.className = 'err';
      });
    }).catch(fetchErr => `Server Error: ${fetchErr}. Please try again in a few mins`);
  };

  // ============================================================================================ //
  /** ************************************ MANAGE MENU ITEMS ************************************ */
  // ============================================================================================ //
  // Filter table according to order column value
  const searchMenu = document.getElementById('menuSearchInp');

  searchMenu.onkeyup = () => {
    const table = document.getElementById('adminMenuTable');
    const tRows = table.getElementsByTagName('tr');

    [...tRows].slice(1).forEach((tr) => {
      if (tr.textContent.toUpperCase().includes(searchMenu.value.toUpperCase())) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  };

  const getMenuBtn = document.getElementById('getMenu');

  getMenuBtn.onclick = () => {
    toggleSideNav('0');
    req = new Request(`${host}/menu`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.token,
      },
    });
    fetch(req).then((resp) => {
      resp.json().then((res) => {
        manageMenuMsg.className = 'success';
        manageMenuMsg.innerHTML = res.message;
        const { status, products } = res;
        if (status === 'success') {
          manageMenuMsg.className = 'success';
          products.forEach((food) => {
            const { foodid } = food;
            let {
              name, price, genre, img, isavailable, description,
            } = food;

            const foodIdCell = document.createTextNode(`#${foodid}`);
            const nameCell = document.createTextNode(name);
            const priceCell = document.createTextNode(price);
            const genreCell = document.createTextNode(genre);
            const availableCell = document.createTextNode(isavailable);
            const date1Cell = document.createTextNode(food.created_date.slice(0, 19));
            const date2Cell = document.createTextNode(food.modified_date.slice(0, 19));

            const editBtn = document.createElement('BUTTON');
            editBtn.className = 'approveBtn';
            editBtn.id = `editBtn${foodid}`;
            const editTxt = document.createTextNode('Edit Item');
            editBtn.appendChild(editTxt);

            const deleteBtn = document.createElement('BUTTON');
            deleteBtn.className = 'declineBtn';
            deleteBtn.id = `deleteBtn${foodid}`;
            const delTxt = document.createTextNode('Delete Item');
            deleteBtn.appendChild(delTxt);

            const cellArr = [
              foodIdCell, nameCell, priceCell, genreCell,
              availableCell, date1Cell, date2Cell, editBtn, deleteBtn,
            ];
            const tr = document.createElement('TR');
            tr.className = 'menuRow';

            const tbody = document.getElementById('adminMenuTableBody');
            cellArr.forEach((cell) => {
              const td = document.createElement('TD');
              td.appendChild(cell);
              tr.appendChild(td);
            });
            tbody.appendChild(tr);

            const editModal = document.getElementById('editMenuModal');
            const span2 = document.getElementsByClassName('close')[2];

            /** EDIT BTN */
            editBtn.onclick = () => {
              const imgDiv = document.querySelector('#origImg');
              imgDiv.innerHTML = `<a href="${img}" target="_blank"><img src="${img}" alt="${name}" style="height: 100px; width:100px;"></a>`;

              document.querySelector('#editForm #name').value = name;
              document.querySelector('#editForm #price').value = price;
              document.querySelector('#editForm #genre').value = genre;
              document.querySelector('#editForm #isAvailable').value = isavailable;
              document.querySelector('#editForm #desc').value = description;

              document.getElementById('editModalTitle').innerHTML = `<h1>Edit Food #${foodid}</h1>`;
              displayModal(editModal, span2);

              const saveBtn = document.getElementById('saveBtn');
              saveBtn.onclick = () => {
                name = document.querySelector('#editForm #name').value;
                price = document.querySelector('#editForm #price').value;
                genre = document.querySelector('#editForm #genre').value;
                isavailable = document.querySelector('#editForm #isAvailable').value;
                description = document.querySelector('#editForm #desc').value;

                const editForm = document.getElementById('editForm');
                const imgURL = document.querySelector('#editForm #imgURL');
                const imgUpload = document.querySelector('#editForm #img');
                const editMenuMsg = document.getElementById('editMenuMsg');

                if (imgURL.value && imgUpload.files[0]) {
                  editMenuMsg.className = 'err';
                  editMenuMsg.innerHTML = 'Sorry, you can either enter an image URL or use the upload functionality, not both';
                  return;
                }

                if (imgURL.value) {
                  img = imgURL.value;
                }
                let headers = {
                  'Content-Type': 'application/json',
                  'x-access-token': localStorage.token,
                };
                let body = JSON.stringify({
                  name, price, genre, isAvailable: isavailable, img, description,
                });

                if (imgUpload.files[0]) {
                  headers = {
                    'x-access-token': localStorage.token,
                  };
                  body = new FormData(editForm);
                }
                req = new Request(`${host}/menu/${foodid}`, {
                  method: 'PUT',
                  headers,
                  body,
                });
                fetch(req).then((editResp) => {
                  editResp.json().then((editRes) => {
                    editMenuMsg.innerHTML = '';
                    if (editRes.status === 'success') {
                      editMenuMsg.className = 'success';
                      imgDiv.innerHTML = `<a href="${editRes.food.img}" target="_blank"><img src="${editRes.food.img}" alt="${editRes.food.name}" style="height: 100px; width:100px;"></a>`;
                      nameCell.textContent = editRes.food.name;
                      priceCell.textContent = editRes.food.price;
                      genreCell.textContent = editRes.food.genre;
                      availableCell.textContent = editRes.food.isavailable;
                      date2Cell.textContent = editRes.food.modified_date;
                    } else {
                      editMenuMsg.className = 'err';
                    }
                    editMenuMsg.innerHTML = editRes.message;
                  }).catch((resErr) => {
                    editMenuMsg.innerHTML = `Server error: ${resErr}. Please try again in a bit`;
                  });
                }).catch((fetchErr) => {
                  editMenuMsg.innerHTML = `Error: ${fetchErr}. Are you offline? Please try again in a bit`;
                });
              };
            };

            /** DELETE BTN */
            deleteBtn.onclick = () => {
              modalTxt.innerHTML = `Are you sure you want to DELETE ${name} (ID #${foodid})?
                <p>This action is irreversible!</p>`;
              displayModal(generalAdminModal, span0);
              yes.onclick = () => {
                req = new Request(`${host}/menu/${foodid}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.token,
                  },
                });
                fetch(req).then((delResp) => {
                  delResp.json().then((delRes) => {
                    if (delRes.status === 'success') {
                      tbody.removeChild(tr);
                      manageMenuMsg.className = 'success';
                    } else {
                      manageMenuMsg.className = 'err';
                    }
                    manageMenuMsg.innerHTML = delRes.message;
                  }).catch((resErr) => {
                    manageMenuMsg.innerHTML = `Server error: ${resErr}. Please try again in a bit`;
                  });
                }).catch((fetchErr) => {
                  manageMenuMsg.innerHTML = `Error: ${fetchErr}. Are you offline? Please try again in a bit`;
                });
                generalAdminModal.style.display = 'none';
              };
            };
            // NEXT
          });
        } else if (status === 'fail') {
          manageMenuMsg.className = 'err';
          manageMenuMsg.innerHTML = res.message;
          if (res.message === 'undefined' || res.message === 'jwt expired') {
            localStorage.clear();
            window.location.href = 'login';
          }
        }
      }).catch(err => console.error('resp json error:', err));
    }).catch(fetchErr => console.error('fetch err:', fetchErr));
    // SHOW TABLE
    ordersMsg.innerHTML = '';
    document.getElementById('allStats').style.display = 'none';
    document.getElementById('allOrders').style.display = 'none';
    document.getElementById('allFood').style.display = 'block';
  };

  document.getElementById('viewStats').onclick = () => {
    toggleSideNav('0');
    document.getElementById('allOrders').style.display = 'none';
    document.getElementById('allFood').style.display = 'none';
    document.getElementById('allStats').style.display = 'block';
  };
});
