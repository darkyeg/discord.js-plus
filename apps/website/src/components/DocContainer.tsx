import type {
	ApiItemJSON,
	TokenDocumentation,
	TypeParameterData,
	ApiClassJSON,
	ApiInterfaceJSON,
} from '@discordjs/api-extractor-utils';
import { Section } from '@discordjs/ui';
import type { ReactNode } from 'react';
import { Fragment, type PropsWithChildren } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import {
	VscSymbolClass,
	VscSymbolMethod,
	VscSymbolEnum,
	VscSymbolInterface,
	VscSymbolVariable,
	VscListSelection,
	VscSymbolParameter,
} from 'react-icons/vsc';
import { useMedia } from 'react-use';
import { HyperlinkedText } from './HyperlinkedText';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { TableOfContentItems } from './TableOfContentItems';
import { TypeParamTable } from './TypeParamTable';
import { TSDoc } from './tsdoc/TSDoc';

type DocContainerProps = PropsWithChildren<{
	excerpt: string;
	extendsTokens?: TokenDocumentation[] | null;
	implementsTokens?: TokenDocumentation[][];
	kind: string;
	methods?: ApiClassJSON['methods'] | ApiInterfaceJSON['methods'] | null;
	name: string;
	properties?: ApiClassJSON['properties'] | ApiInterfaceJSON['properties'] | null;
	subHeading?: ReactNode;
	summary?: ApiItemJSON['summary'];
	typeParams?: TypeParameterData[];
}>;

function generateIcon(kind: string) {
	const icons = {
		Class: <VscSymbolClass />,
		Method: <VscSymbolMethod />,
		Function: <VscSymbolMethod />,
		Enum: <VscSymbolEnum />,
		Interface: <VscSymbolInterface />,
		TypeAlias: <VscSymbolVariable />,
	};

	return icons[kind as keyof typeof icons];
}

export function DocContainer({
	name,
	kind,
	excerpt,
	summary,
	typeParams,
	children,
	extendsTokens,
	implementsTokens,
	methods,
	properties,
	subHeading,
}: DocContainerProps) {
	const matches = useMedia('(max-width: 768px)', true);

	return (
		<>
			<div className="flex flex-col gap-4">
				<h2 className="flex flex-row place-items-center gap-2 break-all text-2xl font-bold">
					<span>{generateIcon(kind)}</span>
					{name}
				</h2>
				{subHeading}
				<Section dense={matches} icon={<VscListSelection size={20} />} padded title="Summary">
					{summary ? <TSDoc node={summary} /> : <span>No summary provided.</span>}
					<div className="border-light-900 dark:border-dark-100 -mx-8 mt-6 border-t-2" />
				</Section>
				<SyntaxHighlighter code={excerpt} />
				{extendsTokens?.length ? (
					<div className="flex flex-row place-items-center gap-4">
						<h3 className="text-xl font-bold">Extends</h3>
						<span className="break-all font-mono">
							<HyperlinkedText tokens={extendsTokens} />
						</span>
					</div>
				) : null}
				{implementsTokens?.length ? (
					<div className="flex flex-row place-items-center gap-4">
						<h3 className="text-xl font-bold">Implements</h3>
						<span className="break-all font-mono">
							{implementsTokens.map((token, idx) => (
								<Fragment key={idx}>
									<HyperlinkedText tokens={token} />
									{idx < implementsTokens.length - 1 ? ', ' : ''}
								</Fragment>
							))}
						</span>
					</div>
				) : null}
				<div className="flex flex-col gap-4">
					{typeParams?.length ? (
						<Section
							defaultClosed
							dense={matches}
							icon={<VscSymbolParameter size={20} />}
							padded
							title="Type Parameters"
						>
							<TypeParamTable data={typeParams} />
						</Section>
					) : null}
					{children}
				</div>
			</div>
			{(kind === 'Class' || kind === 'Interface') && (methods?.length || properties?.length) ? (
				<aside className="dark:bg-dark-600 dark:border-dark-100 border-light-800 fixed top-[72px] right-0 bottom-0 z-20 hidden h-[calc(100vh_-_72px)] w-64 border-l bg-white pr-2 xl:block">
					<Scrollbars
						autoHide
						hideTracksWhenNotNeeded
						renderThumbVertical={(props) => <div {...props} className="dark:bg-dark-100 bg-light-900 z-30 rounded" />}
						renderTrackVertical={(props) => (
							<div {...props} className="absolute top-0.5 right-0.5 bottom-0.5 z-30 w-1.5 rounded" />
						)}
						universal
					>
						<TableOfContentItems methods={methods ?? []} properties={properties ?? []} />
					</Scrollbars>
				</aside>
			) : null}
		</>
	);
}
