const zipper = require('zip-a-folder');

zipper.zip('build/', 'sesizari.war')
.then(console.log('war file created successfully'))
.catch(error => console.log(error))

