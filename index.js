import React, { memo, Suspense, useRef, useState } from 'react';
import { Button, Popover, Skeleton, Typography } from 'antd';
import striptags from 'striptags';
import reactStringReplace from 'react-string-replace';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

import Filter from './filter';

export default props => {
	const {
		keywords = '',
		editable = false,
		stripHTMLTags = false,
		copyable = false,
		format = [],
		id,
		list = [],
		multiple = false,
		onChange,
		onCopy = () => {},
		richText,
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

const highlightsKeywords = (keywords, stripHTMLTags = false, toConvert) => {
	const strip = stripHTMLTags ? striptags(toConvert) : toConvert;
	const replaceText = reactStringReplace(strip, new RegExp('(' + keywords + ')', 'gi'), (match, index) => {
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
		column,
		row: { original },
		other: { copyable, editable, format, id, keywords, multiple, onChange, onCopy, richText, stripHTMLTags },
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
			? highlightsKeywords(keywords, (stripHTMLTags = true), value)
			: highlightsKeywords(keywords, (stripHTMLTags = false), value);

		return finalValue.length >= 90 ? (
			<div>
				<Popover
					content={
						<>
							<div dangerouslySetInnerHTML={{ __html: value }} />
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
						style={{
							cursor: 'pointer',
							width: column.width ? column.width - 30 : '100'
						}}
						copyable={copyable ? { onCopy: () => onCopy(finalValue, original) } : false}
						ellipsis={true}>
						{finalValue}
					</Typography.Paragraph>
				</Popover>
			</div>
		) : (
			<Typography.Text copyable={copyable ? { onCopy: () => onCopy(finalValue, original) } : false}>
				{finalValue}
			</Typography.Text>
		);
	}
);
