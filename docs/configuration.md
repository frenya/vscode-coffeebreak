---
description: Plugin configuration technical details
---

# Configuration

## Workspace

Workspace config is stored in your *.code-workspace file in JSON format. 
You can access it via the Settings icon in the lower left corner.

![Settings](../assets/img/docs/settings_open.png)

Settings tab will open in the main panel. Simply select Extensions -> Coffee Break on the left to see the available options.

![Settings](../assets/img/docs/settings_workspace.png)

Please note that there are three levels of settings in VSCode

- **User** - whatever you set here will apply to all your workspaces
- **Workspace** - settings for this particular workspace
- **Folder** - settings specific for a specific folder within your workspace

## Folder

Folder settings are stored in the folder itself in the .vscode/settings.json file.

## Key Coffee Break settings

Here is the list of settings you should definitely configure to get the most out of Coffee Break:

- coffeebreak.emails - A list of e-mail addresses that belong to the workspace owner. These are used to identify primary user's[^1] tasks.
- coffeebreak.mentions - A list of user mentions. No need to configure this directly, just add the users over time. Editing the json file may be useful e.g. when importing a list of users.
- coffeebreak.sync - Useful when synchronizing to an external task manager. More information available at [External sync](../howto/#external-sync)

[^1]: see [Collaboration](../collaboration) for more details.
