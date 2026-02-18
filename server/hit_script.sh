#!/bin/bash

case "$1" in
  post)
    echo "req: POST"
    curl -X POST http://localhost:3002/api/danny012/assets/upload \
      -H "x-api-key: sk_-BnahpROcedLUHVUNALBoljifhSK46OxJieKBRBr8zI" \
      -F "file=@/Users/sk4t/Downloads/911.jpg" \
      -F "fileName=911.jpg" \
      -F "folder=/other_cars" \
      -F "isPrivate=false" \
      -F "transformations=rs(800,150),q(15)"
    ;;
    
  delete)
    echo "req: DELETE"
    curl -X DELETE http://localhost:3002/api/danny012/assets/sportscars/rs7.jpg \
      -H "x-api-key: sk_-BnahpROcedLUHVUNALBoljifhSK46OxJieKBRBr8zI" \
    ;;
      
  *)
    exit 1
  ;;
esac


  
  
 
