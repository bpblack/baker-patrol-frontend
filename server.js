let express = require('express');
let enforce = require('express-sslify')
let app = express();
app.use(enforce.HTTPS({ trustProtoHeader: true }), express.static(__dirname+'/dist/baker-patrol-frontend/browser'));
app.get('/*', (req, resp) => {
  resp.sendFile(__dirname+'/dist/baker-patrol-frontend/browser/index.html')
});
app.listen(process.env.PORT || 8080);