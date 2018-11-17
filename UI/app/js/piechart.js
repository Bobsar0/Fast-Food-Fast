/* eslint-disable no-param-reassign */
let totalNew = 0;
let totalProcessing = 0;
// let totalReady = 0;
let totalCancelled = 0;
let totalComplete = 0;

let totalSales = 0;
let totalOrders = 0;

const datesObjArr = [];

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
    const { data } = res;
    if (res.status === 'success') {
      data.orders.forEach((order) => {
        totalOrders += 1;
        document.getElementById('orders').innerHTML = totalOrders;
        // eslint-disable-next-line camelcase
        const { price, status, modified_date } = order;
        if (status === 'COMPLETE') {
          totalComplete += 1;
          totalSales += price;
          document.getElementById('sales').innerHTML = totalSales;
          datesObjArr.push({ date: modified_date.slice(0, 10), price });
        }

        // PIE CHART DATA
        if (status === 'NEW') {
          totalNew += 1;
        }
        if (status === 'PROCESSING') {
          totalProcessing += 1;
        }
        if (status === 'CANCELLED') {
          totalCancelled += 1;
        }
        // if (status === 'READY') {
        //   totalReady += 1;
        // }
      });
    }
  }).catch((err) => {
    ordersStatsErr.innerHTML = err;
  });
}).catch((fetchErr) => {
  ordersStatsErr.innerHTML = fetchErr;
});

// USERS STATS
req = new Request(`${host}/users`, {
  method: 'GET',
  headers: {
    'x-access-token': localStorage.token,
  },
});
fetch(req).then((resp) => {
  resp.json().then((res) => {
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

// MENU STATS
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
google.charts.load('current', { packages: ['corechart'] });

function drawPieChart() {
  // DRAW ORDERS PIE CHART
  const ordersData = google.visualization.arrayToDataTable([
    ['Status', 'Number of orders'],
    ['New', totalNew],
    ['Cancelled', totalCancelled],
    ['Processing', totalProcessing],
    // ['Ready', totalReady],
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
}

// DRAW CALENDAR CHART
google.charts.load('current', { packages: ['calendar'] });

function drawCalendarChart() {
  const salesArr = [];
  const dateArr = [];

  datesObjArr.forEach((dateObj) => {
    const { date, price } = dateObj;
    const dateYr = date.slice(0, 4);
    const dateMth = date.slice(5, 7);
    const dateDay = date.slice(8);

    if (dateArr.indexOf(date) === -1) {
      dateArr.push(date);
      salesArr.push([new Date(dateYr, dateMth - 1, dateDay), price]);
    } else {
      // update the price
      salesArr.forEach((sales) => {
        if (sales[0].toString() === new Date(dateYr, dateMth - 1, dateDay).toString()) {
          sales[1] += price;
        }
      });
    }
  });
  const dataTable = new google.visualization.DataTable();
  dataTable.addColumn({ type: 'date', id: 'Date' });
  dataTable.addColumn({ type: 'number', id: 'Price' });
  dataTable.addRows(salesArr);

  const chart = new google.visualization.Calendar(document.getElementById('calendarChart'));

  const options = {
    title: 'Daily Sales Performance',
    calendar: {
      monthOutlineColor: {
        stroke: 'goldenrod',
        strokeOpacity: 0.8,
        strokeWidth: 2,
      },
    },
    colorAxis: { colors: ['red', 'greenyellow'] },
  };
  chart.draw(dataTable, options);
}

const chartErr = document.getElementById('chartErr');
function drawLineChart() {
  const fromYr = document.getElementById('fromYr').value;
  const fromMonth = document.getElementById('fromMonth').value;
  const fromDay = document.getElementById('fromDay').value;

  const toYr = document.getElementById('toYr').value;
  const toMonth = document.getElementById('toMonth').value;
  const toDay = document.getElementById('toDay').value;

  const datesArr = [];

  if (Number(fromYr) > Number(toYr)) {
    chartErr.innerHTML = 'Invalid date range (check Year)';
    return;
  }
  if ((Number(fromYr) <= Number(toYr)) && (Number(fromMonth) > Number(toMonth))) {
    chartErr.innerHTML = 'Invalid date range (check Month)';
    return;
  }
  if ((Number(fromMonth) <= Number(toMonth)) && (Number(fromDay) > Number(toDay))) {
    chartErr.innerHTML = 'Invalid date range (check Day)';
    return;
  }

  const salesArr = [['Date', 'Sales']];
  datesObjArr.forEach((dateObj) => {
    const { date, price } = dateObj;
    const dateYr = date.slice(0, 4);
    const dateMth = date.slice(5, 7);
    const dateDay = date.slice(8);

    // Concat yr, month and day and calculate (from 2017-10 to 2018-03) = (20171021 to 20180301)
    if (Number(`${dateYr}${dateMth}${dateDay}`) >= Number(`${fromYr}${fromMonth}${fromDay}`)
    && Number(`${dateYr}${dateMth}${dateDay}`) <= Number(`${toYr}${toMonth}${toDay}`)) {
      if (datesArr.indexOf(date) === -1) {
        datesArr.push(date);
        salesArr.push([date, price]);
      } else {
        // update the price
        salesArr.forEach((sales) => {
          if (sales[0] === date) {
            sales[1] += price;
          }
        });
      }
    }
  });

  if (salesArr.length === 1) {
    chartErr.innerHTML = 'Sorry no sales were found within the selected period';
    return;
  }
  chartErr.innerHTML = '';
  const options = {
    width: 950,
    title: 'Sales Performance Overview',
    crosshair: { trigger: 'both', color: 'black', opacity: 0.3 },
    hAxis: {
      title: 'Dates',
      gridlines: { count: 7 },
    },
    vAxis: {
      title: 'Sales',
      gridlines: { count: 4 },
    },
    selectionMode: 'multiple',
    tooltip: { showColorCode: true },
  };
  const data = google.visualization.arrayToDataTable(salesArr);
  const chart = new google.visualization.ScatterChart(document.getElementById('salesGraph'));

  chart.draw(data, options);
}

google.charts.setOnLoadCallback(drawLineChart);

document.getElementById('plotBtn').onclick = () => {
  google.charts.setOnLoadCallback(drawLineChart);
};

google.charts.setOnLoadCallback(drawCalendarChart);
google.charts.setOnLoadCallback(drawPieChart);
