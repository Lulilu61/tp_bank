import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from '../openapi.json' with { type: 'json' };

export const docsRouter = Router();

// Raw file, useful to import the API into Postman by URL
docsRouter.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

// Interactive page
docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpec));