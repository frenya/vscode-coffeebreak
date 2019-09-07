## Collaboration, primary user

Consider the following scenario

- Alice and Bob are working on the same project called Manhattan
- They have a shared Dropbox folder called Manhattan which they both synchronize to their laptops
- They have both installed Visual Studio Code with the Coffee Break extension enabled
- They both added the Manhattan folder as part of their Coffee Break workspace

This is the **shared notebook configuration** stored in `Manhattan/.vscode/settings.json`

```json
{
  "coffeebreak.mentions": {
    "Alice": {
      "fullname": "Alice Agile",
      "email": "alice.agile@example.com",
    },
    "Bob": {
      "fullname": "Robert Rich",
      "email": "robert.rich@example.com"
    },
  },
}
```

The notebook is filled with notes and meeting minutes. Now, obviously, Alice would like to primarily see her own tasks in the Coffee Break side panel and so would Bob. Fortunately, this is very easy to achieve with the following **workspace** configurations:

**Alice:**

```json
{
  ...
  "coffeebreak.emails": [
    "alice.agile@example.com", ...
  ],
  ...
}
```

**Bob:**

```json
{
  ...
  "coffeebreak.emails": [
    "robert.rich@example.com", ...
  ],
  ...
}
```

Since the workspace configrations are stored outside the shared notebook folder, each user can have a different one.

Coffee Break checks the email address in the mention against the list of email addresses from the workspace configuration and any mention that matches is considered to refer to the **primary user**.