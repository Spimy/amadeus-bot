import { client } from '../../index';
import { Message } from 'discord.js';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

@Command({
    name: 'mute',
    description: 'You want to ducktape someone\'s mouth but could never do it before? Well, now you can!',
    usage: '<@user:MessageMentions|userID:string> <reason:string>',
    category: 'Admin',
    permissions: ['ADMINISTRATOR', 'MANAGE_ROLES', 'MUTE_MEMBERS']
})
default class implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        if (args.length < 2) return false;

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

        member.roles.add(muteRole!, reason).then(mutedMember => {
            message.channel.send(`Mute » \`${mutedMember.user.tag}\` has been muted by \`${message.author.tag}\`. Reason: \`${reason}\``);
        });

        return true;
    }

}
