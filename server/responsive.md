CACHE:
- cache only on Accept header for different formats 
    e.g If a server changes image format on the same URL e.g `/danny-test/tr:f-auto`, send `Vary: Accept` to cache the different image copy on the CDN
- normalize the Accept header before caching

ImageComponent:
- consider layout and CSS (google analytics)
- write sizes 
- choose breakpoints for srcset (considering DPR values)

Notes:
* srcset: 
    - srcset + dpr
     

