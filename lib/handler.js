var request = require('request');
var Promise = require('bluebird');
var Table = require('cli-table2');

module.exports = function(name) {
  findStations(name, function(stations) {
    getStationInfo(stations);
  });
}

function findIncidents(stations) {
  //options = {
    //url: 'https://api.wmata.com/Incidents.svc/json/Incidents',
    //headers: {
      //'api_key': '6b700f7ea9db408e9745c207da7ca827'
    //}
  //};

  //handler = function(error, response, body) {
    //body = JSON.parse(body)['Incidents'];
    //console.log(body);
  //};

  //request(options, handler);
}

function findRealTimeTrains(stations) {
  trains = [];

  return new Promise(function(resolve, reject) {
    stations.forEach(function(station, index) {
      _findRealTimeTrains(station.Code, function(t) {
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

function findStations(name, callback) {
  options = {
    url: 'https://api.wmata.com/Rail.svc/json/jStations',
    headers: {
      'api_key': '6b700f7ea9db408e9745c207da7ca827'
    }
  };

  handler = function(error, response, body) {
    if (!error && response.statusCode == 200) {
      stations = [];
      body = JSON.parse(body)['Stations'];

      body.forEach(function(data) {
        if (!(data['Name'] === name)) {
        } else {
          stations.push(data);
        }
      });

      callback(stations);
    }
  };

  request(options, handler);
}

function getStationInfo(stations) {
  findRealTimeTrains(stations).then(function(t) {
    printTrains(t);

    // Show incidents after real time trains have been shown
    findIncidents(stations);
  });
}

function printTrains(trains) {
  var table = new Table({
    head: ['LN', 'CAR', 'DEST', 'MIN']
  });

  // Sort trains by arrival time
  trains.sort(function(a, b) {
    return a.Min - b.Min;
  });

  trains.forEach(function(train) {
    table.push([ train.Line, train.Car, train.DestinationName, train.Min ]);
  });

  console.log(table.toString());
}
