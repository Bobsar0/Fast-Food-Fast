/* eslint-disable no-param-reassign */
const menuhost = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ IN PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';
document.addEventListener('DOMContentLoaded', () => {
  const req = new Request(`${menuhost}/menu`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  const menuErr = document.getElementById('menuErr');
  const divsArr = [];
  const sectionArr = [
    { name: 'meals', foodDivs: [], count: 0 },
    { name: 'snacks', foodDivs: [], count: 0 },
    { name: 'drinks', foodDivs: [], count: 0 },
    { name: 'combos', foodDivs: [], count: 0 },
    { name: 'desserts', foodDivs: [], count: 0 },
  ];

  const pg1 = document.getElementById('page1');
  const prevPg = document.getElementById('prevPg');
  const nextPg = document.getElementById('nextPg');

  const pgsArr = [pg1];
  const pgsId = ['page1'];

  function pagination(pgId, startIndex) {
    sectionArr.forEach((genreSect) => {
      document.getElementById(genreSect.name).style.display = 'none';
      genreSect.foodDivs.forEach((div) => {
        div.style.display = 'none';
      });
      // 4 food items per section
      const divSlice = genreSect.foodDivs.slice(startIndex, startIndex + 4);
      divSlice.forEach((div) => {
        document.getElementById(genreSect.name).style.display = 'block';
        div.style.display = 'block';
      });
    });
    pgsArr.forEach((pg) => {
      pg.className = '';
    });
    if (pgId === 'page1') {
      document.getElementById(pgId).className = 'current';
      prevPg.style.display = 'none';
      nextPg.style.display = 'block';
    } else if (pgId === `page${pgsArr.length}`) {
      prevPg.style.display = 'block';
      nextPg.style.display = 'none';
    } else {
      prevPg.style.display = 'block';
      nextPg.style.display = 'block';
    }
  }

  fetch(req).then((resp) => {
    resp.json().then((res) => {
      if (res.error.message === 'undefined' || res.error.message === 'jwt expired') {
        localStorage.clear();
        window.location.href = 'login';
      }
      if (res.status === 'success') {
        res.products.forEach((food) => {
          if (food.isavailable) {
            const {
              foodid, name, price, genre,
            } = food;

            let { img, description } = food;
            if (img && img.startsWith('uploads')) {
              img = `../${img}`;
            }
            if (description === null) {
              description = `Delicious ${name} made with the finest ingredients`;
            }
            const div = document.createElement('DIV');
            div.className = 'responsive';
            div.id = `${name}_${genre}`;
            div.innerHTML = `
            <div class="gallery">
              <div class="flip-box">
                <div class="flip-box-inner">
                  <div class="flip-box-front">
                    <img src="${img}" alt="${name}" id="img${foodid}">
                  </div>
                  <div class="flip-box-back">
                    <h2>Description:</h2>
                    <p>${description}</p>
                  </div>
                </div>
              </div>
              <div class="desc">
                <h1 id="item${foodid}">${name}</h1>
                <p class="price" id="price${foodid}">&#x20a6; ${price}.00</p>
                <p><span class="fa fa-star checked"></span>
                  <span class="fa fa-star checked"></span>
                  <span class="fa fa-star checked"></span>
                  <span class="fa fa-star checked"></span>
                  <span class="fa fa-star checked"></span>
                </p>
                <p>Select Quantity: 
                  <select id="selectQty${foodid}">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </p>
                <button class="buyBtn" id="buy${foodid}">Buy Now</button>
                <button class="cartBtn" id="btn${foodid}">Add to Cart</button>
              </div>
            </div>`;

            // Dynamically add pages based on no of food items per section
            sectionArr.forEach((genreSect) => {
              if (genreSect.name === `${genre}s`) {
                genreSect.foodDivs.push(div);
                const { length } = genreSect.foodDivs;
                // 4 food items per section
                if (length !== 1 && (length - 1) % 4 === 0) {
                  const a = document.createElement('a');
                  a.id = `page${((length - 1) / 4) + 1}`;
                  a.textContent = ((length - 1) / 4) + 1;

                  if (pgsId.indexOf(a.id) === -1) {
                    document.getElementById('pgs').appendChild(a);
                    pgsArr.push(a);
                    pgsId.push(a.id);
                  }
                }
              }
            });
            document.getElementById(`${genre}s`).appendChild(div);
            divsArr.push(div);
          }
        });
        pagination('page1', 0);

        // Listen for a click event and display corresponding food items upon click
        pgsArr.forEach((pg) => {
          const { id } = pg;
          document.getElementById(id).onclick = () => {
            // Formula below displays 4 food items per section upon pg click
            pagination(id, (id.slice(-1) ** 2) - ((id.slice(-1) - 2) ** 2));
            pg.className = 'current';
          };
        });

        [...document.getElementsByClassName('pgNav')].forEach((nav) => {
          nav.onclick = () => {
            let id = '';
            pgsArr.forEach((pg) => {
              if (pg.className.includes('current')) {
                if (nav.id === 'prevPg') {
                  id = `page${Number(pg.id.slice(-1)) - 1}`;
                }
                if (nav.id === 'nextPg') {
                  id = `page${Number(pg.id.slice(-1)) + 1}`;
                }
                pagination(id, (id.slice(-1) ** 2) - ((id.slice(-1) - 2) ** 2));
              }
            });
            document.getElementById(id).className = 'current';
          };
        });

        let count = 0;
        const totalFood = divsArr.length;
        const divFoundArr = [];
        const searchFood = document.getElementById('menuSearch');
        searchFood.onkeyup = () => {
          // hide all sections
          [...document.querySelectorAll('section.menu')].forEach((section) => {
            section.style.display = 'none';
          });
          // hide pagination
          document.getElementById('pgsDiv').style.display = 'none';
          divsArr.forEach((div) => {
            const input = searchFood.value.toUpperCase();
            // show only relevant sections and divs
            if (div.id.includes(input)) {
              const index = div.id.indexOf('_');
              document.getElementById(`${div.id.slice(index + 1)}s`).style.display = 'block';
              div.style.display = 'block';
              if (divFoundArr.indexOf(div) === -1) {
                divFoundArr.push(div);
              }
            } else {
              div.style.display = 'none';
              if (divFoundArr.indexOf(div) !== -1) {
                divFoundArr.splice(divFoundArr.indexOf(div), 1);
              }
            }
            count = divFoundArr.length;
            if (count === 0) {
              menuErr.className = 'err';
              menuErr.innerHTML = 'No matching food item found';
            } else if (count === 1) {
              menuErr.className = 'success';
              menuErr.innerHTML = `${count} food item found`;
            } else {
              menuErr.className = 'success';
              menuErr.innerHTML = `${count} food items found`;
            }
            if (!input) {
              // show pagination
              document.getElementById('pgsDiv').style.display = 'block';
              pagination(pg1.id, 0);
            }
          });
          if (count === totalFood) {
            menuErr.innerHTML = '';
          }
        };
      }
    }).catch((err) => {
      menuErr.innerHTML = err;
    });
  }).catch((fetchErr) => {
    menuErr.innerHTML = `${fetchErr}... ARE YOU OFFLINE? Please try again in a few minutes`;
  });
});
