import * as mockery from 'mockery';
import * as sinon from 'sinon';

export function setUp () {
  mockery.enable({
    warnOnUnregistered: false
  });

  let stub = sinon.stub();
  stub.withArgs(sinon.match({ uri: 'https://api.todoist.com/rest/v1/tasks' })).resolves({ id: 66778899 });
  stub.withArgs(sinon.match({ uri: 'https://api.todoist.com/rest/v1/tasks/66778899' })).resolves(null);

  mockery.registerMock('request-promise', stub);
}

export function tearDown () {
  mockery.deregisterAll();
  mockery.disable();
}
