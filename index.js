import React, { memo, Suspense, useRef, useState } from 'react';
import { Button, Popover, Skeleton, Typography } from 'antd';
import striptags from 'striptags';
import reactStringReplace from 'react-string-replace';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

import Filter from './filter';

export default props => {
	const {
		editable = false,
		copyable = false,
		format = [],
		id,
		keywords = '',
		list = [],
		multiple = false,
		onChange,
		onCopy = () => {},
		poppable = false,
		richText,
		stripHTMLTags = false,
		...defaultProps
	} = props;

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell
						{...props}
						other={{
							copyable,
							editable,
							format,
							id,
							keywords,
							multiple,
							onChange,
							onCopy,
							poppable,
							richText,
							stripHTMLTags
						}}
					/>
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} id={id} list={list} />
				</Suspense>
			) : null
	};
};

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert, isPopupContent = false) => {
	const strip = stripHTMLTags ? striptags(toConvert) : toConvert;
	const replaceText = isPopupContent
		? strip.replace(
				new RegExp(keywords, 'g'),
				`<span key='${keywords}-${keywords.length}' style='background-color: yellow; font-weight: bold;'>${keywords}</span>`
		  )
		: reactStringReplace(strip, new RegExp('(' + keywords + ')', 'i'), (match, index) => {
				return (
					<span key={`${match}-${index}`} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>
						{match}
					</span>
				);
		  });

	return replaceText;
};

const Cell = memo(
	({
		row: { original },
		other: {
			copyable,
			editable,
			format,
			id,
			keywords,
			multiple,
			onChange,
			onCopy,
			poppable,
			richText,
			stripHTMLTags
		},
		value
	}) => {
		if (typeof value === 'undefined') return null;

		const [visible, setVisible] = useState(false);

		if (editable && !multiple && !richText) {
			const InputText = require('@volenday/input-text').default;
			const { Controller, useForm } = require('react-hook-form');

			const formRef = useRef();
			const originalValue = value;
			const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
			const onSubmit = values => onChange({ ...values, Id: original.Id });

			return (
				<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
					<Controller
						control={control}
						name={id}
						render={({ onChange, value, name }) => (
							<InputText
								format={format}
								id={name}
								onBlur={() =>
									originalValue !== value &&
									formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))
								}
								onChange={e => onChange(e.target.value)}
								onPressEnter={e => e.target.blur()}
								withLabel={false}
								value={value}
							/>
						)}
					/>
				</form>
			);
		}

		if (format.length !== 0) {
			const Cleave = require('cleave.js/react');

			let blocks = format.map(d => parseInt(d.characterLength)),
				delimiters = format.map(d => d.delimiter);
			delimiters.pop();

			return (
				<div>
					<Cleave
						disabled={true}
						options={{ delimiters, blocks }}
						value={value}
						style={{ border: 'none', backgroundColor: 'transparent' }}
					/>
				</div>
			);
		}

		const finalValue = stripHTMLTags
			? highlightsKeywords(keywords, (stripHTMLTags = true), value, false)
			: highlightsKeywords(keywords, (stripHTMLTags = false), value, false);

		return poppable ? (
			<Popover
				content={
					<>
						<div
							dangerouslySetInnerHTML={{
								__html: highlightsKeywords(keywords, (stripHTMLTags = false), value, true)
							}}
						/>
						<br />
						<Button onClick={() => setVisible(false)} type="Link">
							Close
						</Button>
					</>
				}
				trigger="click"
				visible={visible}
				onVisibleChange={() => setVisible(true)}
				placement="top"
				style={{ width: 350 }}>
				<Typography.Paragraph
					style={{ cursor: 'pointer', marginBottom: 0 }}
					copyable={copyable ? { onCopy: () => onCopy(finalValue, original) } : false}
					ellipsis={{ rows: 2 }}>
					{finalValue}
				</Typography.Paragraph>
			</Popover>
		) : (
			<Typography.Paragraph
				style={{ marginBottom: 0 }}
				copyable={copyable ? { onCopy: () => onCopy(striptags(value), original) } : false}
				ellipsis={{ rows: 2 }}>
				{finalValue}
			</Typography.Paragraph>
		);
	}
);
