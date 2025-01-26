const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const API_BASE_URL = process.env.API_BASE_URL;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event ketika bot menerima pesan
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!anime')) return;

    const args = message.content.slice(7).trim().split(' ');
    const command = args.shift().toLowerCase();

    try {
        if (command === 'search') {
            const query = args.join(' ');
            if (!query) {
                return message.reply('Silakan masukkan judul anime yang ingin dicari. Contoh: `!anime search yuru camp`');
            }
    
            try {
                const response = await axios.get(`${API_BASE_URL}/search`, {
                    params: { query }
                });
    
                const animes = response.data.data;
                if (!animes || animes.length === 0) {
                    return message.reply('Anime tidak ditemukan.');
                }
    
                
                const embeds = animes.map((anime) => {
                    const genres = anime.genres ? anime.genres.join(', ') : 'N/A';
    
                const description = `**Status**: ${anime.status}\n` +
                        `**Rating**: ${anime.rating}\n` +
                        `**Genres**: ${genres}\n` +
                        `**Anime ID**: ${anime.anime_id}\n` +
                        `**Nonton Disini**: [Klik untuk menonton](https://www.aninyan.com/anime/details/${anime.anime_id})`;
    
                const footerText = '🌀 Anime Bot | Powered by Aninyan';
    
                    return {
                        color: 0x0099ff,
                        title: anime.title,
                        description: description,
                        thumbnail: {
                            url: anime.image,
                        },
                        footer: {
                            text: footerText,
                        },
                        timestamp: new Date(),
                    };
                });
    
                await message.reply({ embeds });
    
            } catch (error) {
                console.error('Error saat memanggil API:', error.message);
                message.reply('Terjadi kesalahan saat mencari anime. Silakan coba lagi.');
            }
        }        
        
        
        if (command === 'details') {
            const id = args[0];
            if (!id) {
                return message.reply('Silakan masukkan ID anime untuk melihat detail. Contoh: `!anime details kami-game-ueteiru-sub-indo`');
            }
        
            try {
                const response = await axios.get(`${API_BASE_URL}/details/${id}`);
                const details = response.data.data;
        
                const episodes = response.data.episode_list || [];
                const filteredEpisodes = episodes.filter(episode => !episode.episode_id.includes('batch'));
        
                const episodeList = filteredEpisodes.length > 0 ? filteredEpisodes.map((episode, index) => {
                    return `**Episode ${filteredEpisodes.length - index}:** ${episode.episode_title}\n` +
                           `[Tonton Episode](https://www.aninyan.com/anime/episode/${episode.episode_id})\n` +
                           `*Tanggal: ${episode.episode_date}*\n\n`;
                }).join('') : 'Tidak ada episode yang tersedia.\n\n';
        
                
                const description = `**Judul**: ${details.title}\n` +
                                    `**Japanese**: ${details.japanese}\n` +
                                    `**Rating**: ${details.score}\n` +
                                    `**Genres**: ${details.genres.join(', ')}\n` +
                                    `**Status**: ${details.status}\n` +
                                    `**Sinopsis**: ${details.sinopsis}`;
        
                const embed = {
                    color: 0x0099ff,
                    title: details.main_title,
                    description: `${description}\n\n**🔶 Daftar Episode:**\n${episodeList}`,
                    thumbnail: {
                        url: details.image,
                    },
                    footer: {
                        text: '🌀 Anime Bot | Powered by Aninyan',
                    },
                    timestamp: new Date(),
                };
        
                await message.reply({ embeds: [embed] });
        
            } catch (error) {
                console.error('Error saat memanggil API:', error.message);
                message.reply('Terjadi kesalahan saat mengambil detail anime. Silakan coba lagi.');
            }
        }
        

        if (command === 'schedule') {
            try {
                const response = await axios.get(`${API_BASE_URL}/schedule`);
                const schedule = response.data.data;
        
                // Emoji untuk setiap hari
                const dayEmojis = {
                    "Senin": "📅",
                    "Selasa": "📅",
                    "Rabu": "📅",
                    "Kamis": "📅",
                    "Jumat": "📅",
                    "Sabtu": "📅",
                    "Minggu": "📅",
                    "Random": "📅"
                };
        
                for (const entry of schedule) {
                    if (!entry.anime || entry.anime.length === 0) {
                        await message.reply(`**${entry.day}**: Tidak ada anime yang dijadwalkan.`);
                        continue;
                    }
        
                    const animeTitles = entry.anime
                        .map((anime) => `• [${anime.title}](https://www.aninyan.com/anime/details/${anime.anime_id})`)
                        .join('\n');
        
                    const embed = {
                        color: 0x0099ff,
                        title: `${dayEmojis[entry.day]} **Jadwal Anime - ${entry.day}** ${dayEmojis[entry.day]}`,
                        description: animeTitles,
                        footer: {
                            text: '🌀 Anime Bot | Powered by Aninyan',
                        },
                        timestamp: new Date(),
                    };
        
                    await message.reply({ embeds: [embed] });
                }
            } catch (error) {
                console.error('Error saat memanggil API:', error.message);
                message.reply('Terjadi kesalahan saat mengambil jadwal anime. Silakan coba lagi.');
            }
        }
        
        
        
    } catch (error) {
        console.error(error);
        message.reply('Terjadi kesalahan. Silakan coba lagi.');
    }
});


client.login(process.env.DISCORD_TOKEN);

module.exports = (req, res) => {
    res.status(200).send('Bot is running!');
};