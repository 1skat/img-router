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

<!-- 0. implement signed urls: 
    - implement mongo db 
    - signed urls: have a settings to set all images to be private only server with signed urls
    - isPrivate flag: image is marked as private (PATCH endpoint)
    - named transformations + (guard rails for hotlinking)* -->
    
    
0. This does not work, fix it
    const redisSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse(defaultSettings);
    await cfg.rsCache.hset(`settings:${accountId}`, JSON.stringify(defaultSettings))
1. just add lru and redis cache to api app
