/* eslint-disable no-param-reassign */
document.addEventListener('DOMContentLoaded', () => {
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

  // POPULATE DATE FIELDS
  const selFromYr = document.getElementById('fromYr');
  const selFromMonth = document.getElementById('fromMonth');
  const selFromDay = document.getElementById('fromDay');

  const selToYr = document.getElementById('toYr');
  const selToMonth = document.getElementById('toMonth');
  const selToDay = document.getElementById('toDay');

  const dateNow = new Date().toISOString();

  selToYr.value = dateNow.slice(0, 4);
  selFromYr.value = dateNow.slice(0, 4);
  selToMonth.value = dateNow.slice(5, 7);

  function getLastMthDay(yr, valMonth) {
    let lastDay = 31;
    if (Number(yr) % 4 === 0 && valMonth === '02') {
      lastDay = 29;
    } else if (valMonth === '02') {
      lastDay = 28;
    } else if (valMonth === '04' || valMonth === '06' || valMonth === '09' || valMonth === '11') {
      lastDay = 30;
    }
    return lastDay;
  }

  function populateDays(yr, valMonth, id) {
    const select = document.getElementById(id);
    if (select.childElementCount > 0) {
      for (let i = select.childElementCount - 1; i >= 0; i -= 1) {
        select.removeChild(select.children[i]);
      }
    }
    const lastDay = getLastMthDay(yr, valMonth);

    for (let i = 1; i <= lastDay; i += 1) {
      const option = document.createElement('option');
      if (i < 10) {
        option.value = `0${i}`;
        option.innerHTML = `0${i}`;
      } else {
        option.value = `${i}`;
        option.innerHTML = `${i}`;
      }
      select.appendChild(option);
    }
  }
  populateDays(selFromYr.value, selFromMonth.value, 'fromDay');
  populateDays(selToYr.value, selToMonth.value, 'toDay');

  // load day
  selToDay.value = dateNow.slice(8, 10);

  selFromYr.onchange = () => {
    populateDays(selFromYr.value, selFromMonth.value, 'fromDay');
  };
  selToYr.onchange = () => {
    populateDays(selFromYr.value, selFromMonth.value, 'fromDay');
  };
  selFromMonth.onchange = () => {
    populateDays(selFromYr.value, selFromMonth.value, 'fromDay');
  };
  selToMonth.onchange = () => {
    populateDays(selToYr.value, selToMonth.value, 'toDay');
  };

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
      title: 'Orders Statistics', is3D: true,
    };
    const ordersChart = new google.visualization.PieChart(document.getElementById('ordersChart'));
    ordersChart.draw(ordersData, ordersOptions);

    // DRAw MENU PIE CHART
    getMenu.then((menu) => {
      const menuData = google.visualization.arrayToDataTable(menu);
      const menuChart = new google.visualization.PieChart(document.getElementById('menuChart'));
      const menuOptions = {
        title: 'Menu Statistics', is3D: true,
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
      width: 950,
      calendar: {
        monthOutlineColor: {
          stroke: 'goldenrod',
          strokeOpacity: 0.8,
          strokeWidth: 2,
        },
      },
      // colorAxis: { colors: ['red', 'greenyellow'] },
    };
    chart.draw(dataTable, options);
  }

  // DRAW BAR CHART
  function drawBarChart(dataArr, title) {
    const data = google.visualization.arrayToDataTable(dataArr);

    const view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
      {
        calc: 'stringify',
        sourceColumn: 1,
        type: 'string',
        role: 'annotation',
      }, 2]);

    const options = {
      title: title[0],
      // bar: { groupWidth: '95%' },
      legend: { position: 'none' },
      hAxis: {
        title: title[1],
      },
      vAxis: {
        title: 'Sales',
        // gridlines: { count: 5 },
      },
    };
    const chart = new google.visualization.ColumnChart(document.getElementById('salesGraph'));
    chart.draw(view, options);
  }

  function getWkRange(date) {
    const wkDay = new Date(date).getDay();
    if (wkDay === 0) {
      const range = `${Number(date.slice(-2)) + 6}/${date.slice(5)}-${date.slice(5, 7)}`;
      return range;
    }
    return getWkRange(`${date.slice(0, 8)}${Number(date.slice(-2)) - 1}`);
  }

  // DRAW LINE CHART
  const chartErr = document.getElementById('chartErr');
  function drawLineChart() {
    const fromYr = selFromYr.value;
    const fromMonth = selFromMonth.value;
    const fromDay = selFromDay.value;

    const toYr = selToYr.value;
    const toMonth = selToMonth.value;
    const toDay = selToDay.value;

    const datesArr = [];
    const yrsArr = [];
    const mthsArr = [];
    const wkRangeArr = [];

    if (Number(fromYr) > Number(toYr)) {
      chartErr.innerHTML = 'Invalid date range (check Year)';
      return;
    }
    if ((Number(fromYr) === Number(toYr)) && (Number(fromMonth) > Number(toMonth))) {
      chartErr.innerHTML = 'Invalid date range (check Month)';
      return;
    }
    if ((Number(fromMonth) === Number(toMonth)) && (Number(fromDay) > Number(toDay))) {
      chartErr.innerHTML = 'Invalid date range (check Day)';
      return;
    }

    const freq = document.getElementById('freq').value;

    const yrArr = [['Years', 'Sales', { role: 'style' }]];
    const mthArr = [['Months', 'Sales', { role: 'style' }]];
    const wkArr = [['Weeks', 'Sales', { role: 'style' }]];
    const salesArr = [['Date', 'Sales']];

    let wkErr = '';
    const maxRangeMsg = document.getElementById('maxRange');

    datesObjArr.forEach((dateObj) => {
      const { date, price } = dateObj;
      const dateYr = date.slice(0, 4);
      const dateMth = date.slice(5, 7);
      const mth = new Date(date).toString().slice(4, 7);
      const dateDay = date.slice(8);

      // Concat yr, month and day and calculate (from 2017-10 to 2018-03) = (20171021 to 20180301)
      if (Number(`${dateYr}${dateMth}${dateDay}`) >= Number(`${fromYr}${fromMonth}${fromDay}`)
      && Number(`${dateYr}${dateMth}${dateDay}`) <= Number(`${toYr}${toMonth}${toDay}`)) {
        if (freq === 'yearly') {
          if (yrsArr.indexOf(dateYr) === -1) {
            yrsArr.push(dateYr);
            yrArr.push([dateYr, price, 'stroke-color: goldenrod; stroke-width: 2']);
          } else {
            // update the price
            yrArr.forEach((sale) => {
              if (sale[0] === dateYr) {
                sale[1] += price;
              }
            });
          }
        }
        if (freq === 'monthly') {
          if (mthsArr.indexOf(mth) === -1) {
            mthsArr.push(mth);
            mthArr.push([mth, price, 'stroke-color: goldenrod; stroke-width: 2']);
          } else {
            // update the price
            mthArr.forEach((sales) => {
              if (sales[0] === mth) {
                sales[1] += price;
              }
            });
          }
        }

        const wkRange = getWkRange(`${dateYr}/${dateMth}/${dateDay}`);
        if (freq === 'weekly') {
          chartErr.innerHTML = '';
          // Only 3 months range allowed
          const lastMthDay = getLastMthDay(dateYr, fromMonth);
          let numToMonth = (Number(toYr) - Number(fromYr)) * 12 + Number(toMonth);
          let diffD = (Number(toDay) - Number(fromDay));
          if (fromMonth !== toMonth || (fromMonth === toMonth && fromYr !== toYr)) {
            diffD += Number(lastMthDay);
          }

          if (numToMonth - Number(fromMonth) > 1) {
            for (let i = Number(fromMonth) + 1; i < numToMonth; i += 1) {
              if (i > 12) {
                i = 1;
                numToMonth -= 12;
              }
              diffD += getLastMthDay(dateYr, `0${i}`);
            }
          }
          if (diffD > 90) {
            wkErr = 'Sorry max range of 90 days allowed';
            return;
          }

          // if (((Number(toYr) - Number(fromYr)) * 365 + (Number(toMonth) - Number(fromMonth)) * getLastMthDay(fromYr, fromMonth) + Number(toDay) - Number(fromDay)) > 90) {
          // console.log('days:', ((Number(toYr) - Number(fromYr)) * 365 + (Number(toMonth) - Number(fromMonth)) * getLastMthDay(fromYr, fromMonth) + Number(toDay) - Number(fromDay)));
          //   wkErr = 'Sorry max range of 90 days allowed';
          //   return;
          // }
          if (wkRangeArr.indexOf(wkRange) === -1) {
            wkRangeArr.push(wkRange);
            wkArr.push([wkRange, price, 'stroke-color: goldenrod; stroke-width: 2']);
          } else {
            // update price
            wkArr.forEach((wk) => {
              if (wk[0] === wkRange) {
                wk[1] += price;
              }
            });
          }
        }
        if (freq === 'daily') {
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
      }
    });

    if (wkArr.length === 1 && wkErr === 'Sorry max range of 90 days allowed') {
      chartErr.innerHTML = wkErr;
      return;
    }
    if (yrArr.length === 1 && mthArr.length === 1 && wkArr.length === 1 && salesArr.length === 1) {
      chartErr.innerHTML = 'Sorry no sales were found within the selected period';
      return;
    }

    if (freq === 'yearly') {
      chartErr.innerHTML = '';
      maxRangeMsg.innerHTML = '';
      drawBarChart(yrArr, ['Yearly Sales Comparison', 'Years']);
      return;
    }
    if (freq === 'monthly') {
      chartErr.innerHTML = '';
      maxRangeMsg.innerHTML = '';
      drawBarChart(mthArr, ['Monthly Sales Comparison', 'Months']);
      return;
    }
    if (freq === 'weekly') {
      chartErr.innerHTML = '';
      drawBarChart(wkArr, ['Weekly Sales Comparison', 'Weeks']);
      return;
    }

    maxRangeMsg.innerHTML = '';
    chartErr.innerHTML = '<span style="color: green">Please see daily sales performance chart above for a more detailed overview</span>';
    const options = {
      // width: 950,
      title: 'Sales Performance Overview',
      // colors: ['goldenrod'],
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

  google.charts.setOnLoadCallback(drawPieChart);
  google.charts.setOnLoadCallback(drawCalendarChart);
  google.charts.setOnLoadCallback(drawLineChart);

  document.getElementById('plotBtn').onclick = () => {
    google.charts.setOnLoadCallback(drawLineChart);
  };

  document.getElementById('freq').onchange = () => {
    if (document.getElementById('freq').value === 'weekly') {
      document.getElementById('maxRange').innerHTML = '<i>90 days max.</i>';
    } else {
      document.getElementById('maxRange').innerHTML = '';
    }
  };
});
