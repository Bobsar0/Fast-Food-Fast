// Load google charts
google.charts.load('current', { packages: ['corechart', 'bar'] });
// google.charts.load('current', {'packages':['bar']});

google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values
function drawChart() {
  const ordersData = google.visualization.arrayToDataTable([
    ['Task', 'Hours per Day'],
    ['New', 8],
    ['Processing', 2],
    ['Cancelled', 2],
    ['Complete', 2],
  ]);

  const menuData = google.visualization.arrayToDataTable([
    ['Task', 'Hours per Day'],
    ['Meal', 8],
    ['Drinks', 2],
    ['Side/Snacks', 2],
    ['Combo', 2],
    ['Dessert', 2]
  ]);

  const salesData = google.visualization.arrayToDataTable([
    ['Year', 'TotalSales', 'Meal', 'Snacks', 'Drinks', 'Combo', 'Desserts' ],
    ['2014', 1000, 400, 200, 3,4,5],
    ['2015', 1170, 460, 250, 55,55,66],
    ['2016', 660, 1120, 300,44,5,6],
    ['2017', 1030, 540, 350, 44, 5,6]
  ]);

  // Optional; add a title and set the width and height of the chart
  const ordersOptions = {
    title: 'Orders Statistics', is3D: true, width: 400, height: 250,
  };
  const menuOptions = {
    title: 'Menu Statistics', is3D: true, width: 400, height: 250,
  };

  const salesOptions = {
    chart: {
      title: 'Company Performance',
      subtitle: 'Sales across all Food genres: 2014-2017',
    },
  };
  // Display the chart inside the <div> element with id="piechart"
  const ordersChart = new google.visualization.PieChart(document.getElementById('ordersChart'));
  const menuChart = new google.visualization.PieChart(document.getElementById('menuChart'));
  const salesChart = new google.charts.Bar(document.getElementById('salesGraph'));

  ordersChart.draw(ordersData, ordersOptions);
  menuChart.draw(menuData, menuOptions);
  salesChart.draw(salesData, google.charts.Bar.convertOptions(salesOptions));
}
