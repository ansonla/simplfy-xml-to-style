var fs      = require('fs'),
    util    = require('util');
    xml2js  = require('xml2js'),
    parser  = new xml2js.Parser();

/**
 *  Loop through ./xml folder and push all file (contain .xml) to files array
 *
 *  @author Nugget
 *  @parm   callback
 */
function xmlFiles(callback) {

  var filesArray = new Array();

  fs.readdir(__dirname + '/xml', function(err, files) {

      files.forEach(function (file) {

          if (file.search('.xml').length != -1)
          {
              filesArray.push(file);
          }

          // console.log('Files: ' + file);
      })

      callback(filesArray);
  });
}

/**
 *  Recursive function to loop through the XML DOM tree and
 *  find the attribute which contains 'android:' and 'merge'
 *  the attribute to collection
 *
 *  @author Nugget
 *  @parm   obj (parsed xml with xml2js)
 *  @parm   collection (collectionns for tttributes)
 */
function inspectXML(obj, collection) {

    for (var key in obj) {

        var value = obj[key];

        if (value instanceof Function)
        {
            // console.log('Function: ' + value);
        }
        else if (value instanceof Object)
        {
            // console.log('Object: ' + value);
            inspectXML(value, collection);
        }

        if (key.search('android:') != -1)
        {

            if (key.search('merge') != -1) {
                console.log('Merge: ' + key);
            }
            collection.merge(key + '=' + obj[key]);
        }
    }

    // console.log(stats);
    return collection;
}

/**
 *  Merge/Incremaent collection of attributes
 *
 *  @author Nugget
 *  @parm   obj (String or Object)
 */
Object.prototype.merge = function(obj) {

    if (typeof(obj) == 'string')
    {
        //if this contain attribute then incremaent
        //else set value to 1
        if (this.hasOwnProperty(obj))
        {
            var i = this[obj];
            i++;
            this[obj] = i;
        }
        else
        {
            // console.log('key: ' + obj);
            this[obj] = 1;
        }

    }
    else if (obj instanceof Object)
    {
        //Merge obj (collection of attribute)
        for (var attr in obj) {

            if (typeof(attr) == 'string' && attr.search('android:') != -1)
            {
                //if this contain attribute merge 'appear' count
                //else copy attribute
                if (this.hasOwnProperty(attr))
                {
                    var i = this[attr] + obj[attr];
                    this[attr] = i;
                }
                else
                {
                    this[attr] = obj[attr];
                }
            }
        }
    }
}

/**
 *  Getting last element of Array
 *
 *  @author Nugget
 */
Array.prototype.last = function() {
    if (this.length > 0) {
        return this[this.length -1];
    }
}

function prettyPrint(collections) {

    var sortable = [];
    var json = util.inspect(collections, false, null);

    for (var attr in collections) {

        if (typeof(attr) == 'string' && attr.search('android:') != -1)
        {
            // console.log(attr.length);
            sortable.push([attr, collections[attr]]);
        }
    }

    sortable.sort(function(a, b) { return b[1] - a[1]});

    console.log('Sorted: ');
    for (var attr in sortable) {
        console.log(sortable[attr]);
    }
    console.log('Unsorted: ' + json);
}
xmlFiles(function (files) {

    // console.log('XML files: ' + files);

    var root_dir = __dirname + '/xml/';
    var xmlAttr = {};

    files.forEach(function(file) {

        fs.readFile(root_dir + file, {trim: true}, function(err, data) {

            parser.parseString(data, function(err, result) {

                xmlAttr = inspectXML(result, xmlAttr);
                console.log('Parsed: ' + file);
            });

            if (file == files.last())
            {
                prettyPrint(xmlAttr);
            }
        });
    });
});
