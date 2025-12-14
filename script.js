// Configuration
const CONFIG = {
  apiKey: "8d087730b4748edf0c9813337ab7a0f6", // Consider moving to environment variables
  city: "Chennai",
  refreshInterval: 300000 // 5 minutes
};

// Sales data with temperature correlation
const salesData = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  sales: [120, 150, 170, 200, 230, 300, 280],
  temperatures: [28, 31, 33, 35, 37, 39, 36] // Simulated correlation
};

// Weather icons mapping
const weatherIcons = {
  'clear sky': '☀️',
  'few clouds': '🌤️',
  'scattered clouds': '⛅',
  'broken clouds': '☁️',
  'shower rain': '🌦️',
  'rain': '🌧️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️'
};

// Fetch weather data with error handling
async function fetchWeatherData() {
  const tempElement = document.getElementById("temp");
  const weatherIcon = document.getElementById("weatherIcon");
  const weatherDesc = document.getElementById("weatherDesc");
  
  try {
    tempElement.textContent = "Loading temperature...";
    tempElement.className = "temp-display loading";
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.city}&appid=${CONFIG.apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update temperature display
    tempElement.textContent = `${Math.round(data.main.temp)}°C in ${CONFIG.city}`;
    tempElement.className = "temp-display";
    
    // Update weather icon
    const description = data.weather[0].description.toLowerCase();
    weatherIcon.textContent = weatherIcons[description] || '🌤️';
    
    // Update weather description
    weatherDesc.textContent = `${data.weather[0].description} • Feels like ${Math.round(data.main.feels_like)}°C`;
    
    // Update sales data based on temperature (simulation)
    updateSalesBasedOnWeather(data.main.temp);
    
  } catch (error) {
    console.error("Error fetching weather data:", error);
    tempElement.textContent = "Unable to load weather data";
    tempElement.className = "temp-display error";
    weatherDesc.textContent = "Please check your internet connection";
  }
}

// Simulate sales correlation with weather
function updateSalesBasedOnWeather(currentTemp) {
  // Adjust sales based on temperature (higher temp = more sales)
  const tempFactor = Math.max(0.5, Math.min(1.5, currentTemp / 30));
  const adjustedSales = salesData.sales.map(sale => Math.round(sale * tempFactor));
  
  // Update chart with new data
  if (window.salesChart) {
    window.salesChart.data.datasets[0].data = adjustedSales;
    window.salesChart.update();
  }
  
  // Update statistics
  updateStatistics(adjustedSales);
}

// Calculate and display statistics
function updateStatistics(sales) {
  const total = sales.reduce((sum, sale) => sum + sale, 0);
  const average = Math.round(total / sales.length);
  const maxSale = Math.max(...sales);
  const bestDayIndex = sales.indexOf(maxSale);
  const bestDay = salesData.days[bestDayIndex];
  
  document.getElementById("totalSales").textContent = total;
  document.getElementById("avgSales").textContent = average;
  document.getElementById("bestDay").textContent = bestDay.substring(0, 3);
}

// Create enhanced chart
function createSalesChart() {
  const ctx = document.getElementById("salesChart").getContext("2d");
  
  window.salesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: salesData.days,
      datasets: [{
        label: "Ice Cream Sales (units)",
        data: salesData.sales,
        backgroundColor: [
          '#ff7675', '#fd79a8', '#fdcb6e', '#6c5ce7', 
          '#74b9ff', '#00b894', '#e17055'
        ],
        borderColor: '#2d3436',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: '#74b9ff',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `Sales: ${context.parsed.y} units`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

// Initialize dashboard
function initDashboard() {
  createSalesChart();
  fetchWeatherData();
  updateStatistics(salesData.sales);
  
  // Set up periodic weather updates
  setInterval(fetchWeatherData, CONFIG.refreshInterval);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);