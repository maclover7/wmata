var request = require('request');
var Promise = require('bluebird');
var Table = require('cli-table2');

module.exports = function(name) {
  findStationCodes(name, function(stationCodes) {
    getStationInfo(stationCodes);
  });
}

function findIncidents(stationCodes) {
  console.log(stationCodes);
}

function findRealTimeTrains(stationCodes) {
  trains = [];

  return new Promise(function(resolve, reject) {
    stationCodes.forEach(function(stationCode, index) {
      _findRealTimeTrains(stationCode, function(t) {
        trains = trains.concat(t);

        if (index == 0) {
          resolve(trains);
        }
      });
    });
  });
}

function _findRealTimeTrains(stationCode, callback) {
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

function findStationCodes(name, callback) {
  options = {
    url: 'https://api.wmata.com/Rail.svc/json/jStations',
    headers: {
      'api_key': '6b700f7ea9db408e9745c207da7ca827'
    }
  };

  handler = function(error, response, body) {
    if (!error && response.statusCode == 200) {
      stationCodes = [];
      body = JSON.parse(body)['Stations'];

      body.forEach(function(data) {
        if (!(data['Name'] === name)) {
        } else {
          stationCodes.push(data['Code']);
        }
      });

      callback(stationCodes);
    }
  };

  request(options, handler);
}

function getStationInfo(stationCodes) {
  findRealTimeTrains(stationCodes).then(function(t) {
    printTrains(t);
  });

  findIncidents(stationCodes);
}

function printTrains(trains) {
  var table = new Table({
    head: ['LN', 'CAR', 'DEST', 'MIN']
  });

  trains.forEach(function(train) {
    table.push([ train.Line, train.Car, train.DestinationName, train.Min ]);
  });

  console.log(table.toString());
}
