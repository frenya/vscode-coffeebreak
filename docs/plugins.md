# Sync plugins

Sync plugins are just plain old VSCode extensions that provide command(s) handling the task sync.
Currently, the following sync plugins are available:

- [Coffee Break: Todoist Sync](https://marketplace.visualstudio.com/items?itemName=frenya.vscode-coffeebreak-todoist){:target="_blank"}[^1]

[^1]: The Todoist Sync plugin is a VSCode extension that has been developed by me and can serve as a basis for your own plugin synchronizing to a different task manager.

If you need synchronization to a different task manager, all it takes is to create an extension with the necessary sync handler.
Below you can find information on the architecture and expected behaviour of such extension.

## Data flow

When the user runs the "Coffee Break: Synchronize with external task manager" command on a particular file, Coffee Break takes all the
tasks assigned to the **primary user** (see [Collaboration](../collaboration) for details) and sends them the command that has been configured
at the workspace or folder level. In the example bellow the tasks are sent to the `coffeebreak.todoist.sync` provided by the above mentioned plugin.

```json
{
  ...
  "coffeebreak.sync": {
    "command": "coffeebreak.todoist.sync",
    "project_id": 12345678,
    "labels": [ 121212, 343434 ]
  },	
  ...
}
```

Note: All the remaining attributes of the `sync` object (i.e `project_id` and `labels` in this case) are passed as one of the arguments to the sync command.
Available attributes and their behavior should be described in your plugin's documentation.

## Expected API

Your plugin is expected to contribute one or more sync commands. The command is expected to take three arguments:

- **tasks** - an array of task objects
- **uri** - URI the text document being processed
- **options** - an object with the remaining attributes from the `coffeebreak.sync` object

The expected return value is the original array of tasks with the `.externalURL` attribute set for all the tasks that have been successfully synchronized.

Notes:

- the url will be added to the end of the task in the original file by Coffee Break, see [Introduction](../introduction/#external-sync) for details
- you can use the `.externalURL` attribute to determine whether a task has already been synchronized and extract its ID

## Documentation

Please keep in mind that the user will have to configure the sync. In your documentation you should provide at least the following:

- exact name of the sync command (feel free to follow the `coffeebreak.<name-of-service>.sync` pattern)
- any attributes the can be passed via the options object and their meaning

If you have any questions, feel free to contact me.