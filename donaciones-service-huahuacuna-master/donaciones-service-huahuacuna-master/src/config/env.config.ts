import 'dotenv/config';
import Joi from 'joi';

interface ConfigInterface {
  PORT: number;
  KAFKA_BROKER: string;
  JWT_SECRET: string;
  // Email configuration
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  MAIL_FROM: string;
  // PSE configuration
  PSE_API_URL: string;
  PSE_MERCHANT_ID: string;
  PSE_API_KEY: string;
  PSE_API_SECRET: string;
  PSE_RETURN_URL: string;
  PSE_CALLBACK_URL: string;
  // App configuration
  APP_URL: string;
}

const envConfigSchema = Joi.object({
  PORT: Joi.number().required(),
  KAFKA_BROKER: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  // Email configuration (optional for development)
  MAIL_HOST: Joi.string().default('localhost'),
  MAIL_PORT: Joi.number().default(1025),
  MAIL_USER: Joi.string().default(''),
  MAIL_PASSWORD: Joi.string().default(''),
  MAIL_FROM: Joi.string().email().default('noreply@huahuacuna.org'),
  // PSE configuration (optional for development)
  PSE_API_URL: Joi.string().uri().default('https://sandbox.pse.com.co/api/v1'),
  PSE_MERCHANT_ID: Joi.string().default('test_merchant'),
  PSE_API_KEY: Joi.string().default('test_key'),
  PSE_API_SECRET: Joi.string().default('test_secret'),
  PSE_RETURN_URL: Joi.string().uri().default('http://localhost:3000/donations/pse/return'),
  PSE_CALLBACK_URL: Joi.string().uri().default('http://localhost:3001/donations/pse/callback'),
  // App configuration
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
}).unknown(true);

const validationResult = envConfigSchema.validate(process.env);

if (validationResult.error) {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  for (const detail of validationResult.error.details) {
    const varName = detail.path[0] as string;

    if (detail.type === 'any.required') {
      missingVars.push(varName);
    } else {
      invalidVars.push(`${varName} (${detail.message})`);
    }
  }

  let errorMessage = '❌ Environment variable configuration error:\n';

  if (missingVars.length > 0) {
    errorMessage += `\n🔴 Missing variables:\n`;
    for (const varName of missingVars) {
      errorMessage += `   - ${varName}\n`;
    }
  }

  if (invalidVars.length > 0) {
    errorMessage += `\n⚠️ Variables with invalid values:\n`;
    for (const varInfo of invalidVars) {
      errorMessage += `   - ${varInfo}\n`;
    }
  }

  errorMessage += `\n💡 Make sure you have an .env file with all the required variables.`;

  throw new Error(errorMessage);
}

const envConfig = validationResult.value as ConfigInterface;

export const EnvsConfig = {
  PORT: envConfig.PORT,
  KAFKA_BROKER: envConfig.KAFKA_BROKER,
  JWT_SECRET: envConfig.JWT_SECRET,
  // Email
  MAIL_HOST: envConfig.MAIL_HOST,
  MAIL_PORT: envConfig.MAIL_PORT,
  MAIL_USER: envConfig.MAIL_USER,
  MAIL_PASSWORD: envConfig.MAIL_PASSWORD,
  MAIL_FROM: envConfig.MAIL_FROM,
  // PSE
  PSE_API_URL: envConfig.PSE_API_URL,
  PSE_MERCHANT_ID: envConfig.PSE_MERCHANT_ID,
  PSE_API_KEY: envConfig.PSE_API_KEY,
  PSE_API_SECRET: envConfig.PSE_API_SECRET,
  PSE_RETURN_URL: envConfig.PSE_RETURN_URL,
  PSE_CALLBACK_URL: envConfig.PSE_CALLBACK_URL,
  // App
  APP_URL: envConfig.APP_URL,
};
