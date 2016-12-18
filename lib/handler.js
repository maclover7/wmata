var request = require('request');
var Promise = require('bluebird');
var Table = require('cli-table2');

module.exports = function(argv) {
  findStations(argv.name, function(stations) {
    getStationInfo(stations, argv.incidents);
  });
}

function findIncidents(stations, callback) {
  options = {
    url: 'https://api.wmata.com/Incidents.svc/json/Incidents',
    headers: {
      'api_key': '5d17f3bfe38b4427b795c3d0bfdcfdfa'
    }
  };

  handler = function(error, response, body) {
    body = JSON.parse(body)['Incidents'];

    relevantIncidents = [];

    body.forEach(function(data) {
      ['LineCode1', 'LineCode2', 'LineCode3'].forEach(function(lineNumber) {
        stations.forEach(function(station) {
          line = station[lineNumber]
          if (data.LinesAffected.includes(line)) {
            relevantIncidents.push({ line: line, data: data });
          }
        });
      });
    });

    callback(relevantIncidents);
  };

  request(options, handler);
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
      'api_key': '5d17f3bfe38b4427b795c3d0bfdcfdfa'
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
      'api_key': '5d17f3bfe38b4427b795c3d0bfdcfdfa'
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

function getStationInfo(stations, showIncidents) {
  findRealTimeTrains(stations).then(function(t) {
    printTrains(t);

    if (showIncidents) {
      // Show incidents after real time trains have been shown
      findIncidents(stations, function(incidents) {
        printIncidents(incidents);
      });
    }
  });
}

function printIncidents(incidents) {
  console.log("\n** CURRENT INCIDENTS: **");

  var table = new Table({
    head: ['LN', 'Info']
  });

  incidents.forEach(function(incident) {
    desc = incident.data.Description;
    desc = desc.split('Line: ')[1].replace(/^\s+|\s+$/g, "");

    half = desc.length / 2;
    partOne = desc.slice(0, half + 1).trim();
    partTwo = desc.slice(half + 1, desc.length).trim();
    desc = partOne + "\n" + partTwo;

    table.push([ incident.line, desc ]);
  });

  console.log(table.toString());
}

function printTrains(trains) {
  console.log("\n** NEXT TRAINS: **");

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
