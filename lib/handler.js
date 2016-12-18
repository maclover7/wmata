module.exports = function(name) {
  stationCode = findStationCode(name);
  findRealTimeTrains(stationCode);
  findIncidents(stationCode);
  console.log(name);
}

function findIncidents(stationCode) {
}

function findRealTimeTrains(stationCode) {
}

function findStationCode(name) {
}
