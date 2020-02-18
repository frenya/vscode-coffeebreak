# Introduction

Coffee Break is an extension of Microsoft's Visual Studio Code for efficient meeting minutes management. It covers the following main functionalities

- Write meeting minutes in an open Markdown format
- Preview your minutes as formatted HTML and send to meeting participants
- Mark actions within notes, assign owners and due dates
- View all open actions and filter them using owner and due date

You can store your notes on any cloud filesystem (Dropbox, Google Drive, etc.) and have them available everywhere.

Coffee Break is also ready for a multi-user collaboration over a shared folder.

You can find full documentation at [meetcoffeebreak.net](http://meetcoffeebreak.net/introduction/)

# Taking notes

Write your notes in Markdown and store them in .md files. For more information on Markdown, please visit [Markdown Guide](https://www.markdownguide.org/)

To see your note rendered as HTML, simply use the Markdown Preview functionality of VS Code.

## Basic Coffee Break functionality

Coffee Break adds the tools needed for taking meeting minutes in Markdown, namely

- mark task's in your bullet lists (Alt-Enter)
- complete/uncomplete tasks (Alt-D)
- add owner to a task with **@** mentions
- add due date to a task in YYYY-MM-DD notation
- easily enter dates with the // shortcut

Coffee Break also gives you an overview of all actions in a dedicated side panel. Tasks are grouped by Notebook and Owner. Task's icon reflect its due date. 

![Filtering](resources/doc/filtering.png)

You can also filter the tasks by:

- **Owner** - click the User icon to show primary user's task. Click again to swith the filter off. Alt-Click to customize the filtering.
- **Due date** - click the Calendar icon to show tasks due today. Click again to swith the filter off. Alt-Click to customize the filter date.
- **Sync status** - by default, all tasks are shown. Click the Uplink icon to hide tasks that have been synchronized to an external task manager.
- **Full text** - click the Loupe icon to search for a specific text

## Organizing notes

Coffee Break can operate in one of two modes

- **Single Notebook** - all your notes (as well as all configuration) are stored in a single folder on your filesystem and its subfolders. The same configuration is used for all notes.
- **Workspace with multiple Notebooks** - your main configuration is stored in a "workspace" file (*.code-workspace). Multiple filesystem folder can be added to the workspace and configuration can be finetuned for each of them.

Choose the multi-notebook setting when dealing with a more complex scenarios, e.g. create a workspace for all your work notes and add folders for individual projects.

Note: When switching from a single notebook setup to multi notebook, your configuration will not be migrated. It is however stored as JSON and it is very easy to manually move the settings from the .vscode/settings.json file to the appropriate *.code-workspace file.

For more information see [Configuration](http://meetcoffeebreak.net/configuration)

## External sync

Coffee Break has been prepared for synchronization to an external task manager. Currently, the following sync plugins are available:

- [Coffee Break: Todoist Sync](https://marketplace.visualstudio.com/items?itemName=frenya.vscode-coffeebreak-todoist)

To run sync, simply press Shift-Ctrl-P (Shift-Cmd-P on Mac) and select the "Coffee Break: Synchronize with external task manager" command.

After successful sync, links to the external tasks should appear in your notes, e.g. `[](https://todoist.com/showTask?id=123456)`.

## External sync configuration

There are three things to keep in mind when using the external sync:

- you need to install a sync plugin for your deserved task manager
- you need to configure the "Sync command" in Workspace/Folder Settings
- only tasks of the primary user will be synced, for notes on how to setup primary user, see CONFIGURATION.md
- when running the sync for the first time, you will probably be asked to provide an authorization token for the external service - please see documentation of the sync plugin for details

# Various

## Quick note creation

Press Ctrl-Alt-N (Cmd-Alt-N on Mac) for quickly create a meeting note. You will be asked for a title of your note and after pressing Enter a file will be created with the name "YYYY-MM-DD <Note title>.md".

If you want the file to be created in a particular Notebook, simply type a comma (,) after the title and a few characters of the Notebooks's name.
