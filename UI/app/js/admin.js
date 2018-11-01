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
// UNCOMMENT BELOW AND USE IN REQ IN PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================================================ //
  /** ************************************ MANAGE ORDERS ************************************* */
  // ============================================================================================ //
  let req = new Request(`${host}/orders`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  const msg = document.getElementById('msg');
  const getOrdersBtn = document.getElementById('getOrders');

  getOrdersBtn.onclick = () => {
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
              input.checked = false;
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
            };
            // NEXT
          });
        } else if (status === 'fail') {
          msg.className = 'err';
          msg.innerHTML = res.message;
        }
      }).catch(err => console.error('resp json error:', err));
    }).catch(fetchErr => console.error('fetch err:', fetchErr));
    document.getElementById('manageOrdersDiv').style.display = 'block';
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
    toggleSideNav('0', 'white');
  };

  addBtnInput.onclick = () => {
    console.log('imgfile:', document.getElementById('img').files);
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
        if (res.error && res.error.includes('Cannot read property \'path\'')) {
          msg.className = 'err';
          menuMsg.innerHTML = 'Please upload an image of your food item';
          return;
        }
        if (res.error && res.error.includes('duplicate')) {
          msg.className = 'err';
          menuMsg.innerHTML = 'Food item already exists on the menu!';
          return;
        }
        if (res.error) {
          msg.className = 'err';
          menuMsg.innerHTML = 'Server Error. Please try again in a few minutes';
          return;
        }
        if (res.status === 'success') {
          menuMsg.className = 'success';
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

  req = new Request(`${host}/menu`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  const manageMenuMsg = document.getElementById('manageMenuMsg');
  const getMenuBtn = document.getElementById('getMenu');

  getMenuBtn.onclick = () => {
    toggleSideNav('0', 'white');
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

            const declineBtn = document.createElement('BUTTON');
            declineBtn.className = 'declineBtn';
            declineBtn.id = `declineBtn${foodid}`;
            const declineTxt = document.createTextNode('Delete Item');
            declineBtn.appendChild(declineTxt);

            const cellArr = [
              foodIdCell, nameCell, priceCell, genreCell,
              availableCell, date1Cell, date2Cell, editBtn, declineBtn,
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
              const editModal = document.getElementById('editMenuModal');
              const span2 = document.getElementsByClassName('close')[2];
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
                    console.log('editRes', editRes);
                    editMenuMsg.innerHTML = '';
                    if (editRes.status === 'success') {
                      editMenuMsg.className = 'success';
                      editMenuMsg.innerHTML = editRes.message;
                      imgDiv.innerHTML = `<a href="${editRes.food.img}" target="_blank"><img src="${editRes.food.img}" alt="${editRes.food.name}" style="height: 100px; width:100px;"></a>`;
                      nameCell.textContent = editRes.food.name;
                      priceCell.textContent = editRes.food.price;
                      genreCell.textContent = editRes.food.genre;
                      availableCell.textContent = editRes.food.isavailable;
                      date2Cell.textContent = editRes.food.modified_date;
                    }
                  }).catch(resErr => console.log('res err:', resErr));
                }).catch(fetchErr => console.log('fetch err:', fetchErr));
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
