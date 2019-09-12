import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';

import Config from '../../config';
import { isItMyself, mySyncSettings } from '../../commands/mentions';

suite('Demo workspace configuration', () => {

  let config = null;
	before(() => {
    config = Config(null);
	});

  test('should have owners e-mails', () => {
    assert.deepEqual(config.get('emails'), [ 
      'frenya@frenya.net' 
    ]);
  });

  test('should have initial mentions', () => {
    assert.deepEqual(config.get('mentions'), {
      'Frenya': {
        'fullname': 'Frantisek Vymazal',
        'email': 'frenya@frenya.net'
      }
    });
  });

  test('should identify myself', () => {
    assert(isItMyself(config, 'Frenya'));
    assert(!isItMyself(config, 'Frank'));
  });

  test('should get sync settings', () => {
    assert.deepEqual(mySyncSettings(config, 'Frenya'), {});
    assert.deepEqual(mySyncSettings(config, 'Frank'), null);
  });

});

suite('Demo folder configuration', () => {

  let config = null;
	before(() => {
    const uri = vscode.Uri.file(path.resolve(__dirname, '../../../demo/New Datacenter/Kick-off.md'));
    config = Config(uri);
	});

  test('should have initial mentions', () => {
    assert.deepEqual(config.get('mentions'), {
      'John': {
        'fullname': 'John Adams',
        'deparment': 'Networking',
      },
      'Doug': {
        'fullname': 'Doug Brown',
        'deparment': 'IT Operations',
      },
      'Anne': {
        'fullname': 'Anne Crowley',
        'deparment': 'Finance',
      },
      'Sean': {
        'fullname': 'Sean Dermot',
        'deparment': 'UPS Technologies',
      },
      'Steve': {
        'fullname': 'Steve Evans',
        'deparment': 'AC Plus',
      },
      'Rich': {
        'fullname': 'Richard Francis',
        'deparment': 'Project Manager',
      },
      'Frank': {
        'fullname': 'Frantisek Vymazal',
        'email': 'frenya@frenya.net'
      },
      'Frenya': {
        'fullname': 'Frantisek Vymazal',
        'email': 'frenya@frenya.net'
      }
    });
  });

  test('should identify myself', () => {
    assert(isItMyself(config, 'Frenya'));
    assert(isItMyself(config, 'Frank'));
    assert(!isItMyself(config, 'Anne'));
  });

  test('should get sync settings', () => {
    assert.deepEqual(mySyncSettings(config, 'Frenya'), {});
    assert.deepEqual(mySyncSettings(config, 'Frank'), {});
    assert.deepEqual(mySyncSettings(config, 'Anne'), null);
  });

});
