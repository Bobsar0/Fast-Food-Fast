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

  fetch(req).then((resp) => {
    resp.json().then((res) => {
      console.log('res:', res);
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
            document.getElementById(`${genre}s`).appendChild(div);
          }
        });
      }
    }).catch(err => console.error('resp json error:', err));
  }).catch(fetchErr => console.error('fetch err:', fetchErr));
});
