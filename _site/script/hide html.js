//Let your all files like index.html, css, js be in public folder

const express = require('express');
const path = require('path')




app.get('/:name', (req, res) => {
  var filePath = ""
  const fileName = req.params.name;

//////Check if file is not .html file like css, js etc
  if(fileName.includes(".css") || fileName.includes(".js") || fileName.includes(".png") || fileName.includes(".jpg") || fileName.includes(".svg")){
    filePath = path.join(__dirname, 'public', fileName)
  }
  else{
  filePath = path.join(__dirname, 'public', fileName + ".html");
  }
  res.sendFile(filePath, err => {
    if (err) {
      console.log(`Error sending file: ${err.message}`);
      res.status(err.status).end();
    } else {
      console.log(`File sent: ${filePath}`);
    }
  });
});

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});