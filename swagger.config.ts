import swaggerJsdoc from 'swagger-jsdoc';
import { schemas } from './src/openapi/components';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Annotate plus task API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Annotate plus task application management.',
        },
        security: [
            { bearerAuth: [] },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas,
        },
    },
    apis: ['./src/api/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
