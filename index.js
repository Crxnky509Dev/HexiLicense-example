require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const HexiLicense = require('hexi-license');

// Initialize HexiLicense client
const hexi = new HexiLicense({
  apiKey: 'Your API Key here',
  baseUrl: 'https://dashboard.hexilicense.xyz/api',
});

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prefix = '!';

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  try {
    switch (command) {
      case 'generate': {
        const [productId, userId, duration] = args;
        if (!productId || !userId || isNaN(parseInt(duration)))
          return message.reply('Usage: `!generate <productId> <userId> <duration>`');

        const license = await hexi.generateLicense({ productId, userId, duration });
        return message.reply(`✅ License generated: \`${license.key}\``);
      }

      case 'check': {
        const [licenseKey] = args;
        if (!licenseKey) return message.reply('Usage: `!check <licenseKey>`');

        const check = await hexi.checkLicense(licenseKey);
        return message.reply(`🔍 Valid: \`${check.valid}\`\nMessage: ${check.message}`);
      }

      case 'revoke': {
        const [licenseKey] = args;
        if (!licenseKey) return message.reply('Usage: `!revoke <licenseKey>`');

        await hexi.revokeLicense(licenseKey);
        return message.reply('❌ License revoked.');
      }

      case 'list': {
        const [productId] = args;
        const licenses = await hexi.listLicenses({ productId });

        const embed = new EmbedBuilder()
          .setTitle('📋 License List')
          .setDescription(licenses.map(l => `• \`${l.key}\` - ${l.userId}`).join('\n') || 'No licenses found.')
          .setColor('Blue');

        return message.channel.send({ embeds: [embed] });
      }

      case 'info': {
        const [licenseKey] = args;
        if (!licenseKey) return message.reply('Usage: `!info <licenseKey>`');

        const info = await hexi.getLicenseInfo(licenseKey);
        return message.reply(`ℹ️ Product ID: \`${info.productId}\`\nUser ID: \`${info.userId}\`\nActive: \`${info.active}\``);
      }

      default:
        return message.reply('❓ Unknown command.');
    }
  } catch (err) {
    console.error(err);
    return message.reply(`❗ Error: ${err.message}`);
  }
});

// Login to Discord
client.login(process.env.Token);
