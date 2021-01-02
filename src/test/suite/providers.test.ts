import * as assert from 'assert';
import { before, after } from 'mocha';
import * as sinon from 'sinon';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as path from 'path';

import Config from '../../config';
import Utils from '../../utils';
import { TaskType } from '../../utils/embedded/providers/js';

import expected from '../fixtures/tasks1';
import expectedBacklog from '../fixtures/tasks2';

console.log(expected);

suite('Embedded task provider', () => {

	before(async () => {
    await Utils.embedded.initProvider ();
	});

  test('should have task data', async () => {
    const fileData = await Utils.embedded.provider.getFileData(path.resolve(__dirname, '../../../demo/New Datacenter/2014-10-08 Weekly Meeting.md'));
    const actual = await Utils.embedded.provider.getTodosFromFileData(fileData);
    // TODO: Add test for filter function

    assert(actual.length === expected.length);

    actual.forEach((t: TaskType, i) => {
      // console.log('Matching', t, 'to', i, expected[i]);
      sinon.assert.match(t, expected[i]);
    });
  });

  test('tasks should have backlinks', async () => {
    const fileData = await Utils.embedded.provider.getFileData(path.resolve(__dirname, '../../../demo/New Datacenter/2014-10-08 Weekly Meeting.md'));
    const actual = await Utils.embedded.provider.getTodosFromFileData(fileData);

    console.log('backlink actual', actual);

    actual.forEach((t: TaskType) => {
      assert(!!t.backlinkURL);
      assert(/^vscode:\/\/file\//.test(t.backlinkURL));
      assert(t.backlinkURL.indexOf('%2F2014-10-08%20Weekly%20Meeting.md:' + (t.lineNr + 1)) !== -1);
    });
  });

  test('backlog tasks should be correctly assigned', async () => {
    const fileData = await Utils.embedded.provider.getFileData(path.resolve(__dirname, '../../../demo/New Datacenter/Backlog.md'));
    const actual = await Utils.embedded.provider.getTodosFromFileData(fileData);

    /*
    actual.forEach((t: TaskType) => {
      assert(!!t.backlinkURL);
      assert(/^vscode:\/\/file\//.test(t.backlinkURL));
      assert(t.backlinkURL.indexOf('%2F2014-10-08%20Weekly%20Meeting.md:' + (t.lineNr + 1)) !== -1);
    });
    */
    // console.log(JSON.stringify(actual, null, 2));

    assert.equal(actual.length, expectedBacklog.length);

    actual.forEach((t: TaskType, i) => {
      // console.log('Matching', t, 'to', i, expected[i]);
      sinon.assert.match(t, expectedBacklog[i]);
    });
  });

});

