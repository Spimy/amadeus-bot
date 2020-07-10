
import { Message, EmbedFieldData, MessageEmbed } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';


@Command({
    name: 'announce',
    aliases: ['say'],
    description: [
        'Need annouce something and you want me to relay using an embed? I can do without embed if you don\'t need it.',
        'Add **2** empty spaces if you don\'t need a title for the embed.',
        '`colour` should be a hexadecimal string OR `RANDOM` (default).',
        '`EmbedFieldData[]` is an array of objects containing name, value, and inline surrounded by square brackets.',
        'Tip: Use an [embed visualiser service](https://leovoel.github.io/embed-visualizer/) to make it easier to write fields.'
    ].join('\n'),
    usage: '<description:string> | [title:string] | [embed:boolean] - [colour:hexString] - [fields:EmbedFieldData[]]',
    category: 'Admin',
    permissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length === 0) return false;

        const [description, title] = args.join(' ').split(' | ');
        const options = args.join(' ').split(' | ').slice(2).join(' ').split(' - ');

        if (typeof options[0] === 'undefined') options[0] = 'false';
        if (!['true', 'false'].includes(options[0].toLowerCase())) return false;

        const bool = options[0].toLowerCase() === 'true' ? true : false;
        await message.delete();

        if (!bool) {
            message.channel.send(description);
            return true;
        }

        const [hexString, fields] = options.slice(1);

        if (typeof hexString !== 'undefined' && !this.isHexString(hexString)) return false;
        if (typeof fields !== 'undefined' && !this.isValidData(fields)) return false;

        const colour = hexString !== undefined ? hexString.toUpperCase() : 'RANDOM';
        const data: EmbedFieldData[] = typeof fields !== 'undefined' ? JSON.parse(fields) : [];

        const thumbnail = message.author.displayAvatarURL({
            dynamic: false,
            format: 'png',
            size: 2048,
        });

        const embed = new MessageEmbed()
            .setTitle(title)
            .setThumbnail(thumbnail)
            .setDescription(description)
            .setColor(colour)
            .addFields(data)
            .setFooter(`Message by ${message.author.tag}`)
            .setTimestamp();

        message.channel.send(embed)

        return true;
    }

    private isValidData = (str: string) => {

        if (!str.startsWith('[') && !str.endsWith(']')) return false;

        let object: EmbedFieldData[];

        try {
            object = JSON.parse(str);
        } catch {
            return false;
        }

        if (!object.every(field => 'name' in field && 'value' in field)) return false;

        return true;

    }

    private isHexString = (str: string) => {
        return /^#[0-9A-F]{6}$/i.test(str) || str.toUpperCase() === 'RANDOM';
    }

}
