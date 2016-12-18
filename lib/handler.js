var request = require('request');

module.exports = function(name) {
  findStationCode(name, function(stationCode) {
    if (Array.isArray(stationCode)) {
      stationCode.forEach(function(code) {
        getStationInfo(code);
      });
    } else {
      getStationInfo(stationCode);
    }
  });
}

function findIncidents(stationCode) {
  console.log(stationCode);
}

function findRealTimeTrains(stationCode, callback) {
  options = {
    url: 'https://api.wmata.com/StationPrediction.svc/json/GetPrediction/' + stationCode,
    headers: {
      'api_key': '6b700f7ea9db408e9745c207da7ca827'
    }
  };

  handler = function(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body)['Trains'];
      callback(body);
    }
  };

  request(options, handler);
}

function findStationCode(name, callback) {
  options = {
    url: 'https://api.wmata.com/Rail.svc/json/jStations',
    headers: {
      'api_key': '6b700f7ea9db408e9745c207da7ca827'
    }
  };

  handler = function(error, response, body) {
    if (!error && response.statusCode == 200) {
      stationCode = null;
      body = JSON.parse(body)['Stations'];

      code = body.some(function(data) {
        if (!(data['Name'] === name)) {
        } else {
          stationCode = data['Code'];
          return true;
        }
      });

      callback(stationCode);
    }
  };

  request(options, handler);
}

function getStationInfo(stationCode) {
  findRealTimeTrains(stationCode, function(trains) {
    printTrains(trains);
  });
  findIncidents(stationCode);
}

function printTrains(trains) {
  trains.forEach(function(train) {
    // 'LN', 'CAR', 'DEST', 'MIN'
    console.log(train.Line + ' ' + train.Car + ' ' + train.DestinationName + ' ' + train.Min);
  });
}
