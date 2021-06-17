import React, { memo, Suspense, useRef, useState } from 'react';
import { Button, Popover, Skeleton, Typography } from 'antd';
import striptags from 'striptags';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

import Filter from './filter';

export default props => {
	const {
		editable = false,
		stripHTMLTags = false,
		format = [],
		id,
		list = [],
		multiple = false,
		onChange,
		richText,
		...defaultProps
	} = props;

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ editable, format, id, multiple, onChange, richText, stripHTMLTags }} />
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

const Cell = memo(
	({
		column,
		row: { original },
		other: { editable, format, id, multiple, onChange, richText, stripHTMLTags },
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

		const finalValue = stripHTMLTags ? striptags(value) : value;

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
						ellipsis={true}>
						{finalValue}
					</Typography.Paragraph>
				</Popover>
			</div>
		) : (
			finalValue
		);
	}
);
