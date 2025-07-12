This folder contains my cusom redis implemntation using typescript
-required bun and netcat
-start using the command npm run dev -
 bun run app/index.ts  to start the main server
 bun run app/index.ts --port 6380 --replicaof "localhost 6379" to startup replica server
-write commands to the server using- printf "<command in resp format>" | ncat 127.0.0.1 6379
    eg: printf '*1\r\n$4\r\nPING\r\n' | ncat 127.0.0.1 6379

*add feature for deleting expired keys in a seperate thread