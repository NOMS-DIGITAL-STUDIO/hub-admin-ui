Hub Admin
====

Ministry of Justice.
National Offender Management Service.

# Get Started

Install the dependencies required to run the service and start the server in:

  ```
  $ npm install
  $ npm start
  ```  
Visit [localhost:3000](http://localhost:3000/)

# Dev Guidance

## Debug mode

Execute
```
DEBUG=hub-admin-ui node .
```
NB you can also enable debugging for 3rd party moidules such as express eg
```
DEBUG=hub-admin-ui,express* node .
```

Create debug output using
```
debug('message')
```

## Logging

Logging uses winston. Create log output (other than debug) as eg

```
logger.info('message')
```
