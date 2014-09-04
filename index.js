#!/usr/bin/env node
var sqlite3 = require('sqlite3'),
    path = require('path'),
    indentString = require('indent-string'),
    fs = require('fs');
if (!fs.existsSync(path.join(process.env.HOME, '.notes'))) {
  fs.mkdirSync(path.join(process.env.HOME, '.notes'));
}
var db = new sqlite3.Database(path.join(process.env.HOME, '.notes', 'notes.db'));
db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT NOT NULL, category TEXT DEFAULT \'uncategorized\', created_at DATETIME NOT NULL, last_modified DATETIME NOT NULL)', function (err) {
    if (err) console.log(err);
  });
});
var Note = require('./models/Note')(db);
var app = require('commander');

app
  .version('0.0.1')
  .option('-n, --note <text>', 'The note to add')
  .option('-a, --append', 'Append to end of entry')
  .option('-c, --category <text>', 'The category')
  .option('-i, --id <n>', 'The note ID to edit/view.', parseInt)
  .option('-d, --delete <category/id>', 'The note(s) to delete, can be a category or a specific id.')
  .parse(process.argv);
if (!app.delete) {
  if (!app.note && !app.category) {
    if (app.id) {
      Note(app.id, function (err, notes) {
        if (notes[0]) {
          displayNote(notes[0]);
        } else {
          noNote();
        }
      });
    } else {
      Note(function (err, notes) {
        notes.forEach(function (v) {
          displayNote(v);
        });
      });
    }
  } else if (app.note && app.category) {
    if (app.id) {
      Note.update(app.id, app.note, app.category, function (err) {
        console.log('\033[33mNote ' + app.id + ' updated.\033[39m');
      });
    } else {
      Note.add(app.note, app.category, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('\033[35mNote added!\033[39m');
        }
      });
    }
  } else if (app.note && !app.category) {
    if (app.id) {
      if (app.append) {
        Note.append(app.id, app.note, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('\033[32mNote appended!\033[39m');
          }
        });
      } else {
        Note.update(app.id, app.note, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('\033[32mNote updated!\033[39m');
          }
        });
      }
    } else {
      Note.add(app.note, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('\033[35mNote added!\033[39m');
        }
      });
    }
  } else if (app.category && !app.note) {
    if (app.id) {
      Note.update(app.id, undefined, app.category, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('\033[32mNote ' + app.id + ' category changed to ' + app.category + '.\033[39m');
        }
      });
    }
    else {
      Note(app.category, function (err, notes) {
        if (err) console.log(err);
        else {
          notes.forEach(function (v) {
            displayNote(v);
          });
        }
      });
    }
  }
} else {
  Note.delete(app.delete, function (err) {
    if (err) console.log(err);
    if (isNaN(+app.delete))
      console.log('\033[32mNotes deleted.\033[39m');
    else
      console.log('\033[32mNote deleted.\033[39m');
  });
}
function displayNote (note) {
  console.log('\033[32m' + note.id + ' \033[33m- \033[35m' + note.created_at + ' \033[33m- \033[32m' + note.category);
  indentString('\033[33m' + note.note, 4).forEach(function (v) {
    console.log(v);
  });
  console.log('\033[39m');
}
function noNote () {
  console.log('\033[33mNo notes to display :(\033[39m');
}
