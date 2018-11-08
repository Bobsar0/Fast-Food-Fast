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
  const aArr = [];

  const pg1 = document.getElementById('page1');
  const pg2 = document.getElementById('page2');
  const pg3 = document.getElementById('page3');
  const pgs = [pg1, pg2, pg3];
  // const pgsSpan = docum

  function pagination(page, startIndex) {
    sectionArr.forEach((genreSect) => {
      genreSect.foodDivs.forEach((div) => {
        div.style.display = 'none';
      });
      const divSlice = genreSect.foodDivs.slice(startIndex, startIndex + 4);
      divSlice.forEach((div) => {
        div.style.display = 'block';
      });

      // if (genreSect.foodDivs.length === 0) {
      //   document.getElementById(genreSect.name).style.display = 'none';
      // } else {
      //   document.getElementById(genreSect.name).style.display = 'block';
      // }
    });
    pgs.forEach((pg) => {
      pg.className = '';
    });
    page.className = 'current';
  }
  const a = document.createElement('a');

  fetch(req).then((resp) => {
    resp.json().then((res) => {
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
                <p class="price" id="price${foodid}">NGN ${price}.00</p>
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

            sectionArr.forEach((genreSect) => {
              if (genreSect.name === `${genre}s`) {
                genreSect.foodDivs.push(div);
                const { length } = genreSect.foodDivs;
                if (length % 5 === 0) {
                  a.id = `page${(length / 5) + 1}`;
                  a.textContent = (length / 5) + 1;
                  if (aArr.indexOf(a) === -1) {
                    document.getElementById('pgs').appendChild(a);
                    aArr.push(a);
                  }
                }
                if (genreSect.foodDivs.length > 4) {
                  div.style.display = 'none';
                }
              }
            });
            document.getElementById(`${genre}s`).appendChild(div);
            divsArr.push(div);
          }
        });

        pg1.onclick = () => {
          pagination(pg1, 0);
        };
        pg2.onclick = () => {
          pagination(pg2, 4);
        };
        pg3.onclick = () => {
          pagination(pg3, 8);
        };

        let count = 0;
        const totalFood = divsArr.length;
        const divFoundArr = [];
        const searchFood = document.getElementById('menuSearch');
        searchFood.onkeyup = () => {
          // hide all sections
          [...document.querySelectorAll('section.menu')].forEach((section) => {
            section.style.display = 'none';
          });
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
