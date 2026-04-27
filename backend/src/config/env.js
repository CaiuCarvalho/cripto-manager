const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Blockchain APIs
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  moralisApiKey: process.env.MORALIS_API_KEY,
  solscanApiKey: process.env.SOLSCAN_API_KEY,

  // CoinGecko (optional)
  coingeckoApiKey: process.env.COINGECKO_API_KEY || null,

  // Email
  resendApiKey: process.env.RESEND_API_KEY,
};

// Validate required variables
const required = [
  'supabaseUrl',
  'supabaseAnonKey',
  'supabaseServiceRoleKey',
];

const missing = required.filter((key) => !env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. Check your .env file.`
  );
}

module.exports = env;
