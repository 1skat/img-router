Their existing S3 bucket (e.g danny-bucket4)
    - Public images only
    - User manages directly (upload/delete however they want)
    - Your service just reads from it as fallback

Managed bucket
    - Private images OR images with custom transformations
    - ONLY managed via your CLI
    - MongoDB always in sync
    
2. endpoint to set an image to private + transformation - basically set isPrivate to true and update transfomations fields (validate) (patch method)
3. endpoint to add name transformations - a hashmap shit but need to validate 
