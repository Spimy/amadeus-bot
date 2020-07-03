
import { client } from '../../index';
import { Message } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

@Command({
    name: 'unmute',
    description: [
        'You want to remove that ducktape you put on someone\'s mouth? Why though? :(',
        'Make sure the user has been muted before using this command!'
    ].join('\n'),
    usage: '<@user:MessageMentions|userID:string> [reason:string]',
    category: 'Admin',
    permissions: ['ADMINISTRATOR', 'MANAGE_ROLES', 'MUTE_MEMBERS']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length < 1) return false;

        const member = message.mentions.members?.first() || message.guild?.members.cache.get(args[0].toString());
        if (!member) return false;

        const reason = args.slice(1).join(' ');
        const memberRole = message.guild?.roles.cache.get(client.$config.memberRole);
        const muteRole = message.guild?.roles.cache.get(client.$config.muteRole);

        if (!muteRole) {
            message.guild?.roles.create({
                data: {
                    name: '-= Muted =-',
                    color: '#bdbdbd',
                    hoist: false,
                    position: memberRole?.position! + 1,
                    permissions: [],
                    mentionable: false
                },
                reason: 'No role for mutes found, hence this was created.',
            }).catch(console.error);
        }

        if (!member.roles.cache.get(muteRole!.id)) return false;

        member.roles.remove(muteRole!, reason).then(mutedMember => {
            message.channel.send(`Unmute » \`${mutedMember.user.tag}\` has been unmuted by \`${message.author.tag}\`.`);
        });

        return true;
    }

}
