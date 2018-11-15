// Load google charts
google.charts.load('current', { packages: ['corechart'] });
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

  // Optional; add a title and set the width and height of the chart
  const ordersOptions = {
    title: 'Orders Statistics', is3D: true, width: 400, height: 250,
  };
  const menuOptions = {
    title: 'Menu Statistics', is3D: true, width: 400, height: 250,
  };

  // Display the chart inside the <div> element with id="piechart"
  const ordersChart = new google.visualization.PieChart(document.getElementById('ordersChart'));
  const menuChart = new google.visualization.PieChart(document.getElementById('menuChart'));
  ordersChart.draw(ordersData, ordersOptions);
  menuChart.draw(menuData, menuOptions);
}
