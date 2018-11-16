let totalNew = 0;
let totalProcessing = 0;
let totalReady = 0;
let totalCancelled = 0;
let totalComplete = 0;

let totalSales = 0;
let totalOrders = 0;
let totalUsers = 0;
let totalMenu = 0;


const ordersStatsErr = document.getElementById('orderStatsErr');
const usersStatsErr = document.getElementById('userStatsErr');
const menuStatsErr = document.getElementById('menuStatsErr');

const host = 'http://localhost:9999/api/v1';
// UNCOMMENT BELOW AND USE IN REQ IN PRODUCTION
// const herokuhost = 'https://fast-food-fast-bobsar0.herokuapp.com/api/v1/';

let req = new Request(`${host}/orders`, {
  method: 'GET',
  headers: {
    'x-access-token': localStorage.token,
  },
});
fetch(req).then((resp) => {
  resp.json().then((res) => {
    console.log('response:', res)
    const { data } = res;
    if (res.status === 'success') {
      data.orders.forEach((order) => {
        totalOrders += 1;
        document.getElementById('orders').innerHTML = totalOrders;
        const { price, status } = order;
        if (status === 'COMPLETE') {
          totalComplete += 1;
          totalSales += price;
          document.getElementById('sales').innerHTML = totalSales;
        }

        //PIE CHART
        if (status === 'NEW') {
          totalNew += 1;
        }
        if (status === 'PROCESSING') {
          totalProcessing += 1;
        }
        if (status === 'CANCELLED') {
          totalCancelled += 1;
        }
        if (status === 'READY') {
          totalReady += 1;
        }
      });
    }
  }).catch((err) => {
    ordersStatsErr.innerHTML = err;
  });
}).catch((fetchErr) => {
});

req = new Request(`${host}/users`, {
  method: 'GET',
  headers: {
    'x-access-token': localStorage.token,
  },
});
fetch(req).then((resp) => {
  resp.json().then((res) => {
    console.log('response:', res)
    if (res.status === 'success') {
      document.getElementById('users').innerHTML = res.count;
    } else {
      usersStatsErr.innerHTML = res.message;
    }
  }).catch((err) => {
    usersStatsErr.innerHTML = err;
  });
}).catch((fetchErr) => {
  usersStatsErr.innerHTML = fetchErr;
});

const genresArr = [];
const genresObjArr = [];
const menuArr = [['Genre', 'Total']];

const getMenu = new Promise((resolve, reject) => {
  req = new Request(`${host}/menu`, {
    method: 'GET',
    headers: {
      'x-access-token': localStorage.token,
    },
  });

  fetch(req).then((resp) => {
    resp.json().then((res) => {
      if (res.status === 'success') {
        document.getElementById('menu').innerHTML = res.count;
        res.products.forEach((food) => {
          const { genre } = food;
          if (genresArr.indexOf(genre) === -1) {
            genresArr.push(genre);
            genresObjArr.push({ name: genre, count: 0 });
          }

          genresObjArr.forEach((genreObj) => {
            if (genreObj.name === genre) {
              genreObj.count += 1;
            }
          });
        });
        genresObjArr.forEach((genreObj) => {
          menuArr.push([genreObj.name, genreObj.count]);
        });
        resolve(menuArr);
      } else {
        menuStatsErr.innerHTML = res.message;
      }
    }).catch((err) => {
      menuStatsErr.innerHTML = err;
    });
  }).catch((fetchErr) => {
    menuStatsErr.innerHTML = fetchErr;
  });
});

// DRAW CHARTS
// Load google charts
google.charts.load('current', { packages: ['corechart', 'bar'] });

function drawChart() {
  // DRAW ORDERS PIE CHART
  const ordersData = google.visualization.arrayToDataTable([
    ['Status', 'Number of orders'],
    ['New', totalNew],
    ['Processing', totalProcessing],
    ['Ready', totalReady],
    ['Cancelled', totalCancelled],
    ['Complete', totalComplete],
  ]);
  const ordersOptions = {
    title: 'Orders Statistics', is3D: true, width: 450, height: 220,

  };
  const ordersChart = new google.visualization.PieChart(document.getElementById('ordersChart'));
  ordersChart.draw(ordersData, ordersOptions);

  // DRAw MENU PIE CHART
  getMenu.then((menu) => {
    const menuData = google.visualization.arrayToDataTable(menu);
    const menuChart = new google.visualization.PieChart(document.getElementById('menuChart'));
    const menuOptions = {
      title: 'Menu Statistics', is3D: true, width: 450, height: 220,
    };
    menuChart.draw(menuData, menuOptions);
  }).catch(err => console.log('error in getMenu:', err));

  const salesOptions = {
    chart: {
      title: 'Company Performance',
      subtitle: 'Sales across all Food genres: 2014-2017',
    },
  };
  const salesData = google.visualization.arrayToDataTable([
    ['Year', 'TotalSales', 'Meal', 'Snacks', 'Drinks', 'Combo', 'Desserts' ],
    ['2014', 1000, 400, 200, 3,4,5],
    ['2015', 1170, 460, 250, 55,55,66],
    ['2016', 660, 1120, 300,44,5,6],
    ['2017', 1030, 540, 350, 44, 5,6]
  ]);
  const salesChart = new google.charts.Bar(document.getElementById('salesGraph'));
  salesChart.draw(salesData, google.charts.Bar.convertOptions(salesOptions));
}

google.charts.setOnLoadCallback(drawChart);
