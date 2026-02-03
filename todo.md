# Auth
- rete limit creatingApiKeys
- build error middleware with error codes
- account name collison (creating api keys)

# CDN
-  Implement eTag and If-None-Match? 
- implement CDN caching correctly respectig HEADERS (vary)
- clean up and tighten the code base
- try to test cache hits on aws (cloud front)

# Security
- signed urls allow for no tempering (e.g watermark that is impossible to remove) + expiration
- name transformations and aliases
- private files - can only be accessed via valid signed url

0. implement signed urls 

