
import { Message } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

@Command({
    name: 'unban',
    description: [
        'Wish to forgive someone for their sins? Lift the ban hammer casted upon the user!',
        'Make sure the user has been banned before using this command!'
    ].join('\n'),
    usage: '<userID:string> [reason:string]',
    category: 'Moderation',
    permissions: ['ADMINISTRATOR', 'BAN_MEMBERS', 'KICK_MEMBERS']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length < 1) return false;

        const user = args[0].toString();
        if (!user) return false;
        const reason = args.slice(1).join(' ');

        message.guild!.members.unban(user, reason)
            .then(unbannedUser => {
                message.channel.send(`Unban » \`${unbannedUser.tag}\` has been unbanned by \`${message.author.tag}\``);
            })
            .catch(() => {
                message.channel.send('Unban » The userID provided cannot be found or has not been banned.');
            });

        return true;
    }

}
