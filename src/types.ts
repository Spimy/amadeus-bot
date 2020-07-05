import { ClientEvents } from 'discord.js';
import { Music } from './lib/music/Music';

type EventType = keyof ClientEvents;
type Pages = Music[][];
type OptionalStr = string | undefined;

export {
    EventType,
    Pages,
    OptionalStr
}