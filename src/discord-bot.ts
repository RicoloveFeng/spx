import { GuildMember, Message } from 'discord.js'
import * as fs from 'fs'
import { bugs, bugsPath, logPath } from '.'

export interface DiscordConfig {
	token: string,
	channel: string,
	role: string
}

export async function onMessage(config: DiscordConfig, message: Message) {
	try {
		message = await ensureMessage(message)

		if (message.channel.id !== config.channel || !message.member) {
			return
		}

		const member = await ensureMember(message.member)
		if (member.roles.cache.has(config.role)) {
			const content = message.content.trim()
			if (content.match(/MC-\d+ .*/i)) {
				const arr = content.split(' ')
				const id = arr[0]
				const desc = arr.slice(1).join(' ')
				bugs[id] = desc
				fs.writeFileSync(bugsPath, JSON.stringify(bugs, undefined, 4), { encoding: 'utf8' })
				fs.appendFileSync(logPath, `${id}\t${desc}\t${member.user.tag}\t${new Date().toUTCString()}\n`, { encoding: 'utf8' })
				await message.react('✅')
				return
			}
		}

		await message.react('❌')
	} catch (e) {
		console.error(e)
	}
}

async function ensureMessage(message: Message) {
	if (message.partial) {
		return message.fetch()
	}
	return message
}

async function ensureMember(member: GuildMember) {
	if (member.partial) {
		return member.fetch()
	}
	return member
}
