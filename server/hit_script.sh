#!/bin/bash

curl -X POST http://localhost:3002/api/danny012/upload \
  -H "x-api-key: sk_-BnahpROcedLUHVUNALBoljifhSK46OxJieKBRBr8zI" \
  -F "file=@/Users/sk4t/Downloads/EjsF65lWsAIuo9_.jpeg" \
  -F "fileName=EjsF65lWsAIuo9_.jpeg" \
  -F "folder=/sportscars" \
  -F "isPrivate=false" \
  -F "transformations=rs(800,150),q(15)"

  
  
 
