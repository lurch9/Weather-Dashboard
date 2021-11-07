function returnedClick(clickId) {
    document.getElementById("user-input").value = clickId
    document.getElementById("submit").click()
}

$(document).ready(function () {
    var search = "";
    var currentDay = $('#currentDay')
    var api = 'https://api.openweathermap.org/data/2.5/weather?q=';
    var forecastAPI = 'https://api.openweathermap.org/data/2.5/forecast?q=';
    var apiKey = '&appid=363815a4b03ecb887a1a920d819e70b9'
    var units = '&units=imperial';
    var userInput = document.querySelector('#user-input')
    var cityEl = $('#city')
    var windEl = $('#wind')
    var tempEl = $('#temp')
    var humidityEl = $('#humidity')
    var uviEl = $('#uvi')
    var iconAPI;
    var forecastIcon;
    var tempForecastEl = [$("#tempForecast0"), $("#tempForecast1"), $("#tempForecast2"), $("#tempForecast3"), $("#tempForecast4")]
    var currentDayForecastEl = [$("#dayForecast0"), $("#dayForecast1"), $("#dayForecast2"), $("#dayForecast3"), $("#dayForecast4")]
    var iconForecastEl = [$("#iconForecast0"), $("#iconForecast1"), $("#iconForecast2"), $("#iconForecast3"), $("#iconForecast4")]
    var humidityForecastEl = [$("#humidityForecast0"), $("#humidityForecast1"), $("#humidityForecast2"), $("#humidityForecast3"), $("#humidityForecast4")]
    var windForecastEl = [$("#windForecast0"), $("#windForecast1"), $("#windForecast2"), $("#windForecast3"), $("#windForecast4")]
    var history;

    currentDay.text(moment().format("L"))

    function checkEntry(search)
    {
       if( /^[A-Za-z\s]+$/.test(search))
       {
           console.log(true);
           return true;
       }
       else
       swal("Oops!", "Please enter only letters and/or spaces")
       return false;
    }

    function loadHistory() {
        var ul = $("#history-list")
        history = JSON.parse(localStorage.getItem("searchHistory") || "[]")
        for (let i = 0; i < history.length; i++) {
            ul.append(`<li><button class="btn btn-info btn-block" id="${history[i]}" style="margin-top: 1%; width:100%; font-size:2vw" onClick="returnedClick(this.id)">${history[i]}<btn></li>`)

        }
    }
    loadHistory();

    $('#clearHistory').on("click", function (event) {
        event.preventDefault();
        localStorage.clear();
        window.location.reload(false);})

    $('#submit').on("click", function (event) {
        event.preventDefault();
        search = userInput.value.trim()
        if(checkEntry(search)){
        console.log(search);
        getWeather(search);
        getForecast(search);
        history = JSON.parse(localStorage.getItem("searchHistory") || "[]")
        if(!history.includes(search)){history.push(search)
        localStorage.setItem("searchHistory", JSON.stringify(history))
        $("#history-list").append(`<li><button class="btn btn-info btn-block" id=${search} style="margin: auto; text-align: center; width:100%; font-size:2vw" onClick="returnedClick(this.id)">${search}<btn></li>`); 
        }
        
    }

    })
    
    function getForecast(search) {
        var dayNumber = 1;
        var urlForecast = forecastAPI + search + apiKey + units;
        fetch(urlForecast)
            .then(function (response) {
                if (response.ok) {
                    console.log(response);
                    response.json().then(function (data) {
                        console.log(data);
                        for (var i = 0; i < 5; i++) {
                            console.log(i);
                            forecastIcon = "https://openweathermap.org/img/wn/" + data.list[dayNumber].weather[0].icon + ".png"
                            windForecastEl[i].text("Wind: " + data.list[dayNumber].wind.speed + " MPH")
                            tempForecastEl[i].text("Temp: " + data.list[dayNumber].main.temp + " °F")
                            currentDayForecastEl[i].text(moment(data.list[dayNumber].dt_txt).format('M/DD/YY'))
                            humidityForecastEl[i].text("Humidity: " + data.list[dayNumber].main.humidity + " %")
                            iconForecastEl[i].html(`<img src='${forecastIcon}'>`);
                            dayNumber+=8;

                        }
                        
                    })
                }
            }
            )
    }
    function getWeather(search) {
        var url = api + search + apiKey + units;
        fetch(url)
            .then(function (response) {
                if (response.ok) {
                    console.log(response);
                    response.json().then(function (data) {
                        console.log(data)
                        var uvIndex = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&exclude=hourly,daily" + apiKey;
                        fetch(uvIndex)
                            .then(function (res) {
                                if (res.ok) {
                                    console.log(res);
                                    res.json().then(function (uviData) {
                                        console.log(uviData);
                                        displayWeather(data, uviData);

                                    })
                                }
                            })
                    })
                }
                else
                throw new swal('The API was unable to read your input', 'Try using an alternate city name. '+
                '(eg. Tampa Bay does not work, but Tampa does.)');

            })
    }

    function displayWeather(data, uviData) {
        var uvi = uviData.current.uvi
        cityEl.text(data.name)
        windEl.text("Wind: "+data.wind.speed+" MPH")
        tempEl.text("Temperature: "+data.main.temp+" °F")
        humidityEl.text("Humidity: "+data.main.humidity+ " %")
        uviEl.text("UVI: ");
        iconAPI = "http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png"
        $("#icon").html(`<img src='${iconAPI}'>`);
        if (uvi < 3) {
            uviEl.append(`<h1 class="favorable">${uvi}</h1>`)
        } else if (uvi < 7) {
            uviEl.addClass("moderate")
        } else { uviEl.addClass("severe") };

    }
})
