import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js';
import { join } from 'path';
import { EnvsConfig } from '../../config/env.config.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: EnvsConfig.MAIL_HOST,
        port: EnvsConfig.MAIL_PORT,
        secure: EnvsConfig.MAIL_PORT === 465,
        auth:
          EnvsConfig.MAIL_USER && EnvsConfig.MAIL_PASSWORD
            ? {
                user: EnvsConfig.MAIL_USER,
                pass: EnvsConfig.MAIL_PASSWORD,
              }
            : undefined,
      },
      defaults: {
        from: `"Fundación Huahuacuna" <${EnvsConfig.MAIL_FROM}>`,
      },
      template: {
        dir: join(process.cwd(), 'src', 'modules', 'email', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
