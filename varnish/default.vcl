vcl 4.1;

backend default {
    .host = "host.docker.internal";
    .port = "3001";
}

sub vcl_recv { 
    if (req.url ~ "\.(png|jpe?g|webp|avif)$") {
        unset req.http.Cookie; # why do i need to remove cookies from the header
        # is this what i can do in production?
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
