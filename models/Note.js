module.exports = function (db) {
  var ret = function (search, callback) {
    var SQL = 'SELECT * FROM notes';
    if (typeof search === 'string') {
      SQL += ' WHERE category = "' + search + '"';
    } else if (typeof search === 'number') {
      SQL += ' WHERE id = ' + search;
    } else if (typeof search === 'function') {
      callback = search;
    }
    db.serialize(function () {
      db.all(SQL, function (err, row) {
        callback(err, row);
      });
    });
  };
  ret.add = function (note, category, callback) {
    if (note && typeof category === 'string') {
      db.serialize(function () {
        db.run('INSERT INTO notes (note, category, created_at, last_modified) VALUES ($note, $category, date(\'now\'), date(\'now\'))', {
          $note: note,
          $category: category
        }, function (err) {
          callback(err);
        });
      });
    } else if (note && typeof category === 'function') {
      db.serialize(function () {
        db.run('INSERT INTO notes (note, created_at, last_modified) VALUES ($note, date(\'now\'), date(\'now\'))', {
          $note: note
        }, function (err) {
          category(err);
        });
      });
    }
  };
  ret.append = function (id, text, callback) {
    db.serialize(function () {
      var q = 'UPDATE notes SET note = note || $text, last_modified = date(\'now\') WHERE id = $id';
      db.run(q, {
        $text: text,
        $id: id
      }, function (err) {
        callback(err);
      });
    });
  };
  ret.update = function (id, note, category, callback) {
    if (typeof id === 'number') {
      if (note && category) {
        if (typeof category === 'string') {
          db.serialize(function () {
            db.run('UPDATE notes SET note = $note, category = $category, last_modified = date(\'now\') WHERE id = $id', {
                $note: note,
                $category: category,
                $id: id
              }, function (err) {
                callback(err);
              });
          });
        } else if (typeof category === 'function') {
          db.serialize(function () {
            db.run('UPDATE notes SET note = $note, last_modified = date(\'now\') WHERE id = $id', {
              $note: note,
              $id: id
            }, function (err) {
              callback(err);
            });
          });
        }
      } else if (note) {
        db.serialize(function () {
          db.run('UPDATE notes SET note = $note, last_modified = date(\'now\') WHERE id = $id', {
            $note: note,
            $id: id
          }, function (err) {
            category(err)
          });
        });
      } else if (!note && category) {
        db.serialize(function () {
          db.run('UPDATE notes SET category = $category, last_modified = date(\'now\') WHERE id = $id', {
            $category: category,
            $id: id
          }, function (err) {
            callback(err);
          });
        });
      }
    }
  };
  ret.delete = function (id, callback) {
    if (!isNaN(+id)) {
      db.serialize(function () {
        db.run('DELETE FROM notes WHERE id = $id', {
          $id: id
        }, function (err) {
          callback(err);
        });
      });
    }
    else {
      db.serialize(function () {
        db.run('DELETE FROM notes WHERE category = $category', {
          $category: id
        }, function (err) {
          callback(err);
        });
      });
    }
  };
  return ret;
};
