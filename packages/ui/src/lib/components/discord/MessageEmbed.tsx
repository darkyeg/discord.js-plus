import type { PropsWithChildren, ReactNode } from 'react';
import { DiscordMessageEmbedAuthor, type IDiscordMessageEmbedAuthor } from './MessageEmbedAuthor.jsx';
import { DiscordMessageEmbedFooter, type IDiscordMessageEmbedFooter } from './MessageEmbedFooter.jsx';
import { DiscordMessageEmbedTitle, type IDiscordMessageEmbedTitle } from './MessageEmbedTitle.jsx';

export interface IDiscordMessageEmbed {
	author?: IDiscordMessageEmbedAuthor | undefined;
	authorNode?: ReactNode | undefined;
	footer?: IDiscordMessageEmbedFooter | undefined;
	footerNode?: ReactNode | undefined;
	title?: IDiscordMessageEmbedTitle | undefined;
	titleNode?: ReactNode | undefined;
}

export function DiscordMessageEmbed({
	author,
	authorNode,
	title,
	titleNode,
	children,
	footer,
	footerNode,
}: PropsWithChildren<IDiscordMessageEmbed>) {
	return (
		<div className="py-0.5" id="outer-embed-wrapper">
			<div className="border-l-blurple grid max-w-max rounded border-l-4 bg-[rgb(47_49_54)]" id="embed-wrapper">
				<div className="max-w-128">
					<div className="pt-2 pr-4 pb-4 pl-3">
						{author ? <DiscordMessageEmbedAuthor {...author} /> : authorNode ?? null}
						{title ? <DiscordMessageEmbedTitle {...title} /> : titleNode ?? null}
						{children ? <div className="mt-2 text-sm">{children}</div> : null}
						{footer ? <DiscordMessageEmbedFooter {...footer} /> : footerNode ?? null}
					</div>
				</div>
			</div>
		</div>
	);
}
