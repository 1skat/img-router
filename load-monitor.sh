#!/bin/bash

while true; do
  echo "${date}" - usage:
  docker stats --no-sream --format "{{.Name}} CPU: {{CPUPerc}} MEM: {{.MemUsage}}"
  sleep 3
done

