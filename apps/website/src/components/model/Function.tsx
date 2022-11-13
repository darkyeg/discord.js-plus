import type { ApiFunctionJSON } from '@discordjs/api-extractor-utils';
import { Menu, MenuButton, MenuItem, useMenuState } from 'ariakit';
import { useState } from 'react';
import { VscChevronDown, VscVersions } from 'react-icons/vsc';
import { DocContainer } from '../DocContainer';
import { ParametersSection } from '../Sections';

export function Function({ data }: { data: ApiFunctionJSON }) {
	const [overloadIndex, setOverloadIndex] = useState(1);
	const overloadedData = data.mergedSiblings[overloadIndex - 1]!;
	const menu = useMenuState({ gutter: 8, sameWidth: true, fitViewport: true });

	return (
		<DocContainer
			excerpt={overloadedData.excerpt}
			kind={overloadedData.kind}
			name={`${overloadedData.name}${
				overloadedData.overloadIndex && overloadedData.overloadIndex > 1 ? ` (${overloadedData.overloadIndex})` : ''
			}`}
			subHeading={
				data.mergedSiblings.length > 1 ? (
					<div className="flex flex-row place-items-center gap-2">
						<MenuButton
							className="bg-light-600 hover:bg-light-700 active:bg-light-800 dark:bg-dark-600 dark:hover:bg-dark-500 dark:active:bg-dark-400 focus:ring-width-2 focus:ring-blurple rounded p-3 outline-0 focus:ring"
							state={menu}
						>
							<div className="flex flex-row place-content-between place-items-center gap-2">
								<VscVersions size={20} />
								<div>
									<span className="font-semibold">{`Overload ${overloadIndex}`}</span>
									{` of ${data.mergedSiblings.length}`}
								</div>
								<VscChevronDown
									className={`transform transition duration-150 ease-in-out ${menu.open ? 'rotate-180' : 'rotate-0'}`}
									size={20}
								/>
							</div>
						</MenuButton>
						<Menu
							className="dark:bg-dark-600 border-light-800 dark:border-dark-100 focus:ring-width-2 focus:ring-blurple z-20 flex flex-col rounded border bg-white p-1 outline-0 focus:ring"
							state={menu}
						>
							{data.mergedSiblings.map((_, idx) => (
								<MenuItem
									className="hover:bg-light-700 active:bg-light-800 dark:bg-dark-600 dark:hover:bg-dark-500 dark:active:bg-dark-400 focus:ring-width-2 focus:ring-blurple my-0.5 cursor-pointer rounded bg-white p-3 text-sm outline-0 focus:ring"
									key={idx}
									onClick={() => setOverloadIndex(idx + 1)}
								>
									{`Overload ${idx + 1}`}
								</MenuItem>
							))}
						</Menu>
					</div>
				) : null
			}
			summary={overloadedData.summary}
			typeParams={overloadedData.typeParameters}
		>
			<ParametersSection data={overloadedData.parameters} />
		</DocContainer>
	);
}
