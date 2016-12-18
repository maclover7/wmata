#! /usr/bin/env node

require('yargs')
  .usage('$0 <cmd> [args]')
  .command({
    command: 'info [station name]',
    desc: 'Get next train and incident information',
    handler: function (argv) {
      console.log('Requesting information about ' + argv.name + '!');
    }
  })
  .help()
  .argv
