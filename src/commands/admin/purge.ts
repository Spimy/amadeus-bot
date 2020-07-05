
import { Message, Collection } from 'discord.js';
import { OptionalStr } from '../../types';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';
import { client } from '../..';


enum PurgeOptions {
    any = 'any',
    match = 'match',
    notmatch = 'notmatch',
    startswith = 'startswith',
    endswith = 'endswith',
    links = 'links',
    invites = 'invites',
    images = 'images',
    bots = 'bots',
    mentions = 'mentions',
    embeds = 'embeds',
    text = 'text',
    target = 'target'
}

@Command({
    name: 'purge',
    aliases: ['prune'],
    description: [
        'Need to clean some messages in batch? This is the right command for you!',
        'You can only enter an amount up too `100` only due to discord\'s api limits.',
        'If no amount has been specified, it will default to deleting a single message.',
        'If no option has been selected, it will default to deleting any kind of message.',
        'You must provide `optionArg` if option selected is not `any`.',
        'Note: number of messages to delete excludes the command message and cannot delete messages older than 14 days.',
        '\`\`\`Options:',
        `${Object.keys(PurgeOptions).filter(option => isNaN(<any>option)).join(' | ')}\`\`\``
    ].join('\n'),
    usage: '[amount:number] [option:string] [optionArgument:string]',
    category: 'Admin',
    permissions: ['ADMINISTRATOR', 'MANAGE_MESSAGES']
})
default class implements CommandExecutor {

    private readonly discordInvite = /(https?:\/\/)?(www\.)?(discord)(?:app\.com\/invite|\.(gg|io|li|me))(\/)[a-z0-9]{1,256}/ig;

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length === 0) {
            message.channel.bulkDelete(2);
            return true;
        }

        if (args.length > 0) {

            if (isNaN(<any>args[0]) || parseInt(args[0]) < 1 || parseInt(args[0]) > 100) return false;
            await message.delete();

            const amount = parseInt(args[0]);
            const option: string = args[1] || PurgeOptions.any;
            const optionArg: OptionalStr = message.mentions.members?.first()?.id || args.slice(2).join(' ');

            if (option === PurgeOptions.any) {
                message.channel.bulkDelete(amount);
                return true;
            }

            if (!Object.keys(PurgeOptions).includes(option)) return false;

            const needArgs = [
                PurgeOptions.match,
                PurgeOptions.notmatch,
                PurgeOptions.startswith,
                PurgeOptions.endswith,
                PurgeOptions.target
            ];
            if (typeof optionArg === 'undefined' && needArgs.includes(<PurgeOptions>option)) return false;

            let filter: ((msg: Message) => boolean) = () => true;

            switch (option) {
                case PurgeOptions.match: filter = (msg: Message) => this.isMatch(msg, optionArg!); break;
                case PurgeOptions.notmatch: filter = (msg: Message) => !this.isMatch(msg, optionArg!); break;
                case PurgeOptions.startswith: filter = (msg: Message) => msg.content.startsWith(optionArg!); break;
                case PurgeOptions.endswith: filter = (msg: Message) => msg.content.endsWith(optionArg!); break;
                case PurgeOptions.links: filter = (msg: Message) => client.$urlRegex.test(msg.content); break;
                case PurgeOptions.invites: filter = (msg: Message) => this.discordInvite.test(msg.content); break;
                case PurgeOptions.images: filter = (msg: Message) => this.hasImage(msg); break;
                case PurgeOptions.bots: filter = (msg: Message) => msg.author.bot; break;
                case PurgeOptions.mentions: filter = (msg: Message) => msg.mentions.members ? true : false; break;
                case PurgeOptions.embeds: filter = (msg: Message) => msg.embeds.length > 0; break;
                case PurgeOptions.text: filter = (msg: Message) => msg.embeds.length === 0 && !this.hasImage(msg); break;
                case PurgeOptions.target: filter = (msg: Message) => msg.member?.id === optionArg; break;
            }

            const messages = await message.channel.messages.fetch({ limit: amount });
            const filtered = messages.filter(filter).array();

            const success = await message.channel.bulkDelete(filtered).then(() => true).catch(() => false);
            return success;

        }

        return true;

    }

    private isMatch = (message: Message, match: string) => {

        if (message.content.includes(match)) return true;

        if (message.embeds.length > 0) {
            for (const embed of message.embeds) {
                if (embed.description?.includes(match)) return true;
                if (embed.fields.some(field => field.name.includes(match) || field.value.includes(match))) return true;
            }
        }

        return false;

    }

    private hasImage = (message: Message): boolean => {

        if (message.attachments.size === 0) return false;

        for (const attachment of message.attachments.values()) {
            const ext = attachment.url.split('.').pop()?.toLowerCase();
            if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') return true;
        }

        return false;

    }

}
