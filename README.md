DevData.io
==========

The Data You Need, The Programming Language You Want

DevData.io exists to serve a simple purpose: An easy way to get common data
sets (like States, Countries, Curriencies and symbols, etc.) in the programming language you want them in for the projects you are
working on.


Adding a New Dataset
--------------------

All the current datasets are stored as raw JSON files in the [Datasets
directory](datasets/).

1. Fork this repo, add your dataset in the `datasets` directory as a JSON file
2. And then expose it on the frontend with the `datasets` [variable in
   app.js](app.js#L17)

Adding a New Language
---------------------

Don't see your language represented on the site? Let's add it in! All devdata
needs to know is some syntax and formatting rules, and it does the rest.

1. Add your language and all applicable syntax and formatting rules to the
   `formatMap` [variable in lib/converter.js](lib/converter.js#L9)
2. And then expose it on the frontend with the `supportedFormats` [variable in
   app.js](app.js#L16)

License
-------

DevData source code and generated formatted code is all freely licensed with
the [BSD 3-clause license](LICENSE.txt).

