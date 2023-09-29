let express = require('express');
let app = express();
app.use(express.static(__dirname+'/dist/baker-patrol-frontend'));
app.get('/*', (req, resp) => {
  resp.sendFile(__dirname+'/dist/baker-patrol-frontend/index.html')
});
app.listen(process.env.PORT || 8080);