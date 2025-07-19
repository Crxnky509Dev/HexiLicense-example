const { Client, GatewayIntentBits } = require('discord.js');
const HexiLicense = require('hexi-license');

// Initialize the HexiLicense client with your API key
const hexi = new HexiLicense({
  apiKey: '596507c8f8a89f0d32014e35b6c4ba49e290590c1dab10a681b61f1ce80877cd',
  baseUrl: 'https://dashboard.hexilicense.xyz/api' // Optional: Custom API URL
});

// Initialize the Discord client with necessary intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Your bot's prefix
const prefix = '!';

// When the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for messages to handle commands
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;  // Ignore bot messages

  // Command handling (example: !generate, !check, !revoke)
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case 'generate':
          // Generate a new license (Example: !generate productId userId duration)
          const productId = args[0];
          const userId = args[1];
          const duration = parseInt(args[2], 10);

          const license = await hexi.generateLicense({
            productId,
            userId,
            duration
          });
          message.channel.send(`License generated: ${JSON.stringify(license)}`);
          break;

        case 'check':
          // Check a license (Example: !check licenseKey)
          const licenseKey = args[0];
          const check = await hexi.checkLicense(licenseKey);
          message.channel.send(`License check: ${JSON.stringify(check)}`);
          break;

        case 'revoke':
          // Revoke a license (Example: !revoke licenseKey)
          const revokeKey = args[0];
          await hexi.revokeLicense(revokeKey);
          message.channel.send('License revoked.');
          break;

        case 'list':
          // List licenses (Example: !list productId)
          const listProductId = args[0];
          const licenses = await hexi.listLicenses({ productId: listProductId });
          message.channel.send(`Licenses: ${JSON.stringify(licenses)}`);
          break;

        case 'info':
          // Get license info (Example: !info licenseKey)
          const licenseInfoKey = args[0];
          const licenseInfo = await hexi.getLicenseInfo(licenseInfoKey);
          message.channel.send(`License info: ${JSON.stringify(licenseInfo)}`);
          break;

        default:
          message.channel.send('Unknown command.');
      }
    } catch (error) {
      console.error(error);
      message.channel.send(`An error occurred: ${error.message}`);
    }
  }
});

// Log in to Discord using your bot's token
client.login('MTM5NTUyMTAyNzAzMDY0Njg2NQ.GS7AK9.WfqdCDp0LUA6_nevnzzCYwwTlgyMHDe1nHC0fg');
