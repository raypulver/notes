Per-user CLI note taking application written using SQLite and Commander.
To see all options, type notes --help
## Examples:

$ ln -s (program directory)/index.js /usr/local/bin/notes
$ notes -n "first note" -c "category"
>> Note added!
$ notes
>> (Displays all notes)
$ notes -i 1
>> (Displays note with id 1)
$ notes -i 1 -n "changing text of note 1 to this"
>> Note updated!
$ notes -d 1
>> Note deleted.
