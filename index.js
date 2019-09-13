import React from 'react';
import Cleave from 'cleave.js/react';
import InputText from '@volenday/input-text';
import striptags from 'striptags';

export default props => {
	const {
		editable = false,
		stripHTMLTags = false,
		format = [],
		headerStyle = {},
		id,
		multiple = false,
		onChange,
		richText,
		onChangeText,
		style = {},
		...defaultProps
	} = props;

	return {
		...defaultProps,
		style: { ...style, display: 'flex', alignItems: 'center' },
		headerStyle: { ...headerStyle, display: 'flex', alignItems: 'center' },
		Cell: ({ index, original, value }) => {
			if (editable && !multiple && !richText) {
				if (format.length != 0) {
					let blocks = format.map(d => parseInt(d.characterLength)),
						delimiters = format.map(d => d.delimiter);
					delimiters.pop();
					return (
						<Cleave
							autoComplete="off"
							class="form-control"
							onBlur={e => onChange({ Id: original.Id, [id]: e.target.rawValue })}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									onChange({ Id: original.Id, [id]: e.target.rawValue });
									e.target.blur();
								}
								return;
							}}
							options={{ delimiters, blocks }}
							value={value ? value : ''}
						/>
					);
				} else {
					return (
						<InputText
							id={id}
							onBlur={e => onChange({ Id: original.Id, [id]: e.target.value })}
							onChange={(field, value) => onChangeText(index, field, value)}
							onPressEnter={e => onChange({ Id: original.Id, [id]: e.target.value })}
							withLabel={false}
							value={value}
						/>
					);
				}
			} else {
				if (format.length != 0) {
					let blocks = format.map(d => parseInt(d.characterLength)),
						delimiters = format.map(d => d.delimiter);
					delimiters.pop();
					return (
						<Cleave
							disabled={true}
							options={{ delimiters, blocks }}
							value={value}
							style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}
						/>
					);
				}
				return <span>{stripHTMLTags ? striptags(value) : value}</span>;
			}
		},
		Filter: ({ filter, onChange }) => {
			return (
				<input
					type="text"
					class="form-control"
					onChange={e => onChange(e.target.value)}
					value={filter ? filter.value : ''}
					placeholder="Search..."
				/>
			);
		}
	};
};
