import { KiwiClient } from "../../../client";

import { 
    ButtonStyle,
    ComponentType,
    ButtonInteraction,
    EmbedBuilder,
    TextChannel
} from "discord.js";

import { env } from "../../../env";

import { Button } from "../../../types/component";

import { dataSource } from "../../../data/datasource";
import { GuildConfig } from "../../../data/entities/GuildConfig";
import { AuthUser } from "../../../data/entities/AuthUser";
import { Group } from "../../../data/entities/Group";
import { GroupMember } from "../../../data/entities/GroupMember";

import axios from "axios";
import { Events } from "../../../types/event";

/**
 * @type {Button}
 */
export const ApproveMember: Button = {
    config: {
        type: ComponentType.Button,
        custom_id: "approve-member",
        style: ButtonStyle.Primary,
        label: "Approve as Member"
    },
    
    /**
    * @param {ButtonInteraction} interaction
    * @param {Client} client
    */
    async execute(interaction: ButtonInteraction, client: KiwiClient) {
        interaction.deferUpdate();
        var userId = interaction.customId.split("_")[1];

        const GuildRepository = await dataSource.getRepository(GuildConfig);
        const AuthUserRepository = await dataSource.getRepository(AuthUser);
        const GroupRepository = await dataSource.getRepository(Group);
        const GroupMembersRepository = await dataSource.getRepository(GroupMember);
        var guild = await GuildRepository.findOne({ where: { guildId: interaction.guild.id } });
        var authUser = await AuthUserRepository.findOne({ where: { userId: userId } });

        var roles = new Array();

        if (!guild.memberRole) {
            interaction.followUp("Member role is not set in the dashboard")
            return;
        }
            
        roles.push(guild.memberRole);

        for (const g of await GroupMembersRepository.find({ where: { userId } })) {
            const group = await GroupRepository.findOne({ where: { groupId: g.groupId } });
            if (group) {
                roles.push(group.roleId);
            }
        }

        var guildMember = await interaction.guild.members.fetch(userId);
        if (guildMember) {
            await guildMember.roles.add(roles).catch(() => {});
        } else {
            await axios.put(
                `https://discord.com/api/guilds/${guild.guildId}/members/${userId}`, 
                {
                    access_token: authUser.accessToken,
                    roles: roles
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bot ${env.CLIENT_TOKEN}`
                    }
                }
            ).then((response) => {
                return response.data;
            }).catch((error) => {
                return null;
            });
        }

        var member = await interaction.guild.members.fetch(userId);
        if (!member) {
            interaction.followUp("Member didnt join the server");
            return;
        }

        client.emit(Events.GuildVerifiedAdd, interaction.guild, member, "member");
        
        await member.send(`You have been **verified** in **${interaction.guild.name}**`).catch(() => {});
        var message = await interaction.channel.messages.fetch(interaction.message.id);
        if (message) {
            await message.delete();
        }

        if (guild.logsChannel) {
            var log = await interaction.guild.channels.fetch(guild.logsChannel) as TextChannel;
            if (!log) return;

            var em = new EmbedBuilder()
                .setTitle("Approved Member")
                .setThumbnail(member.user.avatarURL())
                .setColor(0x90EE90)
                .addFields(
                    { name: "User", value: `<@${member.user.id}>\n${member.user.username}` },
                    { name: "Verified By", value: `<@${interaction.member.user.id}>\n${interaction.member.user.username}` },
                    { name: "Type", value: "Member" },
                )

            await log.send({
                embeds: [em]
            });
        }
    }
}