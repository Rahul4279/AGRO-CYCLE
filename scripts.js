
// Current year for footer copyright
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const currentYearElements = document.querySelectorAll('#currentYear');
    currentYearElements.forEach(element => {
      element.textContent = new Date().getFullYear();
    });
  
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
  
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  
    // Reveal animation on scroll
    function reveal() {
      const reveals = document.querySelectorAll('.reveal');
      
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        }
      }
    }
  
    window.addEventListener('scroll', reveal);
    // Trigger on page load
    reveal();
  
    // Toast Notification System
    const toastContainer = document.getElementById('toastContainer');
  
    window.showToast = function(type, title, message) {
      if (!toastContainer) return;
  
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
  
      let iconSvg = '';
      if (type === 'success') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7CB342" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      } else if (type === 'error') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      } else {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64B5F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      }
  
      toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-description">${message}</div>
        </div>
        <button class="toast-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
  
      toastContainer.appendChild(toast);
      
      // Trigger reflow to enable transitions
      toast.offsetHeight;
      
      // Show toast
      setTimeout(() => {
        toast.classList.add('active');
      }, 10);
  
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeToast(toast);
      }, 5000);
  
      // Close button event
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        removeToast(toast);
      });
    }
  
    function removeToast(toast) {
      toast.classList.remove('active');
      
      // Wait for transition to finish before removing
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  
    // Handle Data Input Form
    const cropDataForm = document.getElementById('cropDataForm');
    if (cropDataForm) {
      const submitBtn = document.getElementById('submitBtn');
  
      cropDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
  
        // Basic form validation
        const requiredFields = [
          'temperature', 'rainfall', 'humidity', 'soilPh', 
          'nitrogen', 'phosphorus', 'potassium', 'cropType'
        ];
        
        let missingFields = false;
        
        for (const field of requiredFields) {
          const input = document.getElementById(field);
          if (!input.value.trim()) {
            missingFields = true;
            input.style.borderColor = '#e53935';
            
            // Reset border on input
            input.addEventListener('input', function() {
              this.style.borderColor = '';
            }, { once: true });
          }
        }
        
        if (missingFields) {
          showToast('error', 'Please fill in all required fields', 'The fields marked with * are required.');
          return;
        }
        
        // Gather form data
        const formData = new FormData(cropDataForm);
        const data = Object.fromEntries(formData.entries());
        
        // Store in localStorage
        localStorage.setItem('cropData', JSON.stringify(data));
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span>Processing...';
        
        // Simulate API call delay
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Generate Prediction <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
          
          showToast('success', 'Data processed successfully', 'Redirecting to results page...');
          
          // Redirect to results page after a short delay
          setTimeout(() => {
            window.location.href = 'results.html';
          }, 1000);
        }, 1500);
      });
  
      // Reset validation styling on input change
      const inputs = document.querySelectorAll('.form-input');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.style.borderColor = '';
        });
      });
    }
  
    // Results Page Logic
    const resultsContent = document.getElementById('resultsContent');
    const loadingContainer = document.getElementById('loadingContainer');
    const noDataMessage = document.getElementById('noDataMessage');
  
    if (resultsContent && loadingContainer && noDataMessage) {
      const cropData = localStorage.getItem('cropData');
  
      if (!cropData) {
        // No data available
        loadingContainer.style.display = 'none';
        noDataMessage.style.display = 'block';
      } else {
        // Simulate loading
        setTimeout(() => {
          loadingContainer.style.display = 'none';
          resultsContent.style.display = 'block';
          
          // Generate prediction results
          generatePredictionResults(JSON.parse(cropData));
        }, 1500);
      }
    }
  
    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitContactBtn');
        const originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span>Sending...';
        
        // Simulate form submission
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          showToast('success', 'Message Sent', 'Thank you for your message. We will get back to you soon!');
          
          // Reset form
          contactForm.reset();
        }, 1500);
      });
    }
  
    // Tab switching in the insights page
    const chartTabs = document.getElementById('chartTabs');
    if (chartTabs) {
      const tabButtons = chartTabs.querySelectorAll('.tab-button');
      
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all buttons and panes
          tabButtons.forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
          
          // Add active class to clicked button and corresponding pane
          button.classList.add('active');
          const tabId = button.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
        });
      });
    }
  
    // Insights Page Logic
    const insightsContent = document.getElementById('insightsContent');
    const insightsLoadingContainer = document.getElementById('insightsLoadingContainer');
    const insightsNoDataMessage = document.getElementById('insightsNoDataMessage');
  
    if (insightsContent && insightsLoadingContainer && insightsNoDataMessage) {
      const cropData = localStorage.getItem('cropData');
  
      if (!cropData) {
        // No data available
        insightsLoadingContainer.style.display = 'none';
        insightsNoDataMessage.style.display = 'block';
      } else {
        // Simulate loading
        setTimeout(() => {
          insightsLoadingContainer.style.display = 'none';
          insightsContent.style.display = 'block';
          
          // Generate insights
          generateInsights(JSON.parse(cropData));
        }, 1500);
      }
    }
  });
  
  // Function to generate prediction results
  function generatePredictionResults(data) {
    // Mock prediction algorithm based on input data
    // In a real application, this would call a backend API
    
    const cropFactors = {
      rice: { baseYield: 4200, tempFactor: 50, rainFactor: 15, phFactor: 300, nFactor: 8, pFactor: 10, kFactor: 6 },
      wheat: { baseYield: 3800, tempFactor: 40, rainFactor: 10, phFactor: 250, nFactor: 7, pFactor: 8, kFactor: 5 },
      maize: { baseYield: 5500, tempFactor: 60, rainFactor: 12, phFactor: 200, nFactor: 9, pFactor: 7, kFactor: 8 },
      cotton: { baseYield: 2800, tempFactor: 70, rainFactor: 8, phFactor: 150, nFactor: 6, pFactor: 9, kFactor: 7 },
      sugarcane: { baseYield: 70000, tempFactor: 100, rainFactor: 25, phFactor: 500, nFactor: 15, pFactor: 12, kFactor: 10 },
      pulses: { baseYield: 1800, tempFactor: 30, rainFactor: 7, phFactor: 100, nFactor: 5, pFactor: 6, kFactor: 4 },
      vegetables: { baseYield: 25000, tempFactor: 80, rainFactor: 20, phFactor: 350, nFactor: 10, pFactor: 11, kFactor: 9 }
    };
    
    const cropType = data.cropType || 'rice';
    const factors = cropFactors[cropType];
    
    // Calculate yield based on input factors
    let predictedYield = factors.baseYield;
    
    // Temperature impact
    const optimalTemp = cropType === 'rice' || cropType === 'sugarcane' ? 30 : 25;
    const tempDiff = Math.abs(parseFloat(data.temperature) - optimalTemp);
    predictedYield -= tempDiff * factors.tempFactor;
    
    // Rainfall impact
    const optimalRain = cropType === 'rice' ? 200 : 150;
    const rainDiff = Math.abs(parseFloat(data.rainfall) - optimalRain);
    predictedYield -= rainDiff * factors.rainFactor;
    
    // Soil pH impact
    const optimalPh = 6.5;
    const phDiff = Math.abs(parseFloat(data.soilPh) - optimalPh);
    predictedYield -= phDiff * factors.phFactor;
    
    // Nutrient impact - positive effect
    predictedYield += parseFloat(data.nitrogen) * factors.nFactor;
    predictedYield += parseFloat(data.phosphorus) * factors.pFactor;
    predictedYield += parseFloat(data.potassium) * factors.kFactor;
    
    // Ensure yield doesn't go below minimum threshold
    const minYield = factors.baseYield * 0.4;
    predictedYield = Math.max(predictedYield, minYield);
    
    // Round to nearest 10
    predictedYield = Math.round(predictedYield / 10) * 10;
    
    // Calculate confidence based on completeness of data
    let confidenceScore = 70; // Base confidence
    if (data.previousYield) confidenceScore += 10;
    if (data.growthStage) confidenceScore += 5;
    if (data.plantingDate) confidenceScore += 5;
    if (data.windSpeed) confidenceScore += 5;
    
    // Limited to 95% max confidence
    confidenceScore = Math.min(confidenceScore, 95);
    
    // Calculate yield range (wider range for lower confidence)
    const rangePercent = (100 - confidenceScore) / 100;
    const rangeDiff = predictedYield * rangePercent;
    const lowRange = Math.round((predictedYield - rangeDiff) / 10) * 10;
    const highRange = Math.round((predictedYield + rangeDiff) / 10) * 10;
    
    // Update UI with prediction result
    document.getElementById('yieldValue').textContent = predictedYield.toLocaleString();
    document.getElementById('yieldRange').textContent = `${lowRange.toLocaleString()} - ${highRange.toLocaleString()} kg/ha`;
    
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceValue = document.getElementById('confidenceValue');
    
    // Animate confidence bar
    setTimeout(() => {
      confidenceFill.style.width = `${confidenceScore}%`;
      confidenceValue.textContent = `${confidenceScore}%`;
    }, 300);
    
    // Generate impact factors
    generateImpactFactors(data, predictedYield);
    
    // Generate recommendations
    generateRecommendations(data, predictedYield);
  }
  
  // Function to generate impact factors
  function generateImpactFactors(data, predictedYield) {
    const factorsList = document.getElementById('factorsList');
    if (!factorsList) return;
    
    factorsList.innerHTML = '';
    
    // Temperature factor
    const tempFactor = {
      title: 'Temperature',
      value: `${data.temperature}°C`,
      impact: 'neutral',
      description: 'Temperature is within optimal range.'
    };
    
    if (data.temperature > 35) {
      tempFactor.impact = 'negative';
      tempFactor.description = 'Temperature is too high for optimal growth.';
    } else if (data.temperature < 18) {
      tempFactor.impact = 'negative';
      tempFactor.description = 'Temperature is too low for optimal growth.';
    } else if (data.temperature >= 25 && data.temperature <= 30) {
      tempFactor.impact = 'positive';
      tempFactor.description = 'Temperature is in the ideal range for crop growth.';
    }
    
    // Rainfall factor
    const rainfallFactor = {
      title: 'Rainfall',
      value: `${data.rainfall} mm`,
      impact: 'neutral',
      description: 'Rainfall is adequate for crop growth.'
    };
    
    if (data.rainfall > 250) {
      rainfallFactor.impact = 'negative';
      rainfallFactor.description = 'Excess rainfall may lead to waterlogging.';
    } else if (data.rainfall < 60) {
      rainfallFactor.impact = 'negative';
      rainfallFactor.description = 'Insufficient rainfall may restrict growth.';
    } else if (data.rainfall >= 120 && data.rainfall <= 180) {
      rainfallFactor.impact = 'positive';
      rainfallFactor.description = 'Optimal rainfall for healthy crop development.';
    }
    
    // Soil Health factor
    let nutrientLevel = parseInt(data.nitrogen) + parseInt(data.phosphorus) + parseInt(data.potassium);
    const soilFactor = {
      title: 'Soil Nutrients',
      value: `N: ${data.nitrogen}, P: ${data.phosphorus}, K: ${data.potassium}`,
      impact: 'neutral',
      description: 'Average nutrient levels in soil.'
    };
    
    if (nutrientLevel > 300) {
      soilFactor.impact = 'positive';
      soilFactor.description = 'Excellent nutrient levels for robust growth.';
    } else if (nutrientLevel < 120) {
      soilFactor.impact = 'negative';
      soilFactor.description = 'Low nutrient levels may limit yield potential.';
    }
    
    // pH factor
    const phFactor = {
      title: 'Soil pH',
      value: data.soilPh,
      impact: 'neutral',
      description: 'Soil pH is acceptable for crop growth.'
    };
    
    if (data.soilPh < 5.5) {
      phFactor.impact = 'negative';
      phFactor.description = 'Soil is too acidic for optimal nutrient uptake.';
    } else if (data.soilPh > 7.5) {
      phFactor.impact = 'negative';
      phFactor.description = 'Alkaline soil may restrict availability of some nutrients.';
    } else if (data.soilPh >= 6.2 && data.soilPh <= 6.8) {
      phFactor.impact = 'positive';
      phFactor.description = 'Ideal pH range for nutrient availability.';
    }
    
    // Add factors to the list
    const factors = [tempFactor, rainfallFactor, soilFactor, phFactor];
    
    factors.forEach(factor => {
      const factorHtml = `
        <div class="factor-item">
          <div class="factor-icon ${factor.impact}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${factor.impact === 'positive' 
                ? '<path d="m6 15 6-6 6 6"/>'
                : factor.impact === 'negative'
                  ? '<path d="m6 9 6 6 6-6"/>'
                  : '<path d="M8 12h8"/>'}
            </svg>
          </div>
          <div class="factor-content">
            <div class="factor-title">${factor.title}: ${factor.value}</div>
            <div class="factor-description">${factor.description}</div>
          </div>
        </div>
      `;
      
      factorsList.innerHTML += factorHtml;
    });
  }
  
  // Function to generate recommendations
  function generateRecommendations(data, predictedYield) {
    const recommendationsList = document.getElementById('recommendationsList');
    if (!recommendationsList) return;
    
    recommendationsList.innerHTML = '';
    
    const recommendations = [];
    
    // Temperature-based recommendations
    if (data.temperature > 35) {
      recommendations.push({
        title: 'Manage High Temperature',
        description: 'Consider shade cloth or increased irrigation to mitigate heat stress on crops.'
      });
    } else if (data.temperature < 18) {
      recommendations.push({
        title: 'Address Low Temperature',
        description: 'Consider using row covers or mulch to increase soil temperature and protect crops.'
      });
    }
    
    // Rainfall-based recommendations
    if (data.rainfall > 250) {
      recommendations.push({
        title: 'Improve Drainage',
        description: 'Implement drainage channels or raised beds to prevent waterlogging and root rot.'
      });
    } else if (data.rainfall < 60) {
      recommendations.push({
        title: 'Enhance Irrigation',
        description: 'Increase irrigation frequency and consider drip irrigation for water efficiency.'
      });
    }
    
    // Soil nutrient recommendations
    const nitrogen = parseInt(data.nitrogen);
    const phosphorus = parseInt(data.phosphorus);
    const potassium = parseInt(data.potassium);
    
    if (nitrogen < 60) {
      recommendations.push({
        title: 'Increase Nitrogen Input',
        description: 'Apply nitrogen-rich fertilizers or incorporate leguminous cover crops in your rotation.'
      });
    }
    
    if (phosphorus < 30) {
      recommendations.push({
        title: 'Boost Phosphorus Levels',
        description: 'Apply phosphate fertilizers or organic amendments like bone meal to support root development.'
      });
    }
    
    if (potassium < 40) {
      recommendations.push({
        title: 'Address Potassium Deficiency',
        description: 'Add potassium-rich fertilizers or organic matter like wood ash to improve crop resilience.'
      });
    }
    
    // pH recommendations
    if (parseFloat(data.soilPh) < 5.5) {
      recommendations.push({
        title: 'Correct Soil Acidity',
        description: 'Apply agricultural lime to raise pH and improve nutrient availability.'
      });
    } else if (parseFloat(data.soilPh) > 7.5) {
      recommendations.push({
        title: 'Address Alkaline Soil',
        description: 'Consider adding organic matter or sulfur-based amendments to lower pH gradually.'
      });
    }
    
    // General recommendation
    recommendations.push({
      title: 'Regular Monitoring',
      description: 'Monitor crop development regularly and adjust management practices based on growth stage and weather conditions.'
    });
    
    // Add recommendations to the list
    if (recommendations.length === 0) {
      recommendationsList.innerHTML = '<p>No specific recommendations needed. Your current practices are well-suited for optimal yield.</p>';
    } else {
      recommendations.forEach(rec => {
        const recHtml = `
          <div class="recommendation-item">
            <div class="recommendation-content">
              <div class="recommendation-title">${rec.title}</div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          </div>
        `;
        
        recommendationsList.innerHTML += recHtml;
      });
    }
  }
  
  // Function to generate insights and charts
  function generateInsights(data) {
    // Set insights text content
    document.getElementById('weatherInsight').textContent = generateWeatherInsight(data);
    document.getElementById('soilInsight').textContent = generateSoilInsight(data);
    document.getElementById('growthInsight').textContent = generateGrowthInsight(data);
    document.getElementById('yieldInsight').textContent = generateYieldInsight(data);
    
    // Generate timeline recommendations
    generateTimelineRecommendations(data);
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
      // Initialize weather impact chart
      initWeatherImpactChart(data);
      
      // Initialize soil nutrients chart
      initSoilNutrientsChart(data);
      
      // Initialize yield comparison chart
      initYieldComparisonChart(data);
      
      // Initialize growth trend chart
      initGrowthTrendChart(data);
    }
  }
  
  // Generate weather insight
  function generateWeatherInsight(data) {
    const temp = parseFloat(data.temperature);
    const rainfall = parseFloat(data.rainfall);
    
    if (temp > 30 && rainfall < 100) {
      return "High temperature combined with low rainfall may cause water stress. Consider irrigation adjustments and heat-tolerant varieties.";
    } else if (temp < 20 && rainfall > 200) {
      return "Cool, wet conditions may slow growth and increase disease risk. Monitor for fungal pathogens and ensure good drainage.";
    } else if (temp >= 22 && temp <= 28 && rainfall >= 100 && rainfall <= 200) {
      return "Current weather conditions are favorable for crop development. Maintain regular monitoring for optimal management.";
    } else {
      return "Weather conditions require moderate adjustments to irrigation and crop protection strategies for optimal growth.";
    }
  }
  
  // Generate soil insight
  function generateSoilInsight(data) {
    const ph = parseFloat(data.soilPh);
    const n = parseInt(data.nitrogen);
    const p = parseInt(data.phosphorus);
    const k = parseInt(data.potassium);
    
    if (ph < 5.8 || ph > 7.2) {
      return "Soil pH is outside optimal range. Consider pH adjustment to improve nutrient availability and uptake efficiency.";
    } else if (n < 50 || p < 25 || k < 30) {
      return "One or more soil nutrients are below recommended levels. Targeted fertilization will help address specific deficiencies.";
    } else if (n > 150 && p > 80 && k > 120) {
      return "Nutrient levels are above optimal range. Reduce fertilization to prevent nutrient runoff and potential toxicity.";
    } else {
      return "Soil nutrient balance is generally good. Maintain current fertilization program with minor adjustments based on crop stage.";
    }
  }
  
  // Generate growth insight
  function generateGrowthInsight(data) {
    const cropType = data.cropType || 'rice';
    const growthStage = data.growthStage || 'vegetative';
    
    const insights = {
      rice: {
        seedling: "Focus on establishing adequate plant population. Maintain shallow water depth for optimal seedling development.",
        vegetative: "Ensure consistent water supply and monitor for pests. Mid-season nitrogen application is critical at this stage.",
        flowering: "Maintain stable water levels. Avoid water stress and apply protective fungicides if conditions favor disease.",
        "fruit-development": "Maintain optimal water depth. Monitor for pests that target developing grains.",
        maturity: "Begin reducing water levels. Prepare harvesting equipment for optimal timing."
      },
      wheat: {
        seedling: "Ensure proper seed depth and adequate soil moisture. Scout for early season pests and weeds.",
        vegetative: "Apply nitrogen at key tillering stages. Monitor and control weeds to prevent competition.",
        flowering: "Critical period for disease management. Apply fungicides preventatively if conditions favor disease.",
        "fruit-development": "Monitor for head diseases and insects. Maintain adequate soil moisture for grain filling.",
        maturity: "Monitor moisture content for harvesting decisions. Prepare storage facilities."
      },
      maize: {
        seedling: "Ensure proper soil temperature and moisture. Scout for early season pests and emergence issues.",
        vegetative: "Side-dress nitrogen at V6-V8 stage. Control weeds early to prevent yield loss.",
        flowering: "Critical period for water needs. Protect tassel and silk development from stress.",
        "fruit-development": "Monitor for ear-feeding insects. Maintain soil moisture for kernel development.",
        maturity: "Monitor moisture for harvest. Be alert for stalk quality issues if stress occurred earlier."
      }
    };
    
    // Default insight if specific crop/stage not available
    if (!insights[cropType] || !insights[cropType][growthStage]) {
      return "Focus on maintaining balanced nutrition and adequate water supply based on current growth stage requirements.";
    }
    
    return insights[cropType][growthStage];
  }
  
  // Generate yield insight
  function generateYieldInsight(data) {
    const cropType = data.cropType || 'rice';
    const prevYield = data.previousYield ? parseFloat(data.previousYield) : 0;
    
    const yieldBenchmarks = {
      rice: { low: 3000, medium: 5000, high: 7000 },
      wheat: { low: 2500, medium: 4000, high: 6000 },
      maize: { low: 4000, medium: 7000, high: 10000 },
      cotton: { low: 1500, medium: 2500, high: 3500 },
      sugarcane: { low: 50000, medium: 70000, high: 90000 },
      pulses: { low: 800, medium: 1500, high: 2200 },
      vegetables: { low: 15000, medium: 25000, high: 35000 }
    };
    
    const benchmark = yieldBenchmarks[cropType] || yieldBenchmarks.rice;
    
    // Mock prediction calculation
    let predictedYield = benchmark.medium;
    
    // Temperature adjustment
    const tempFactor = 1 + (parseFloat(data.temperature) - 25) * 0.01;
    // Rainfall adjustment
    const rainFactor = 1 + (parseFloat(data.rainfall) - 150) * 0.001;
    // Nutrient adjustment
    const nutrientSum = parseInt(data.nitrogen) + parseInt(data.phosphorus) + parseInt(data.potassium);
    const nutrientFactor = 1 + (nutrientSum - 150) * 0.002;
    
    predictedYield = predictedYield * tempFactor * rainFactor * nutrientFactor;
    predictedYield = Math.round(predictedYield / 100) * 100;
    
    if (prevYield === 0) {
      if (predictedYield < benchmark.medium) {
        return `Potential yield (${predictedYield} kg/ha) is below average for ${cropType}. Focus on addressing limiting factors identified in recommendations.`;
      } else if (predictedYield > benchmark.high) {
        return `Potential yield (${predictedYield} kg/ha) is excellent. Current management practices are working well.`;
      } else {
        return `Potential yield (${predictedYield} kg/ha) is within the normal range for ${cropType}. Minor adjustments could further optimize production.`;
      }
    } else {
      const yieldChange = Math.round((predictedYield - prevYield) / prevYield * 100);
      
      if (yieldChange > 15) {
        return `Potential ${yieldChange}% yield increase compared to previous harvest. Current conditions and management are significantly improved.`;
      } else if (yieldChange < -10) {
        return `Potential ${Math.abs(yieldChange)}% yield decrease compared to previous harvest. Address limiting factors identified in recommendations urgently.`;
      } else {
        return `Predicted yield is comparable to previous harvest (${yieldChange}% change). Consider fine-tuning management practices for continuous improvement.`;
      }
    }
  }
  
  // Generate timeline recommendations
  function generateTimelineRecommendations(data) {
    const timelineContainer = document.getElementById('recommendationsTimeline');
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = '';
    
    const cropType = data.cropType || 'rice';
    const currentMonth = new Date().getMonth();
    
    // Define a mock timeline of recommendations based on crop type and season
    const recommendations = [];
    
    // Generic recommendations that apply to most crops
    recommendations.push({
      title: 'Soil Preparation',
      description: 'Prepare soil with proper tillage and incorporate organic matter.',
      action: 'Implement at least 2-3 weeks before planting.'
    });
    
    // Add nutrient-specific recommendations based on soil data
    if (parseInt(data.nitrogen) < 60) {
      recommendations.push({
        title: 'Nitrogen Application',
        description: `Apply nitrogen fertilizer at ${cropType === 'rice' ? 'flooding' : 'planting'} and at early vegetative stage.`,
        action: 'Apply 40-60 kg/ha depending on soil test results.'
      });
    }
    
    if (parseInt(data.phosphorus) < 30) {
      recommendations.push({
        title: 'Phosphorus Management',
        description: 'Apply phosphorus fertilizer before or at planting for best uptake.',
        action: 'Apply 30-40 kg/ha of P₂O₅ based on soil analysis.'
      });
    }
    
    if (parseFloat(data.soilPh) < 5.5) {
      recommendations.push({
        title: 'Lime Application',
        description: 'Apply agricultural lime to correct soil acidity and improve nutrient availability.',
        action: 'Apply 1-2 tons/ha based on soil pH and buffer capacity.'
      });
    }
    
    // Add water management recommendations
    if (parseFloat(data.rainfall) < 80) {
      recommendations.push({
        title: 'Irrigation Planning',
        description: 'Implement regular irrigation schedule to compensate for low rainfall.',
        action: 'Monitor soil moisture and irrigate to maintain optimal levels.'
      });
    } else if (parseFloat(data.rainfall) > 200) {
      recommendations.push({
        title: 'Drainage Improvement',
        description: 'Ensure proper field drainage to prevent waterlogging and root diseases.',
        action: 'Create channels or furrows to remove excess water from fields.'
      });
    }
    
    // Add seasonal pest management recommendations
    const seasonPests = {
      0: 'early season soil pests', // January
      1: 'early season soil pests', // February
      2: 'early season soil pests', // March
      3: 'leaf-feeding insects', // April
      4: 'leaf-feeding insects', // May
      5: 'stem borers and sap-sucking pests', // June
      6: 'stem borers and sap-sucking pests', // July
      7: 'fruit/grain feeding pests', // August
      8: 'fruit/grain feeding pests', // September
      9: 'late-season pests', // October
      10: 'storage pests', // November
      11: 'storage pests' // December
    };
    
    recommendations.push({
      title: 'Pest Monitoring and Management',
      description: `Regular scouting for ${seasonPests[currentMonth]} that commonly affect ${cropType}.`,
      action: 'Implement integrated pest management strategies and selective pesticides if necessary.'
    });
    
    // Add harvest recommendations if close to maturity
    if (data.growthStage === 'maturity' || data.growthStage === 'fruit-development') {
      recommendations.push({
        title: 'Harvest Preparation',
        description: 'Prepare equipment and plan harvest timing to maximize quality and yield.',
        action: 'Harvest when moisture content reaches optimal level for your crop.'
      });
    }
    
    // Add recommendations to timeline
    recommendations.forEach((rec, index) => {
      const timelineHtml = `
        <div class="timeline-item">
          <div class="timeline-content">
            <h3 class="timeline-title">${rec.title}</h3>
            <p class="timeline-description">${rec.description}</p>
            <div class="timeline-action">${rec.action}</div>
          </div>
        </div>
      `;
      
      timelineContainer.innerHTML += timelineHtml;
    });
  }
  
  // Initialize weather impact chart
  function initWeatherImpactChart(data) {
    const ctx = document.getElementById('weatherImpactChart');
    if (!ctx) return;
    
    // Weather impact data
    const chartData = {
      labels: ['Temperature', 'Rainfall', 'Humidity'],
      datasets: [
        {
          label: 'Current Values',
          data: [parseFloat(data.temperature), parseFloat(data.rainfall) / 10, parseFloat(data.humidity)],
          backgroundColor: 'rgba(124, 179, 66, 0.7)',
          borderColor: 'rgba(124, 179, 66, 1)',
          borderWidth: 1
        },
        {
          label: 'Optimal Range',
          data: [25, 15, 60],
          backgroundColor: 'rgba(100, 181, 246, 0.5)',
          borderColor: 'rgba(100, 181, 246, 1)',
          borderWidth: 1
        }
      ]
    };
    
    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Value (°C, mm/10, %)'
            }
          }
        }
      }
    });
  }
  
  // Initialize soil nutrients chart
  function initSoilNutrientsChart(data) {
    const ctx = document.getElementById('soilNutrientsChart');
    if (!ctx) return;
    
    // Soil nutrients data
    const chartData = {
      labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      datasets: [
        {
          label: 'Current Levels (kg/ha)',
          data: [
            parseInt(data.nitrogen),
            parseInt(data.phosphorus),
            parseInt(data.potassium)
          ],
          backgroundColor: [
            'rgba(124, 179, 66, 0.7)',
            'rgba(100, 181, 246, 0.7)',
            'rgba(141, 110, 99, 0.7)'
          ],
          borderColor: [
            'rgba(124, 179, 66, 1)',
            'rgba(100, 181, 246, 1)',
            'rgba(141, 110, 99, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    new Chart(ctx, {
      type: 'polarArea',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scale: {
          ticks: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Initialize yield comparison chart
  function initYieldComparisonChart(data) {
    const ctx = document.getElementById('yieldComparisonChart');
    if (!ctx) return;
    
    const cropType = data.cropType || 'rice';
    
    // Yield benchmarks by crop type
    const yieldBenchmarks = {
      rice: { low: 3000, average: 5000, high: 7000, top: 9000 },
      wheat: { low: 2500, average: 4000, high: 6000, top: 8000 },
      maize: { low: 4000, average: 7000, high: 10000, top: 12000 },
      cotton: { low: 1500, average: 2500, high: 3500, top: 4500 },
      sugarcane: { low: 50000, average: 70000, high: 90000, top: 110000 },
      pulses: { low: 800, average: 1500, high: 2200, top: 3000 },
      vegetables: { low: 15000, average: 25000, high: 35000, top: 45000 }
    };
    
    const benchmark = yieldBenchmarks[cropType] || yieldBenchmarks.rice;
    
    // Calculate predicted yield
    let predictedYield = benchmark.average;
    const tempFactor = 1 + (parseFloat(data.temperature) - 25) * 0.01;
    const rainFactor = 1 + (parseFloat(data.rainfall) - 150) * 0.001;
    const nutrientSum = parseInt(data.nitrogen) + parseInt(data.phosphorus) + parseInt(data.potassium);
    const nutrientFactor = 1 + (nutrientSum - 150) * 0.002;
    
    predictedYield = predictedYield * tempFactor * rainFactor * nutrientFactor;
    predictedYield = Math.round(predictedYield / 100) * 100;
    
    // Previous yield (if available)
    const prevYield = data.previousYield ? parseFloat(data.previousYield) : null;
    
    // Yield comparison data
    const chartData = {
      labels: ['Low Yield', 'Average Yield', 'High Yield', 'Top Yield', 'Predicted Yield', prevYield ? 'Previous Yield' : ''],
      datasets: [
        {
          label: 'Yield (kg/ha)',
          data: [
            benchmark.low,
            benchmark.average,
            benchmark.high,
            benchmark.top,
            predictedYield,
            prevYield || null
          ],
          backgroundColor: [
            'rgba(239, 83, 80, 0.5)',
            'rgba(255, 183, 77, 0.5)',
            'rgba(124, 179, 66, 0.5)',
            'rgba(30, 136, 229, 0.5)',
            'rgba(156, 39, 176, 0.7)',
            'rgba(117, 117, 117, 0.5)'
          ],
          borderColor: [
            'rgba(239, 83, 80, 1)',
            'rgba(255, 183, 77, 1)',
            'rgba(124, 179, 66, 1)',
            'rgba(30, 136, 229, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(117, 117, 117, 1)'
          ],
          borderWidth: 1,
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round
          }
        }
      ]
    };
    
    // Filter out empty data points
    if (!prevYield) {
      chartData.labels.pop();
      chartData.datasets[0].data.pop();
      chartData.datasets[0].backgroundColor.pop();
      chartData.datasets[0].borderColor.pop();
    }
    
    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Yield (kg/ha)'
            }
          }
        }
      }
    });
  }
  
  // Initialize growth trend chart
  function initGrowthTrendChart(data) {
    const ctx = document.getElementById('growthTrendChart');
    if (!ctx) return;
    
    const cropType = data.cropType || 'rice';
    const growthStage = data.growthStage || 'vegetative';
    
    // Growth stages for timeline
    const stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruit Development', 'Maturity'];
    
    // Growth progression data (representative growth %)
    const growthData = {
      rice: [5, 30, 70, 90, 100],
      wheat: [8, 35, 65, 85, 100],
      maize: [10, 40, 75, 90, 100],
      cotton: [5, 25, 60, 80, 100],
      sugarcane: [10, 50, 80, 95, 100],
      pulses: [12, 45, 75, 90, 100],
      vegetables: [15, 50, 80, 95, 100]
    };
    
    // Current stage index
    const stageIndex = {
      'seedling': 0,
      'vegetative': 1,
      'flowering': 2,
      'fruit-development': 3,
      'maturity': 4
    };
    
    const currentStageIndex = stageIndex[growthStage] || 1;
    
    // Create growth progression data
    const cropGrowth = growthData[cropType] || growthData.rice;
    
    // Chart data
    const chartData = {
      labels: stages,
      datasets: [
        {
          label: 'Growth Percentage',
          data: cropGrowth,
          borderColor: 'rgba(124, 179, 66, 1)',
          backgroundColor: 'rgba(124, 179, 66, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: Array(stages.length).fill('rgba(124, 179, 66, 1)'),
          pointRadius: Array(stages.length).fill(4),
          fill: true,
          tension: 0.3
        }
      ]
    };
    
    // Highlight current stage with a larger point
    chartData.datasets[0].pointBackgroundColor[currentStageIndex] = 'rgba(156, 39, 176, 1)';
    chartData.datasets[0].pointRadius[currentStageIndex] = 8;
    
    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Growth Percentage (%)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Growth: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }
  