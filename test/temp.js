const { proxyRequest } = require("../dist/server");
const http = require('http');

http.createServer((req, res) => {
    debugger;
    let headers = Object.assign(req.headers, {});
    //=====================================================
    // 在转发请求到 nginx 服务器,如果有 host 字段,转发失败
    delete headers.host;
    // proxyRequest("http://127.0.0.1:2857/auth/user/login", request, response)

    const options = {
        port: 2857,
        host: '127.0.0.1',
        method: "POST",
        path: '/auth/user/login'
    };


    let request = http
        .request("http://127.0.0.1:2857/auth/user/login", {
            headers: headers,
            method: req.method,
        }, function(response) {
            debugger
            let data = [];
            response.on("data", function(chunk) {
                debugger;
                data.push(chunk);
            }).on("end", function() {
                let b = Buffer.concat(data);
                res.write(b);
                res.end();
            })
        });

    req.on('data', (data) => {
        request.write(data);
    })
    req.on('end', () => {
        request.end();
    })

}).listen(46169)