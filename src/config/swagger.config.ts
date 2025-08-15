import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: any) => {
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for My App')
    .setVersion('1.0')
    .addBasicAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
};
