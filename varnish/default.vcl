vcl 4.1;

backend images {
    .host = "imgstream-elysia1";
    .port = "3001";
}
 
backend api {
    .host = "imgstream-elysia1";
    .port = "3002";
}

sub vcl_recv { 
    # Route API requests
    if (req.url ~ "^/api/"){
        set req.backend_hint = api;
        return (pass);
    }
    # Route images requests
    if (req.url ~ "\.(png|jpe?g|webp|avif)$") {
        set req.backend_hint = images;
        unset req.http.Cookie; 
    }
    # Route unsupported
    else {
        return (synth(404, "Not found"));
    }
    
    if (req.method != "GET" && req.method != "HEAD"){
        return (pass);
    }
    
    return (hash);
}

sub vcl_backend_response {
    if (bereq.url ~ "\.(png|jpe?g|webp|avif)$"){
        set beresp.ttl = 1h;
        set beresp.http.X-Debug-Cached = "YES";
    } else{
        set beresp.http.X-Debug-Cache = "NO";
    }
}

sub vcl_deliver {
    if (obj.hits > 0){
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
}
