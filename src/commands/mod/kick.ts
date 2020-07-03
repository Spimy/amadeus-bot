
import { Message } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

@Command({
    name: 'kick',
    description: 'Kick people out like kicking students out of school! Wait... isn\'t that a good thing, to be kicked out?',
    usage: '<@user:MessageMentions|userID:string> <reason:string>',
    category: 'Moderation',
    permissions: ['ADMINISTRATOR', 'KICK_MEMBERS']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length < 2) return false;

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0].toString());
        if (!member) return false;

        const reason = args.slice(1).join(' ');

        member.kick(reason).then(kickedMember => {
            message.channel.send([
                `Kick » \`${kickedMember.user.tag}\` has been kicked out by \`${message.author.tag}\`!.`,
                `Reason: \`${reason}\``
            ].join(' '));
        });

        return true;
    }

}
