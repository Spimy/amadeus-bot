
import { Message } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

@Command({
    name: 'ban',
    description: 'Pesky people doing pesky things? Unleash the ban hammer and forever forbid from entering this real ever again!',
    usage: '<@user:MessageMentions|userID:string> <reason:string> [days:number]',
    category: 'Moderation',
    permissions: ['ADMINISTRATOR', 'BAN_MEMBERS', 'KICK_MEMBERS']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length < 2) return false;

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0].toString());
        if (!member) return false;

        let reason = args.slice(1).join(' ');
        const days = parseInt(reason[reason.length - 1]) || 0;
        if (days !== 0) reason = reason.slice(0, reason.length - 2);

        member.ban({ reason, days }).then(bannedMember => {

            const msg = [
                `Ban » \`${bannedMember.user.tag}\` has been banned from this realm by \`${message.author.tag}\` ${days === 0 ? '' : `for ${days}`} days.`,
                `Reason: \`${reason}\``
            ].join(' ');

            message.channel.send(msg);
        });

        return true;
    }

}
